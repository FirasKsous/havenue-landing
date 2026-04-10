import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const analyticsMocks = vi.hoisted(() => {
  const insert = vi.fn().mockResolvedValue({ error: null })
  const from = vi.fn(() => ({ insert }))

  return { insert, from }
})

vi.mock('../supabase', () => ({
  supabase: {
    from: analyticsMocks.from,
  },
}))

import { saveConsentState } from '../consent'
import { trackEvent } from '../analytics'

function resetBrowserState() {
  localStorage.clear()
  sessionStorage.clear()
  document.cookie = 'havenue_aid=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  document.cookie = 'cateringos_aid=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  window.history.pushState({}, '', '/')
  analyticsMocks.insert.mockClear()
  analyticsMocks.from.mockClear()
  window.gtag = vi.fn()
}

describe('analytics consent gating', () => {
  beforeEach(() => {
    resetBrowserState()
  })

  afterEach(() => {
    resetBrowserState()
  })

  it('does not write analytics or create anonymous ids before analytics consent', async () => {
    await trackEvent({ event: 'page_viewed', data: { page: '/' } })

    expect(analyticsMocks.from).not.toHaveBeenCalled()
    expect(window.gtag).not.toHaveBeenCalled()
    expect(document.cookie).not.toContain('havenue_aid=')
  })

  it('writes analytics and creates anonymous ids after analytics consent', async () => {
    saveConsentState({ analytics: true, marketing: false })

    await trackEvent({ event: 'page_viewed', data: { page: '/' } })

    expect(analyticsMocks.from).toHaveBeenCalledWith('lead_events')
    expect(analyticsMocks.insert).toHaveBeenCalledTimes(1)
    expect(window.gtag).toHaveBeenCalled()
    expect(document.cookie).toContain('havenue_aid=')
  })
})
