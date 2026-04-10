// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const currentFilePath = fileURLToPath(import.meta.url)
const scriptsDirectory = path.dirname(path.dirname(currentFilePath))
const scriptPath = path.join(scriptsDirectory, 'preflight-launch.mjs')

async function createFixtureApp({ lintFails = false } = {}) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'preflight-launch-'))

  await mkdir(path.join(tempRoot, 'src/components/modals'), { recursive: true })
  await mkdir(path.join(tempRoot, 'public/privacy-policy'), { recursive: true })
  await mkdir(path.join(tempRoot, 'supabase/functions'), { recursive: true })

  await writeFile(
    path.join(tempRoot, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture-app',
        private: true,
        scripts: {
          build: "node -e \"require('node:fs').appendFileSync('command-log.txt', 'build\\n')\"",
          lint: lintFails
            ? "node -e \"require('node:fs').appendFileSync('command-log.txt', 'lint\\n'); process.exit(1)\""
            : "node -e \"require('node:fs').appendFileSync('command-log.txt', 'lint\\n')\"",
          test: "node -e \"require('node:fs').appendFileSync('command-log.txt', 'test\\n')\"",
        },
      },
      null,
      2,
    ),
  )

  await writeFile(path.join(tempRoot, 'index.html'), '<!doctype html><title>Havenue</title>')
  await writeFile(
    path.join(tempRoot, 'src/components/modals/CookieConsent.tsx'),
    '<a href="/privacy-policy">Privacy Policy</a>',
  )
  await writeFile(path.join(tempRoot, 'public/privacy-policy/index.html'), '<!doctype html><title>Privacy</title>')

  return tempRoot
}

async function addSupabaseTestFixture(appRoot) {
  await mkdir(path.join(appRoot, 'supabase/functions/_shared'), { recursive: true })
  await writeFile(
    path.join(appRoot, 'supabase/functions/_shared/resend_test.ts'),
    "assertNotMatch(markup, /CateringOS/u)\n",
  )
}

async function runPreflightAgainstFixture(appRoot) {
  return execFileAsync(process.execPath, [scriptPath], {
    cwd: appRoot,
    env: {
      ...process.env,
      LAUNCH_PREFLIGHT_APP_ROOT: appRoot,
    },
  })
}

describe('launch preflight CLI', () => {
  it('runs build, lint, and test when the repo-scoped scans are clean', async () => {
    const appRoot = await createFixtureApp()

    try {
      await runPreflightAgainstFixture(appRoot)

      const commandLog = await readFile(path.join(appRoot, 'command-log.txt'), 'utf8')
      expect(commandLog.trim().split('\n')).toEqual(['build', 'lint', 'test'])
    } finally {
      await rm(appRoot, { recursive: true, force: true })
    }
  }, 15000)

  it('stops before test when an earlier package command fails', async () => {
    const appRoot = await createFixtureApp({ lintFails: true })

    try {
      await expect(runPreflightAgainstFixture(appRoot)).rejects.toMatchObject({
        code: expect.any(Number),
      })

      const commandLog = await readFile(path.join(appRoot, 'command-log.txt'), 'utf8')
      expect(commandLog.trim().split('\n')).toEqual(['build', 'lint'])
    } finally {
      await rm(appRoot, { recursive: true, force: true })
    }
  }, 15000)

  it('ignores Supabase test files when scanning for launch blockers', async () => {
    const appRoot = await createFixtureApp()
    await addSupabaseTestFixture(appRoot)

    try {
      await runPreflightAgainstFixture(appRoot)

      const commandLog = await readFile(path.join(appRoot, 'command-log.txt'), 'utf8')
      expect(commandLog.trim().split('\n')).toEqual(['build', 'lint', 'test'])
    } finally {
      await rm(appRoot, { recursive: true, force: true })
    }
  }, 15000)
})
