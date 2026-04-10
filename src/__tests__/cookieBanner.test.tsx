import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { CookieConsent } from '../components/modals/CookieConsent'

vi.mock('../lib/supabase', () => ({
  supabase: { from: () => ({ insert: vi.fn().mockResolvedValue({ data: null, error: null }) }) },
}))

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('../lib/identity', () => ({
  getAnonymousId: () => null,
}))

async function renderAndWaitForBanner() {
  const utils = render(<CookieConsent />)
  // Banner appears after 800ms timeout
  await act(async () => {
    await new Promise((r) => setTimeout(r, 850))
  })
  return utils
}

describe('CookieConsent banner', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('renders the three primary choices once visible', async () => {
    await renderAndWaitForBanner()
    expect(await screen.findByRole('button', { name: /accept all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /essentials only/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^manage$/i })).toBeInTheDocument()
  })

  it('Accept All writes analytics=true and marketing=true to havenue_consent', async () => {
    await renderAndWaitForBanner()
    const acceptAll = await screen.findByRole('button', { name: /accept all/i })
    fireEvent.click(acceptAll)

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('havenue_consent') ?? '{}')
      expect(stored.analytics).toBe(true)
      expect(stored.marketing).toBe(true)
      expect(stored.essential).toBe(true)
    })
  })

  it('Essentials Only writes analytics=false and marketing=false', async () => {
    await renderAndWaitForBanner()
    const essentials = await screen.findByRole('button', { name: /essentials only/i })
    fireEvent.click(essentials)

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('havenue_consent') ?? '{}')
      expect(stored.analytics).toBe(false)
      expect(stored.marketing).toBe(false)
      expect(stored.essential).toBe(true)
    })
  })

  it('Manage opens drawer with independent analytics and marketing toggles', async () => {
    await renderAndWaitForBanner()
    const manage = await screen.findByRole('button', { name: /^manage$/i })
    fireEvent.click(manage)

    expect(screen.getByRole('switch', { name: /analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /marketing/i })).toBeInTheDocument()
  })

  it('Manage drawer Save Preferences honours individual toggle states', async () => {
    await renderAndWaitForBanner()
    fireEvent.click(await screen.findByRole('button', { name: /^manage$/i }))

    const analyticsSwitch = screen.getByRole('switch', { name: /analytics/i })
    fireEvent.click(analyticsSwitch)
    expect(analyticsSwitch).toHaveAttribute('aria-checked', 'true')

    const marketingSwitch = screen.getByRole('switch', { name: /marketing/i })
    expect(marketingSwitch).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('havenue_consent') ?? '{}')
      expect(stored.analytics).toBe(true)
      expect(stored.marketing).toBe(false)
    })
  })

  it('contains references to both Privacy Policy and Cookie Policy with correct hrefs', async () => {
    await renderAndWaitForBanner()
    const privacyLink = await screen.findByRole('link', { name: /privacy policy/i })
    const cookieLink = screen.getByRole('link', { name: /cookie policy/i })
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy/')
    expect(cookieLink).toHaveAttribute('href', '/cookie-policy/')
  })
})
