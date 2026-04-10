/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

function readPolicyPage(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

describe('static legal policy pages', () => {
  it('privacy policy is populated with approved Havenue legal identity details', () => {
    const privacyPolicy = readPolicyPage('public/privacy-policy/index.html')

    expect(privacyPolicy).toContain('Havenue LLC')
    expect(privacyPolicy).toContain('DIFC Free Zone, Dubai, UAE')
    expect(privacyPolicy).toContain('contact@havenue.co')
    expect(privacyPolicy).toContain('Address placeholder')
    expect(privacyPolicy).not.toContain('Final policy content is intentionally pending')
  })

  it('cookie policy explains consent categories and the current consent gate', () => {
    const cookiePolicy = readPolicyPage('public/cookie-policy/index.html')

    expect(cookiePolicy).toContain('essential cookies')
    expect(cookiePolicy).toContain('analytics cookies')
    expect(cookiePolicy).toContain('marketing emails')
    expect(cookiePolicy).toContain('contact@havenue.co')
    expect(cookiePolicy).not.toContain('final policy will be written later')
  })

  it('marketing policy explains optional opt-in communication rules', () => {
    const marketingPolicy = readPolicyPage('public/marketing-policy/index.html')

    expect(marketingPolicy).toContain('opt in')
    expect(marketingPolicy).toContain('unsubscribe')
    expect(marketingPolicy).toContain('contact@havenue.co')
    expect(marketingPolicy).toContain('Havenue LLC')
    expect(marketingPolicy).not.toContain('legal text is adapted later')
  })
})
