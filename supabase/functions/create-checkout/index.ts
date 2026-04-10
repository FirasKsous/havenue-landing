import Stripe from 'https://esm.sh/stripe@17'
import { errorResponse, handleCors, jsonResponse, rejectDisallowedOrigin } from '../_shared/cors.ts'

class ConfigurationError extends Error {}

function optionalEnv(name: string): string | null {
  return Deno.env.get(name)?.trim() || null
}

function determinePlanTier(priceId: string): 'starter' | 'pro' {
  const starterPriceIds = new Set([
    optionalEnv('STRIPE_PRICE_STARTER_MONTHLY'),
    optionalEnv('STRIPE_PRICE_STARTER_ANNUAL'),
  ].filter(Boolean))

  const proPriceIds = new Set([
    optionalEnv('STRIPE_PRICE_PRO_MONTHLY'),
    optionalEnv('STRIPE_PRICE_PRO_ANNUAL'),
  ].filter(Boolean))

  if (starterPriceIds.has(priceId)) return 'starter'
  if (proPriceIds.has(priceId)) return 'pro'

  throw new ConfigurationError('Server configuration error: unsupported Stripe price ID')
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) {
    throw new ConfigurationError(`Server configuration error: missing ${name}`)
  }

  return value
}

const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'))

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const originResponse = rejectDisallowedOrigin(req)
  if (originResponse) return originResponse

  try {
    const { priceId, email, anonymousId, billingInterval } = await req.json()

    if (!priceId || !email) {
      return errorResponse(req, 'Missing required fields: priceId, email')
    }

    const planTier = determinePlanTier(priceId)

    const origin = req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_ORIGIN')?.trim()
    if (!origin) {
      return errorResponse(req, 'Server configuration error: missing PUBLIC_SITE_ORIGIN', 500)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
        metadata: {
          anonymous_id: anonymousId || '',
          capture_source: 'landing_page',
          plan_tier: planTier,
          price_id: priceId,
        },
      },
      customer_email: email,
      allow_promotion_codes: true,
      tax_id_collection: { enabled: true },
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: {
        anonymous_id: anonymousId || '',
        billing_interval: billingInterval || 'monthly',
        plan_tier: planTier,
        price_id: priceId,
      },
    })

    return jsonResponse(req, { sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('[create-checkout] Error:', err)
    if (err instanceof ConfigurationError) {
      return errorResponse(req, err.message, 500)
    }

    return errorResponse(req, 'Failed to create checkout session', 500)
  }
})
