/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const indexHtml = readFileSync(path.join(projectRoot, 'index.html'), 'utf8')
const heroSection = readFileSync(path.join(projectRoot, 'src/components/sections/HeroSection.tsx'), 'utf8')
const bookDemoModal = readFileSync(path.join(projectRoot, 'src/components/modals/BookDemoModal.tsx'), 'utf8')

describe('performance guardrails', () => {
  it('does not eager-load Calendly from the document head', () => {
    expect(indexHtml).not.toContain('assets.calendly.com/assets/external/widget.js')
    expect(indexHtml).not.toContain('assets.calendly.com/assets/external/widget.css')
  })

  it('keeps only the primary hero image eager-loaded', () => {
    expect(heroSection.match(/loading="eager"/g) ?? []).toHaveLength(1)
  })

  it('loads Calendly assets on demand inside the modal helper', () => {
    expect(bookDemoModal).toContain('widget.js')
    expect(bookDemoModal).toContain('widget.css')
  })
})
