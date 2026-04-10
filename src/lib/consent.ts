export interface ConsentState {
  essential: true
  analytics: boolean
  marketing: boolean
  version: string
}

const CONSENT_STORAGE_KEY = 'havenue_consent'
const LEGACY_CONSENT_STORAGE_KEY = 'cookieConsent'
const CONSENT_VERSION = '1.0'

function getDefaultConsentState(): ConsentState {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    version: CONSENT_VERSION,
  }
}

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ConsentState>
  return candidate.essential === true
    && typeof candidate.analytics === 'boolean'
    && typeof candidate.marketing === 'boolean'
    && typeof candidate.version === 'string'
}

function readStoredConsentState(): ConsentState | null {
  const storedValue = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    return isConsentState(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

function migrateLegacyConsentState(): ConsentState | null {
  const legacyConsent = localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY)
  if (!legacyConsent) {
    return null
  }

  const migratedState: ConsentState = {
    essential: true,
    analytics: legacyConsent === 'accepted',
    marketing: false,
    version: CONSENT_VERSION,
  }

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(migratedState))
  localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY)
  return migratedState
}

export function getConsentState(): ConsentState {
  return readStoredConsentState() ?? migrateLegacyConsentState() ?? getDefaultConsentState()
}

export function saveConsentState(nextState: Pick<ConsentState, 'analytics' | 'marketing'>): ConsentState {
  const storedState: ConsentState = {
    essential: true,
    analytics: nextState.analytics,
    marketing: nextState.marketing,
    version: CONSENT_VERSION,
  }

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(storedState))
  localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY)

  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: storedState }))
  }

  return storedState
}

export function hasAnalyticsConsent(): boolean {
  return getConsentState().analytics
}

export function hasMarketingConsent(): boolean {
  return getConsentState().marketing
}
