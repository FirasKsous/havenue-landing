#!/usr/bin/env node

import { constants } from 'node:fs'
import { access, readFile, readdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptFilePath = fileURLToPath(import.meta.url)
const scriptsDirectory = path.dirname(scriptFilePath)
const appRoot = process.env.LAUNCH_PREFLIGHT_APP_ROOT
  ? path.resolve(process.env.LAUNCH_PREFLIGHT_APP_ROOT)
  : path.resolve(scriptsDirectory, '..')
const packageJsonPath = path.join(appRoot, 'package.json')

const SHIPPING_FILE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.html',
  '.css',
  '.json',
])

const IGNORE_DIRECTORY_NAMES = new Set([
  '.git',
  'dist',
  'docs',
  'node_modules',
  'screenshots',
])

const POLICY_ROUTE_PATTERN = /\/(privacy-policy|cookie-policy|marketing-policy|terms-of-service|gdpr)(?=(?:['"`/)]|\s|$))/g
const BRANDING_PATTERN = /\bCateringOS\b|\bCatering OS\b/
const FALLBACK_SECRET_PATTERNS = [
  { label: 'Stripe test secret fallback', regex: /sk_test_[A-Za-z0-9]+/ },
  { label: 'Stripe webhook secret fallback', regex: /whsec_[A-Za-z0-9]+/ },
  { label: 'Loops API key fallback', regex: /f35b17ff44cf89096995393be7e431d8/ },
  { label: 'Resend sandbox sender fallback', regex: /onboarding@resend\.dev/ },
  { label: 'Hardcoded Supabase project fallback', regex: /hnhvrqsdxjnulfuvwmbk\.supabase\.co/ },
]

const findings = []
const passes = []

async function main() {
  const packageJson = await readJson(packageJsonPath)

  const appShippingFiles = await collectShippingFiles(appRoot, [
    'index.html',
    'public',
    'src',
  ])
  const shippingFunctionFiles = await collectShippingFiles(appRoot, ['supabase/functions'])

  checkCommandAvailability(packageJson)
  await checkDeadPolicyRoutes(appShippingFiles)
  await checkPlaceholderPrivacyLink()
  await checkBrandingStrings([...appShippingFiles, ...shippingFunctionFiles])
  await checkFallbackSecrets(shippingFunctionFiles)
  await checkCredentialBearingGitRemotes()

  if (findings.length === 0) {
    await runRequiredPackageScripts()
  }

  printReport()

  if (findings.length > 0) {
    process.exitCode = 1
  }
}

async function runRequiredPackageScripts() {
  const requiredScripts = ['build', 'lint', 'test']

  for (const scriptName of requiredScripts) {
    await runPackageScript(scriptName)
    addPass(`Package script succeeded: ${scriptName}`)
  }
}

function runPackageScript(scriptName) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  return runProcess(npmCommand, ['run', scriptName], { inheritStdio: true }).then((result) => {
    if (result.exitCode === 0) {
      return
    }

    throw new Error(`Package script failed: ${scriptName} (exit ${result.exitCode ?? 'unknown'})`)
  })
}

function runProcess(command, args, options = {}) {
  const { inheritStdio = false } = options

  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: appRoot,
      stdio: inheritStdio ? 'inherit' : ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })

    let stdout = ''

    if (!inheritStdio) {
      childProcess.stdout?.on('data', (chunk) => {
        stdout += chunk.toString()
      })
    }

    childProcess.on('error', reject)
    childProcess.on('exit', (code) => {
      resolve({ exitCode: code, stdout })
    })
  })
}

function maskCredentialBearingRemote(remoteLine) {
  return remoteLine.replace(/https:\/\/([^\s/@]+)(?::([^\s@]+))?@/u, (_match, username, password) => {
    const maskedUser = username ? `${username.slice(0, 2)}***` : '***'
    const maskedPassword = password ? ':***' : ''
    return `https://${maskedUser}${maskedPassword}@`
  })
}

function checkCommandAvailability(packageJson) {
  const scripts = packageJson?.scripts ?? {}
  const requiredScripts = ['build', 'lint', 'test']
  const missingScripts = requiredScripts.filter((name) => typeof scripts[name] !== 'string' || scripts[name].trim() === '')

  if (missingScripts.length > 0) {
    addFinding(
      'Required package scripts are missing from cateringos-landing/package.json.',
      missingScripts.map((name) => `Missing script: ${name}`)
    )
    return
  }

  addPass(`Required package scripts are available: ${requiredScripts.join(', ')}`)
}

async function checkDeadPolicyRoutes(files) {
  const referencedRoutes = new Map()

  for (const filePath of files) {
    const content = await readText(filePath)
    const lines = content.split(/\r?\n/)

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      const matches = line.matchAll(POLICY_ROUTE_PATTERN)

      for (const match of matches) {
        const routeName = match[1]
        const routePath = `/${routeName}`
        const locations = referencedRoutes.get(routePath) ?? []
        locations.push(`${toRelativeAppPath(filePath)}:${index + 1}`)
        referencedRoutes.set(routePath, locations)
      }
    }
  }

  if (referencedRoutes.size === 0) {
    addPass('No policy routes are referenced from shipping landing-page files.')
    return
  }

  const deadRouteMessages = []

  for (const [routePath, locations] of referencedRoutes.entries()) {
    const routeName = routePath.replace(/^\//, '')
    const candidates = [
      path.join(appRoot, routeName, 'index.html'),
      path.join(appRoot, `${routeName}.html`),
      path.join(appRoot, 'public', routeName, 'index.html'),
      path.join(appRoot, 'public', `${routeName}.html`),
    ]

    const existingCandidate = await findExistingPath(candidates)
    if (!existingCandidate) {
      deadRouteMessages.push(
        `${routePath} is referenced at ${locations.join(', ')} but none of these static files exist: ${candidates
          .map((candidate) => toRelativeAppPath(candidate))
          .join(', ')}`
      )
    }
  }

  if (deadRouteMessages.length > 0) {
    addFinding('Dead policy routes are still referenced from shipping landing-page files.', deadRouteMessages)
    return
  }

  addPass('Referenced policy routes resolve to static files inside cateringos-landing/.')
}

async function checkPlaceholderPrivacyLink() {
  const cookieConsentPath = path.join(appRoot, 'src/components/modals/CookieConsent.tsx')
  const content = await readText(cookieConsentPath)
  const lines = content.split(/\r?\n/)
  const placeholderPrivacyLinkPattern = /<a[\s\S]{0,200}?href="#"[\s\S]{0,200}?Privacy Policy/
  const hasPrivacyLabel = content.includes('Privacy Policy')

  if (!hasPrivacyLabel) {
    addPass('Cookie consent privacy link text is not present, so no placeholder privacy link was detected there.')
    return
  }

  const offendingLines = []
  if (placeholderPrivacyLinkPattern.test(content)) {
    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].includes('href="#"')) {
        offendingLines.push(`${toRelativeAppPath(cookieConsentPath)}:${index + 1}`)
      }
    }
  }

  if (offendingLines.length > 0) {
    addFinding('Cookie consent still contains a placeholder privacy-policy link.', offendingLines)
    return
  }

  addPass('Cookie consent does not use a placeholder privacy-policy href.')
}

async function checkBrandingStrings(files) {
  const matches = []

  for (const filePath of files) {
    const relativePath = toRelativeAppPath(filePath)
    if (relativePath.includes('__tests__/') || /\.(test|spec)\.[^.]+$/u.test(relativePath)) {
      continue
    }

    const content = await readText(filePath)
    const lines = content.split(/\r?\n/)

    for (let index = 0; index < lines.length; index += 1) {
      if (!BRANDING_PATTERN.test(lines[index])) {
        continue
      }

      matches.push(`${relativePath}:${index + 1}: ${lines[index].trim()}`)
    }
  }

  if (matches.length > 0) {
    addFinding('Lingering CateringOS brand strings remain in shipping landing-page files.', matches)
    return
  }

  addPass('No lingering CateringOS brand strings were found in shipping landing-page files.')
}

async function checkFallbackSecrets(files) {
  const matches = []

  for (const filePath of files) {
    const content = await readText(filePath)
    const lines = content.split(/\r?\n/)
    const relativePath = toRelativeAppPath(filePath)

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]

      for (const pattern of FALLBACK_SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          matches.push(`${relativePath}:${index + 1}: ${pattern.label}`)
        }
      }
    }
  }

  if (matches.length > 0) {
    addFinding('Known hardcoded fallback secret patterns remain in shipping Supabase function files.', matches)
    return
  }

  addPass('No known hardcoded fallback secret patterns were found in shipping Supabase function files.')
}

async function checkCredentialBearingGitRemotes() {
  const gitRemoteResult = await runProcess('git', ['remote', '-v'])

  if (gitRemoteResult.exitCode !== 0) {
    addPass('Git remote credential scan skipped because the current app root is not inside an initialized git repository.')
    return
  }

  const remoteLines = gitRemoteResult.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const credentialBearingRemotes = remoteLines.filter((line) => /https:\/\/[^\s/@]+(?::[^\s@]+)?@/u.test(line))

  if (credentialBearingRemotes.length > 0) {
    addFinding(
      'Credential-bearing git remotes remain configured and must be handled as a manual blocker.',
      credentialBearingRemotes.map(maskCredentialBearingRemote),
    )
    return
  }

  addPass('No credential-bearing git remotes were detected from the current repository context.')
}

async function collectShippingFiles(rootPath, relativeEntries) {
  const collectedFiles = []

  for (const relativeEntry of relativeEntries) {
    const absoluteEntry = path.join(rootPath, relativeEntry)
    if (!(await pathExists(absoluteEntry))) {
      continue
    }

    const stats = await readdirOrNull(absoluteEntry)
    if (stats) {
      const nestedFiles = await walkDirectory(absoluteEntry)
      collectedFiles.push(...nestedFiles)
      continue
    }

    if (SHIPPING_FILE_EXTENSIONS.has(path.extname(absoluteEntry)) && isShippingRuntimeFile(absoluteEntry)) {
      collectedFiles.push(absoluteEntry)
    }
  }

  return collectedFiles.sort()
}

async function walkDirectory(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const nestedFiles = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue
    }

    const absolutePath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      if (IGNORE_DIRECTORY_NAMES.has(entry.name)) {
        continue
      }

      nestedFiles.push(...(await walkDirectory(absolutePath)))
      continue
    }

    if (SHIPPING_FILE_EXTENSIONS.has(path.extname(entry.name)) && isShippingRuntimeFile(absolutePath)) {
      nestedFiles.push(absolutePath)
    }
  }

  return nestedFiles
}

function readdirOrNull(targetPath) {
  return readdir(targetPath).then(
    () => true,
    () => false
  )
}

function isShippingRuntimeFile(filePath) {
  const fileName = path.basename(filePath)

  return !(/(?:^|\.)test\.[^.]+$/u.test(fileName)
    || /(?:^|\.)spec\.[^.]+$/u.test(fileName)
    || fileName.endsWith('_test.ts')
    || fileName.endsWith('_test.tsx'))
}

async function findExistingPath(candidatePaths) {
  for (const candidatePath of candidatePaths) {
    if (await pathExists(candidatePath)) {
      return candidatePath
    }
  }

  return null
}

async function pathExists(targetPath) {
  try {
    await access(targetPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath))
}

async function readText(filePath) {
  return readFile(filePath, 'utf8')
}

function toRelativeAppPath(filePath) {
  return path.relative(appRoot, filePath).split(path.sep).join('/')
}

function addPass(message) {
  passes.push(message)
}

function addFinding(summary, details) {
  findings.push({ summary, details })
}

function printReport() {
  const statusLabel = findings.length === 0 ? 'PASSED' : 'FAILED'
  const output = findings.length === 0 ? console.log : console.error

  output(`\nLaunch preflight ${statusLabel} for ${path.basename(appRoot)}\n`)

  for (const message of passes) {
    console.log(`✓ ${message}`)
  }

  if (findings.length === 0) {
    console.log('\nNo blocking findings detected.')
    return
  }

  console.error(`\nBlocking findings: ${findings.length}`)

  for (const finding of findings) {
    console.error(`\n- ${finding.summary}`)
    for (const detail of finding.details) {
      console.error(`  • ${detail}`)
    }
  }
}

try {
  await main()
} catch (error) {
  console.error('\nLaunch preflight FAILED due to an unexpected script error.\n')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
