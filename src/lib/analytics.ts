import { supabase } from './supabase'
import { getAnonymousId } from './identity'
import { hasAnalyticsConsent } from './consent'

/** Event types matching the PRD lead scoring model (Section 6.2) */
export type AnalyticsEventType =
  | 'page_viewed'
  | 'section_viewed'
  | 'scroll_depth'
  | 'cta_clicked'
  | 'pricing_card_clicked'
  | 'pricing_toggle'
  | 'enterprise_contact_clicked'
  | 'stripe_checkout_started'
  | 'video_modal_opened'
  | 'video_played'
  | 'video_completed'
  | 'video_modal_closed'
  | 'exit_intent_shown'
  | 'exit_intent_submitted'
  | 'exit_intent_dismissed'
  | 'cookie_consent_accepted'
  | 'cookie_consent_declined'
  | 'return_visit'
  | 'book_demo_clicked'
  | 'demo_calendly_opened'
  | 'demo_request_submitted'
  | 'roi_calculator_submitted'

/** Score deltas per PRD Section 6.2 */
const SCORE_DELTAS: Partial<Record<AnalyticsEventType, number>> = {
  pricing_card_clicked: 20,
  enterprise_contact_clicked: 30,
  book_demo_clicked: 25,
  demo_calendly_opened: 20,
  demo_request_submitted: 30,
  stripe_checkout_started: 25,
  video_completed: 15,
  video_modal_opened: 8,
  pricing_toggle: 10,
  exit_intent_submitted: 5,
  cta_clicked: 5,
  return_visit: 15,
}

/** Section-viewed score (max 15 total, +5 each for features, +12 pricing, +8 ROI) */
const SECTION_SCORES: Record<string, number> = {
  pricing: 12,
  roi: 8,
  'feature-ocr': 5,
  'feature-menu-builder': 5,
  'feature-safety-engine': 5,
}

interface TrackEventParams {
  event: AnalyticsEventType
  data?: Record<string, unknown>
  sectionId?: string
}

/**
 * Centralized analytics tracking. Fires events to:
 * 1. Supabase lead_events table (for lead scoring)
 * 2. GA4 (if consent granted and GA loaded)
 */
export async function trackEvent({ event, data, sectionId }: TrackEventParams): Promise<void> {
  if (!hasAnalyticsConsent()) {
    return
  }

  const anonymousId = getAnonymousId()
  if (!anonymousId) {
    return
  }

  // Calculate score delta
  let scoreDelta = SCORE_DELTAS[event] ?? 0
  if (event === 'section_viewed' && sectionId) {
    scoreDelta = SECTION_SCORES[sectionId] ?? 0
  }
  // Cap scroll_depth scoring
  if (event === 'scroll_depth' && data?.percentage && Number(data.percentage) >= 75) {
    scoreDelta = 10
  }

  // 1. Send to Supabase lead_events (if connected)
  if (supabase) {
    try {
      await supabase.from('lead_events').insert({
        anonymous_id: anonymousId,
        event_type: event,
        event_data: data ?? {},
        score_delta: scoreDelta,
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      })
    } catch {
      // Silently fail — analytics should never break the UX
    }
  }

  // 2. Send to GA4 (if loaded)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      ...data,
      anonymous_id: anonymousId,
      section_id: sectionId,
    })
  }
}

/** Track scroll depth at 25%, 50%, 75%, 100% thresholds */
export function initScrollTracking(): () => void {
  const thresholds = [25, 50, 75, 100]
  const fired = new Set<number>()

  function onScroll() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight <= 0) return
    const percentage = Math.round((window.scrollY / scrollHeight) * 100)

    for (const threshold of thresholds) {
      if (percentage >= threshold && !fired.has(threshold)) {
        fired.add(threshold)
        trackEvent({
          event: 'scroll_depth',
          data: { percentage: threshold },
        })
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}

// Extend window for GA4
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
