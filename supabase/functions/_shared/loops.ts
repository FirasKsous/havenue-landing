const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY')
const LOOPS_BASE_URL = 'https://app.loops.so/api/v1'

interface LoopsOptions {
  required?: boolean
  missingKeyMessage?: string
}

function assertLoopsConfigured(options?: LoopsOptions): string | null {
  if (LOOPS_API_KEY) {
    return LOOPS_API_KEY
  }

  if (options?.required) {
    throw new Error(options.missingKeyMessage || 'Server configuration error: missing LOOPS_API_KEY')
  }

  return null
}

/**
 * Creates or updates a contact in Loops for marketing email sequences.
 */
export async function createLoopsContact(
  email: string,
  properties: Record<string, unknown> = {},
  options?: LoopsOptions
): Promise<void> {
  const apiKey = assertLoopsConfigured(options)
  if (!apiKey) {
    console.warn('[loops] API key not configured — contact creation skipped:', email)
    return
  }

  const res = await fetch(`${LOOPS_BASE_URL}/contacts/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, ...properties }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('[loops] Contact creation failed:', res.status, error)
  }
}

/**
 * Sends an event to Loops to trigger marketing sequences.
 *
 * Events:
 *  - trial_started     → triggers Trial Onboarding Drip
 *  - lead_captured     → triggers Lead Nurture sequence
 *  - subscription_canceled → triggers Win-Back sequence
 *  - enterprise_lead_created → triggers Enterprise Nurture sequence
 */
export async function sendLoopsEvent(
  email: string,
  eventName: string,
  properties?: Record<string, unknown>,
  options?: LoopsOptions
): Promise<void> {
  const apiKey = assertLoopsConfigured(options)
  if (!apiKey) {
    console.warn('[loops] API key not configured — event skipped:', eventName)
    return
  }

  const res = await fetch(`${LOOPS_BASE_URL}/events/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      eventName,
      eventProperties: properties,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('[loops] Event send failed:', res.status, error)
  }
}
