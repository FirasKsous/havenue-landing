import Stripe from 'https://esm.sh/stripe@17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function optionalEnv(name: string): string | null {
  return Deno.env.get(name)?.trim() || null
}

const PRICE_TIER_MAP = new Map<string, string>()

function registerPriceTier(envKey: string, tier: string): void {
  const priceId = optionalEnv(envKey)
  if (priceId) {
    PRICE_TIER_MAP.set(priceId, tier)
  }
}

registerPriceTier('STRIPE_PRICE_STARTER_MONTHLY', 'starter')
registerPriceTier('STRIPE_PRICE_STARTER_ANNUAL', 'starter')
registerPriceTier('STRIPE_PRICE_PRO_MONTHLY', 'pro')
registerPriceTier('STRIPE_PRICE_PRO_ANNUAL', 'pro')

function resolvePlanTier(session: Stripe.Checkout.Session): string | null {
  const metadataTier = session.metadata?.plan_tier?.trim().toLowerCase()
  if (metadataTier === 'starter' || metadataTier === 'pro' || metadataTier === 'enterprise') {
    return metadataTier
  }

  const metadataPriceId = session.metadata?.price_id?.trim() || ''
  const mappedTier = PRICE_TIER_MAP.get(metadataPriceId)
  if (mappedTier) {
    return mappedTier
  }

  return null
}

function isCheckoutWorkflowCompleted(checkoutSession: { metadata?: Record<string, unknown> | null } | null): boolean {
  return checkoutSession?.metadata?.workflow_completed === true
}

function getCheckoutWorkflowMetadata(metadata: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {}
}

interface CheckoutWorkflowRow {
  id: string
  metadata: Record<string, unknown> | null
}

interface ContactIdRow {
  id: string
}

class ConfigurationError extends Error {}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) {
    throw new ConfigurationError(`Server configuration error: missing ${name}`)
  }

  return value
}

const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY')
const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

const stripe = new Stripe(STRIPE_SECRET_KEY)
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

async function expectSupabaseMutation<T>(
  operation: string,
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<T | null> {
  const { data, error } = await promise
  if (error) {
    throw new Error(`[reconcile] ${operation}: ${error.message}`)
  }
  return data
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const email = session.customer_email || session.customer_details?.email
  if (!email) {
    console.error('[reconcile] No email in checkout session:', session.id)
    return
  }

  const existingCheckoutSession = await expectSupabaseMutation<CheckoutWorkflowRow>(
    'existing checkout session lookup',
    supabase
      .from('checkout_sessions')
      .select('id, metadata')
      .eq('stripe_session_id', session.id)
      .maybeSingle()
  )

  if (isCheckoutWorkflowCompleted(existingCheckoutSession)) {
    return
  }

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const planTier = resolvePlanTier(session)
  if (!planTier) {
    console.warn(`[reconcile] Skipping session with unmapped tier metadata: ${session.id}`)
    return
  }

  const existingMetadata = getCheckoutWorkflowMetadata(existingCheckoutSession?.metadata)

  await expectSupabaseMutation(
    'checkout session ensure stub',
    supabase.from('checkout_sessions').upsert(
      {
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        email,
        plan_tier: planTier,
        billing_interval: session.metadata?.billing_interval || 'monthly',
        amount_total: session.amount_total,
        currency: session.currency || 'gbp',
        status: 'pending',
        completed_at: null,
        metadata: {
          ...existingMetadata,
          reconciled: true,
          workflow_completed: false,
          workflow_state: existingMetadata.workflow_state ?? 'ready',
          workflow_source: 'reconcile',
        },
      },
      { onConflict: 'stripe_session_id', ignoreDuplicates: true }
    )
  )

  const workflowClaimedAt = new Date().toISOString()
  const claimedCheckoutSession = await expectSupabaseMutation<CheckoutWorkflowRow>(
    'checkout workflow claim',
    supabase
      .from('checkout_sessions')
      .update({
        status: 'pending',
        completed_at: workflowClaimedAt,
        metadata: {
          ...existingMetadata,
          reconciled: true,
          workflow_completed: false,
          workflow_state: 'processing',
          workflow_source: 'reconcile',
          workflow_claimed_at: workflowClaimedAt,
        },
      })
      .eq('stripe_session_id', session.id)
      .or('metadata->workflow_state.is.null,metadata->>workflow_state.eq.ready,metadata->>workflow_state.eq.failed')
      .select('id, metadata')
      .maybeSingle()
  )

  if (!claimedCheckoutSession) {
    const latestCheckoutSession = await expectSupabaseMutation<CheckoutWorkflowRow>(
      'checkout workflow post-claim lookup',
      supabase
        .from('checkout_sessions')
        .select('id, metadata')
        .eq('stripe_session_id', session.id)
        .maybeSingle()
    )

    if (isCheckoutWorkflowCompleted(latestCheckoutSession)) {
      return
    }

    throw new Error(`Checkout workflow is already in progress for ${session.id}`)
  }

  const anonymousId = session.metadata?.anonymous_id
  const billingInterval = session.metadata?.billing_interval || 'monthly'
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  let workflowMetadata = getCheckoutWorkflowMetadata(claimedCheckoutSession.metadata)

  const syncWorkflowMetadata = async (patch: Record<string, unknown>) => {
    workflowMetadata = { ...workflowMetadata, ...patch }
    await expectSupabaseMutation(
      'checkout workflow metadata sync',
      supabase
        .from('checkout_sessions')
        .update({ metadata: workflowMetadata })
        .eq('stripe_session_id', session.id)
    )
  }

  try {
    const contact = await expectSupabaseMutation<ContactIdRow>('contact reconcile upsert', supabase
      .from('contacts')
      .upsert(
        {
          email,
          anonymous_id: anonymousId || undefined,
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_status: 'trialing',
          plan_tier: planTier,
          billing_interval: billingInterval,
          trial_ends_at: trialEnd.toISOString(),
          stage: 'trial',
          capture_source: 'stripe_checkout',
          converted_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single())

    if (!contact) {
      throw new Error(`[reconcile] Failed to upsert contact for: ${email}`)
    }

    if (workflowMetadata.activity_logged !== true) {
      await expectSupabaseMutation('reconcile contact activity insert', supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'checkout_completed',
        title: `Started ${planTier} trial via Stripe Checkout`,
        data: { session_id: session.id, subscription_id: subscriptionId, reconciled: true },
      }))
      await syncWorkflowMetadata({ activity_logged: true, activity_logged_at: new Date().toISOString() })
    }

    if (anonymousId && workflowMetadata.lead_events_relinked !== true) {
      await expectSupabaseMutation('reconcile lead event relink', supabase.from('lead_events').update({ contact_id: contact.id }).eq('anonymous_id', anonymousId).is('contact_id', null))
      await syncWorkflowMetadata({ lead_events_relinked: true, lead_events_relinked_at: new Date().toISOString() })
    }

    await expectSupabaseMutation('checkout workflow completion mark', supabase.from('checkout_sessions').update({
      status: 'complete',
      completed_at: new Date().toISOString(),
      metadata: {
        ...workflowMetadata,
        reconciled: true,
        workflow_completed: true,
        workflow_state: 'complete',
        workflow_source: 'reconcile',
        completed_at: new Date().toISOString(),
      },
    }).eq('stripe_session_id', session.id))
  } catch (error) {
    await expectSupabaseMutation('checkout workflow failure mark', supabase.from('checkout_sessions').update({
      status: 'pending',
      completed_at: null,
      metadata: {
        ...workflowMetadata,
        reconciled: true,
        workflow_completed: false,
        workflow_state: 'failed',
        workflow_source: 'reconcile',
        workflow_failed_at: new Date().toISOString(),
      },
    }).eq('stripe_session_id', session.id))
    throw error
  }
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const since = Math.floor(Date.now() / 1000) - 48 * 60 * 60

    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      created: { gte: since },
      limit: 100,
      expand: ['data.line_items'],
    })

    let reconciled = 0
    let matched = 0
    let skipped = 0

    for (const session of sessions.data) {
      const existing = await expectSupabaseMutation<CheckoutWorkflowRow>(
        'existing session lookup',
        supabase
          .from('checkout_sessions')
          .select('id, metadata')
          .eq('stripe_session_id', session.id)
          .maybeSingle()
      )

      if (isCheckoutWorkflowCompleted(existing)) {
        matched++
        continue
      }

      console.warn(
        `[reconcile] Missing session found: ${session.id}, email: ${session.customer_email}`
      )

      const planTier = resolvePlanTier(session)
      if (!planTier) {
        console.warn(`[reconcile] Skipping session with unmapped tier metadata: ${session.id}`)
        skipped++
        continue
      }

      await handleCheckoutCompleted(session)
      reconciled++
    }

    const result = {
      total_checked: sessions.data.length,
      matched,
      reconciled,
      skipped,
      timestamp: new Date().toISOString(),
    }

    console.log('[reconcile] Complete:', JSON.stringify(result))

    if (reconciled > 0) {
      const opsWebhook = Deno.env.get('SLACK_WEBHOOK_OPS')
      if (opsWebhook) {
        await fetch(opsWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Stripe Reconciliation: ${reconciled} missing session(s) found and re-processed. Check Supabase logs.`,
          }),
        })
      }
    }

    return new Response(JSON.stringify(result), { status: 200 })
  } catch (err) {
    console.error('[reconcile] Error:', err)
    if (err instanceof ConfigurationError) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ error: 'Failed to reconcile Stripe sessions' }), { status: 500 })
  }
})
