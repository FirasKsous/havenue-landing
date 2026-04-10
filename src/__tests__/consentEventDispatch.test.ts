import { afterEach, describe, expect, it, vi } from 'vitest'
import { saveConsentState } from '../lib/consent'

describe('saveConsentState', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('dispatches a consentUpdated CustomEvent carrying the new state', () => {
    const listener = vi.fn()
    window.addEventListener('consentUpdated', listener as EventListener)

    const next = saveConsentState({ analytics: true, marketing: false })

    expect(listener).toHaveBeenCalledTimes(1)
    const event = listener.mock.calls[0][0] as CustomEvent
    expect(event.detail).toEqual(next)
    expect(event.detail).toMatchObject({
      essential: true,
      analytics: true,
      marketing: false,
      version: '1.0',
    })

    window.removeEventListener('consentUpdated', listener as EventListener)
  })

  it('persists the new state to localStorage under havenue_consent', () => {
    saveConsentState({ analytics: false, marketing: true })

    const stored = JSON.parse(localStorage.getItem('havenue_consent') ?? '{}')
    expect(stored).toMatchObject({
      essential: true,
      analytics: false,
      marketing: true,
      version: '1.0',
    })
  })
})
