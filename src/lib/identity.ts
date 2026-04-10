import { hasAnalyticsConsent } from './consent'

const COOKIE_NAME = 'havenue_aid'
const LEGACY_COOKIE_NAME = 'cateringos_aid'
const UTM_STORAGE_KEY = 'havenue_utm'
const LEGACY_UTM_STORAGE_KEY = 'cateringos_utm'

/**
 * Gets or creates a first-party anonymous ID cookie.
 * This ID links behavioral events to a contact when email is captured.
 */
export function getAnonymousId(): string | null {
  const existing = getCookie(COOKIE_NAME) ?? getCookie(LEGACY_COOKIE_NAME)
  if (existing) return existing

  if (!hasAnalyticsConsent()) {
    return null
  }

  const id = crypto.randomUUID()
  setCookie(COOKIE_NAME, id, 365)
  return id
}

export interface UTMParams {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
}

/**
 * Captures UTM parameters from the URL on page load.
 * Stores in sessionStorage so they persist across the session.
 * Only writes if at least one UTM param is present.
 */
export function captureUTMParams(): UTMParams | null {
  if (!hasAnalyticsConsent()) {
    return null
  }

  const params = new URLSearchParams(window.location.search)
  const utm: UTMParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  }

  if (Object.values(utm).some(Boolean)) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm))
    return utm
  }

  return null
}

/**
 * Retrieves stored UTM params from sessionStorage.
 */
export function getStoredUTMParams(): UTMParams | null {
  const stored = sessionStorage.getItem(UTM_STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_UTM_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as UTMParams
  } catch {
    return null
  }
}

/**
 * Detects if this is a return visit (anonymous ID cookie existed on page load).
 */
export function isReturnVisit(): boolean {
  return !!(getCookie(COOKIE_NAME) ?? getCookie(LEGACY_COOKIE_NAME))
}

// Cookie helpers
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}
