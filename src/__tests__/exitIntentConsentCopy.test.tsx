import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ExitIntentModal } from '../components/modals/ExitIntentModal'

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('../lib/identity', () => ({
  getAnonymousId: () => null,
  getStoredUTMParams: () => null,
}))

describe('ExitIntentModal consent copy', () => {
  afterEach(() => {
    cleanup()
  })

  it('explains transactional delivery, consent, and references unsubscribe', () => {
    render(<ExitIntentModal isOpen={true} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog')
    const text = dialog.textContent ?? ''

    expect(text).toMatch(/email the calculator/i)
    expect(text).toMatch(/transactional/i)
    expect(text).toMatch(/consent/i)
    expect(text).toMatch(/unsubscribe/i)
    expect(text).toMatch(/optional/i)
  })

  it('marketing checkbox is unchecked by default', () => {
    render(<ExitIntentModal isOpen={true} onClose={() => {}} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('contains correctly-targeted privacy and marketing policy links', () => {
    render(<ExitIntentModal isOpen={true} onClose={() => {}} />)
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    const marketingLink = screen.getByRole('link', { name: /marketing policy/i })
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy/')
    expect(marketingLink).toHaveAttribute('href', '/marketing-policy/')
  })
})
