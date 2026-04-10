import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  getConsentState,
  hasAnalyticsConsent,
  hasMarketingConsent,
  saveConsentState,
} from '../consent'
import { captureUTMParams, getAnonymousId, getStoredUTMParams } from '../identity'

function resetBrowserState() {
  localStorage.clear()
  sessionStorage.clear()
  document.cookie = 'havenue_aid=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  document.cookie = 'cateringos_aid=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  window.history.pushState({}, '', '/')
}

describe('consent model', () => {
  beforeEach(() => {
    resetBrowserState()
  })

  afterEach(() => {
    resetBrowserState()
  })

  it('defaults analytics and marketing consent to false', () => {
    expect(getConsentState()).toMatchObject({
      essential: true,
      analytics: false,
      marketing: false,
    })
    expect(hasAnalyticsConsent()).toBe(false)
    expect(hasMarketingConsent()).toBe(false)
  })

  it('migrates legacy accepted consent to analytics-only consent', () => {
    localStorage.setItem('cookieConsent', 'accepted')

    expect(getConsentState()).toMatchObject({
      analytics: true,
      marketing: false,
    })
  })

  it('does not create anonymous ids or store utms before analytics consent', () => {
    window.history.pushState({}, '', '/?utm_source=google&utm_medium=cpc&utm_campaign=launch')

    expect(captureUTMParams()).toBeNull()
    expect(getStoredUTMParams()).toBeNull()
    expect(getAnonymousId()).toBeNull()
    expect(document.cookie).not.toContain('havenue_aid=')
  })

  it('creates anonymous ids and stores utms after analytics consent', () => {
    saveConsentState({ analytics: true, marketing: false })
    window.history.pushState({}, '', '/?utm_source=google&utm_medium=cpc&utm_campaign=launch')

    const utm = captureUTMParams()
    const anonymousId = getAnonymousId()

    expect(utm).toMatchObject({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'launch',
    })
    expect(getStoredUTMParams()).toMatchObject({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'launch',
    })
    expect(anonymousId).toMatch(/[0-9a-f-]{36}/i)
    expect(document.cookie).toContain('havenue_aid=')
  })
})
