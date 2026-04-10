import Stripe from 'https://esm.sh/stripe@17'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  paymentFailedHTML,
  paymentReceiptHTML,
  sendEmail,
  trialEndingHTML,
  trialWelcomeHTML,
} from '../_shared/resend.ts'
import { createLoopsContact, sendLoopsEvent } from '../_shared/loops.ts'

class ConfigurationError extends Error {}

function requireEnv(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) {
    throw new ConfigurationError(`Server configuration error: missing ${name}`)
  }

  return value
}

function optionalEnv(name: string): string | null {
  return Deno.env.get(name)?.trim() || null
}

const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY')
const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
const WEBHOOK_SECRET = requireEnv('STRIPE_WEBHOOK_SECRET')

const stripe = new Stripe(STRIPE_SECRET_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function expectSupabaseMutation<T>(
  operation: string,
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<T | null> {
  const { data, error } = await promise
  if (error) {
    throw new Error(`[stripe-webhook] ${operation}: ${error.message}`)
  }
  return data
}

const PRICE_TIER_MAP = new Map<string, string>()

function registerPriceTier(envKey: string, tier: string): void {
  const priceId = optionalEnv(envKey)
  if (!priceId) {
    console.warn(`[stripe-webhook] Missing ${envKey}; checkout sessions using that price cannot be mapped automatically.`)
    return
  }

  PRICE_TIER_MAP.set(priceId, tier)
}

registerPriceTier('STRIPE_PRICE_STARTER_MONTHLY', 'starter')
registerPriceTier('STRIPE_PRICE_STARTER_ANNUAL', 'starter')
registerPriceTier('STRIPE_PRICE_PRO_MONTHLY', 'pro')
registerPriceTier('STRIPE_PRICE_PRO_ANNUAL', 'pro')

function determineTier(session: Stripe.Checkout.Session): string {
  const metadataTier = session.metadata?.plan_tier?.trim().toLowerCase()
  if (metadataTier === 'starter' || metadataTier === 'pro') {
    return metadataTier
  }

  const metadataPriceId = session.metadata?.price_id?.trim() || ''
  const metadataMappedTier = PRICE_TIER_MAP.get(metadataPriceId)
  if (metadataMappedTier) {
    return metadataMappedTier
  }

  const lineItem = session.line_items?.data?.[0]
  const priceId = lineItem?.price?.id ?? ''
  const tier = PRICE_TIER_MAP.get(priceId)
  if (!tier) {
    throw new ConfigurationError('Server configuration error: Stripe price mapping is incomplete')
  }

  return tier
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

interface ContactEmailRow {
  email: string
}

interface TrialContactRow {
  email: string
  full_name: string | null
  plan_tier: string | null
}

function calculateTrialEnd(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function calculateMRR(subscription: Stripe.Subscription): number {
  const item = subscription.items.data[0]
  if (!item) return 0
  const amount = item.price.unit_amount ?? 0
  if (item.price.recurring?.interval === 'year') return Math.round(amount / 12)
  return amount
}

// ── Main handler ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown signature verification error'
    console.error('[stripe-webhook] Signature verification failed:', message)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break
      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`)
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    if (err instanceof ConfigurationError) {
      console.error(`[stripe-webhook] Configuration error processing ${event.type}:`, err.message)
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }

    console.error(`[stripe-webhook] Error processing ${event.type}:`, err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Webhook processing failed' }), { status: 500 })
  }
})

// ── Event handlers ───────────────────────────────────────────────────
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  options: { workflowSource?: 'webhook' | 'reconcile' } = {}
) {
  const email = session.customer_email || session.customer_details?.email
  if (!email) {
    console.error('[stripe-webhook] No email in checkout session:', session.id)
    return
  }

  const workflowSource = options.workflowSource ?? 'webhook'
  const existingCheckoutSession = await expectSupabaseMutation<CheckoutWorkflowRow>(
    'existing checkout session lookup',
    supabase
      .from('checkout_sessions')
      .select('id, metadata')
      .eq('stripe_session_id', session.id)
      .maybeSingle()
  )

  if (isCheckoutWorkflowCompleted(existingCheckoutSession)) {
    console.log(`[stripe-webhook] Checkout workflow already completed for ${session.id}; skipping duplicate processing`)
    return
  }

  const existingMetadata = getCheckoutWorkflowMetadata(existingCheckoutSession?.metadata)

  await expectSupabaseMutation(
    'checkout session ensure stub',
    supabase.from('checkout_sessions').upsert(
      {
        stripe_session_id: session.id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        email,
        plan_tier: determineTier(session),
        billing_interval: session.metadata?.billing_interval || 'monthly',
        amount_total: session.amount_total,
        currency: session.currency || 'gbp',
        status: 'pending',
        completed_at: null,
        metadata: {
          ...existingMetadata,
          workflow_completed: false,
          workflow_state: existingMetadata.workflow_state ?? 'ready',
          workflow_source: workflowSource,
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
          workflow_completed: false,
          workflow_state: 'processing',
          workflow_source: workflowSource,
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
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const tier = determineTier(session)
  const billingInterval = session.metadata?.billing_interval || 'monthly'
  const trialEnd = calculateTrialEnd(7)
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
    const contact = await expectSupabaseMutation<ContactIdRow>('contact upsert', supabase
      .from('contacts')
      .upsert(
        {
          email,
          anonymous_id: anonymousId || undefined,
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_status: 'trialing',
          plan_tier: tier,
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
      throw new Error(`[stripe-webhook] Failed to upsert contact for: ${email}`)
    }

    if (workflowMetadata.activity_logged !== true) {
      await expectSupabaseMutation('contact activity insert', supabase.from('contact_activities').insert({
        contact_id: contact.id,
        activity_type: 'checkout_completed',
        title: `Started ${tier} trial via Stripe Checkout`,
        data: { session_id: session.id, subscription_id: subscriptionId },
      }))
      await syncWorkflowMetadata({ activity_logged: true, activity_logged_at: new Date().toISOString() })
    }

    const name = session.customer_details?.name || 'there'
    if (workflowMetadata.welcome_email_sent !== true) {
      await sendEmail({
        to: email,
        subject: `Your Havenue workspace is ready, ${name}`,
        html: trialWelcomeHTML({ name, plan: tier.charAt(0).toUpperCase() + tier.slice(1), trialEndDate: formatDate(trialEnd) }),
      })
      await syncWorkflowMetadata({ welcome_email_sent: true, welcome_email_sent_at: new Date().toISOString() })
    }

    if (workflowMetadata.loops_contact_synced !== true) {
      await createLoopsContact(email, { firstName: name.split(' ')[0], plan: tier, trialEndDate: trialEnd.toISOString() }, { required: true, missingKeyMessage: 'Server configuration error: missing LOOPS_API_KEY for lifecycle events' })
      await syncWorkflowMetadata({ loops_contact_synced: true, loops_contact_synced_at: new Date().toISOString() })
    }

    if (workflowMetadata.trial_started_event_sent !== true) {
      await sendLoopsEvent(email, 'trial_started', { plan: tier }, { required: true, missingKeyMessage: 'Server configuration error: missing LOOPS_API_KEY for lifecycle events' })
      await syncWorkflowMetadata({ trial_started_event_sent: true, trial_started_event_sent_at: new Date().toISOString() })
    }

    if (anonymousId && workflowMetadata.lead_events_relinked !== true) {
      await expectSupabaseMutation('lead event relink', supabase.from('lead_events').update({ contact_id: contact.id }).eq('anonymous_id', anonymousId).is('contact_id', null))
      await syncWorkflowMetadata({ lead_events_relinked: true, lead_events_relinked_at: new Date().toISOString() })
    }

    await expectSupabaseMutation(
      'checkout workflow completion mark',
      supabase
        .from('checkout_sessions')
        .update({
          status: 'complete',
          completed_at: new Date().toISOString(),
          metadata: {
            ...workflowMetadata,
            workflow_completed: true,
            workflow_state: 'complete',
            workflow_source: workflowSource,
            completed_at: new Date().toISOString(),
          },
        })
        .eq('stripe_session_id', session.id)
    )
  } catch (error) {
    await expectSupabaseMutation(
      'checkout workflow failure mark',
      supabase
        .from('checkout_sessions')
        .update({
          status: 'pending',
          completed_at: null,
          metadata: {
            ...workflowMetadata,
            workflow_completed: false,
            workflow_state: 'failed',
            workflow_source: workflowSource,
            workflow_failed_at: new Date().toISOString(),
          },
        })
        .eq('stripe_session_id', session.id)
    )
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await expectSupabaseMutation('subscription update contact state', supabase.from('contacts').update({
    subscription_status: subscription.status as string,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    mrr_cents: calculateMRR(subscription),
  }).eq('subscription_id', subscription.id))
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await expectSupabaseMutation('subscription deletion contact state', supabase.from('contacts').update({ subscription_status: 'canceled', stage: 'churned', mrr_cents: 0 }).eq('subscription_id', subscription.id))
  const contact = await expectSupabaseMutation<ContactEmailRow>('subscription deletion contact lookup', supabase.from('contacts').select('email').eq('subscription_id', subscription.id).maybeSingle())
  if (contact?.email) await sendLoopsEvent(contact.email, 'subscription_canceled', undefined, { required: true, missingKeyMessage: 'Server configuration error: missing LOOPS_API_KEY for lifecycle events' })
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const contact = await expectSupabaseMutation<TrialContactRow>('trial ending contact lookup', supabase.from('contacts').select('email, full_name, plan_tier').eq('subscription_id', subscription.id).maybeSingle())
  if (contact?.email) {
    await sendEmail({
      to: contact.email,
      subject: `3 days left on your ${contact.plan_tier || 'Pro'} trial`,
      html: trialEndingHTML({ name: contact.full_name || 'there', plan: (contact.plan_tier || 'Pro').charAt(0).toUpperCase() + (contact.plan_tier || 'pro').slice(1), endDate: formatDate(new Date(subscription.trial_end! * 1000)) }),
    })
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const contact = await expectSupabaseMutation<ContactEmailRow>('payment failed contact lookup', supabase.from('contacts').select('email').eq('stripe_customer_id', invoice.customer as string).maybeSingle())
  if (contact?.email) {
    await expectSupabaseMutation('payment failed contact update', supabase.from('contacts').update({ subscription_status: 'past_due' }).eq('email', contact.email))
    await sendEmail({ to: contact.email, subject: 'Action required: payment failed', html: paymentFailedHTML({ invoiceUrl: invoice.hosted_invoice_url || '' }) })
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const contact = await expectSupabaseMutation<TrialContactRow>('invoice paid contact lookup', supabase.from('contacts').select('email, full_name, plan_tier').eq('stripe_customer_id', invoice.customer as string).maybeSingle())
  if (contact?.email && invoice.amount_paid > 0) {
    const amount = new Intl.NumberFormat('en-GB', { style: 'currency', currency: invoice.currency || 'gbp' }).format(invoice.amount_paid / 100)
    await sendEmail({ to: contact.email, subject: 'Payment received — thank you!', html: paymentReceiptHTML({ name: contact.full_name || 'there', amount, invoiceUrl: invoice.hosted_invoice_url || '', period: invoice.lines?.data?.[0]?.description || 'your subscription' }) })
    await expectSupabaseMutation('invoice paid contact update', supabase.from('contacts').update({ subscription_status: 'active', stage: 'customer' }).eq('email', contact.email).in('stage', ['trial', 'churned']))
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const webhookUrl = Deno.env.get('MAKE_WEBHOOK_DISPUTE_ALERT')
  if (webhookUrl) {
    await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'dispute_alert', customer_id: dispute.customer, amount: dispute.amount, reason: dispute.reason }) })
  }
}
