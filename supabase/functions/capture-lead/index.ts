import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { errorResponse, handleCors, jsonResponse, rejectDisallowedOrigin } from '../_shared/cors.ts'
import { createLoopsContact, sendLoopsEvent } from '../_shared/loops.ts'
import { leadMagnetDeliveryHTML, sendEmail } from '../_shared/resend.ts'

class ConfigurationError extends Error {}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) {
    throw new ConfigurationError(`Server configuration error: missing ${name}`)
  }

  return value
}

const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

/** Extract first valid IP from x-forwarded-for (may contain comma-separated list) */
function extractClientIP(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0].trim()
    if (first && /^[\d.:a-fA-F]+$/.test(first)) return first
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp && /^[\d.:a-fA-F]+$/.test(realIp.trim())) return realIp.trim()
  return null
}

interface LeadMagnet { title: string; downloadUrl: string }
const LEAD_MAGNETS: Record<string, LeadMagnet> = {
  hospitality_profit_calculator: {
    title: 'The 2026 Hospitality Profit Calculator',
    downloadUrl: `${SUPABASE_URL}/storage/v1/object/public/lead-magnets/hospitality-profit-calculator.xlsx`,
  },
}

function getLeadMagnet(magnetId: string): LeadMagnet | null {
  return LEAD_MAGNETS[magnetId] ?? null
}

function getLeadTier(score: number): string {
  if (score >= 71) return 'sales_qualified'
  if (score >= 46) return 'hot'
  if (score >= 21) return 'warm'
  return 'cold'
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const originResponse = rejectDisallowedOrigin(req)
  if (originResponse) return originResponse

  try {
    const { email, source, marketingConsent, anonymousId, utmParams, leadMagnet, metadata } = await req.json()

    if (!email) return errorResponse(req, 'Email is required')

    if (marketingConsent && !Deno.env.get('LOOPS_API_KEY')?.trim()) {
      return errorResponse(req, 'Server configuration error: marketing capture is not configured', 500)
    }

    let currentScore = 0
    if (anonymousId) {
      const { data } = await supabase.rpc('calculate_lead_score', { p_anonymous_id: anonymousId })
      currentScore = data ?? 0
    }

    const { data: contactId, error } = await supabase.rpc('upsert_contact_preserve_utm', {
      p_email: email,
      p_anonymous_id: anonymousId || null,
      p_stage: currentScore >= 71 ? 'sql' : currentScore >= 46 ? 'mql' : 'lead',
      p_lead_score: currentScore,
      p_lead_tier: getLeadTier(currentScore),
      p_capture_source: source || 'exit_intent',
      p_utm_source: utmParams?.utm_source || null,
      p_utm_medium: utmParams?.utm_medium || null,
      p_utm_campaign: utmParams?.utm_campaign || null,
      p_utm_term: utmParams?.utm_term || null,
      p_utm_content: utmParams?.utm_content || null,
      p_is_subscribed: marketingConsent || false,
      p_full_name: metadata?.name || null,
      p_company_name: metadata?.venue || null,
    })

    if (error) {
      console.error('[capture-lead] Upsert error:', error)
      return errorResponse(req, 'Failed to capture lead', 500)
    }

    const clientIP = extractClientIP(req)

    if (marketingConsent && contactId) {
      const { error: consentErr } = await supabase.from('consents').insert({
        contact_id: contactId,
        anonymous_id: anonymousId,
        consent_type: 'marketing_email',
        granted: true,
        consent_text: 'Send me product updates and catering industry insights',
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent'),
      })
      if (consentErr) console.error('[capture-lead] Consent insert error:', consentErr)
    }

    if (contactId) {
      const { error: actErr } = await supabase.from('contact_activities').insert({
        contact_id: contactId,
        activity_type: 'lead_captured',
        title: `Email captured via ${source || 'exit_intent'}`,
        data: { source, utm: utmParams, score: currentScore, lead_magnet: leadMagnet || null },
      })
      if (actErr) console.error('[capture-lead] Activity insert error:', actErr)
    }

    if (anonymousId && contactId) {
      await supabase.from('lead_events').update({ contact_id: contactId }).eq('anonymous_id', anonymousId).is('contact_id', null)
    }

    if (marketingConsent) {
      await createLoopsContact(email, { source, leadMagnet: leadMagnet || null }, { required: true, missingKeyMessage: 'Server configuration error: missing LOOPS_API_KEY for marketing capture' })
      await sendLoopsEvent(email, 'lead_captured', { source, lead_magnet: leadMagnet || null }, { required: true, missingKeyMessage: 'Server configuration error: missing LOOPS_API_KEY for marketing capture' })
    }

    if (currentScore >= 71) {
      const webhookUrl = Deno.env.get('MAKE_WEBHOOK_HIGH_SCORE_LEAD')
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'high_score_lead', email, score: currentScore, source }),
        })
      }
    }

    const magnet = leadMagnet ? getLeadMagnet(leadMagnet) : null
    const downloadUrl = magnet?.downloadUrl ?? null

    if (magnet) {
      try {
        const firstNameHint = typeof metadata?.name === 'string' && metadata.name.trim()
          ? metadata.name.trim().split(/\s+/)[0]
          : undefined
        await sendEmail({
          to: email,
          subject: `Your copy of ${magnet.title}`,
          html: leadMagnetDeliveryHTML({
            magnetTitle: magnet.title,
            downloadUrl: magnet.downloadUrl,
            firstNameHint,
          }),
        })
      } catch (emailErr) {
        // Email delivery must never block the download response.
        console.error('[capture-lead] Lead magnet email failed:', emailErr)
      }
    }

    return jsonResponse(req, { success: true, downloadUrl })
  } catch (err) {
    console.error('[capture-lead] Error:', err)
    if (err instanceof ConfigurationError) {
      return errorResponse(req, err.message, 500)
    }

    return errorResponse(req, 'Failed to capture lead', 500)
  }
})
