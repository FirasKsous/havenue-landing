class ConfigurationError extends Error {}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')?.trim() || null
const RESEND_FROM = Deno.env.get('RESEND_FROM_TRANSACTIONAL')?.trim() || null

interface EmailPayload {
  to: string
  subject: string
  html: string
}

/**
 * Sends a transactional email via Resend API.
 * Used for: lead magnet delivery, welcome, trial_ending, payment_receipt, payment_failed.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new ConfigurationError('Server configuration error: missing RESEND_API_KEY for transactional email')
  }

  if (!RESEND_FROM) {
    throw new ConfigurationError('Server configuration error: missing RESEND_FROM_TRANSACTIONAL for transactional email')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('[resend] Send failed:', res.status, error)
    throw new Error(`Resend API error: ${res.status}`)
  }
}

interface EmailTemplateOptions {
  heading: string
  preheader?: string
  paragraphs: string[]
  actionLabel?: string
  actionUrl?: string
  footerNote?: string
}

function renderEmailTemplate(options: EmailTemplateOptions): string {
  const preheader = options.preheader
    ? `<div style="display:none;overflow:hidden;height:0;max-height:0;font-size:1px;line-height:1px;color:#0A0A0A;opacity:0;">${options.preheader}</div>`
    : ''

  const body = options.paragraphs
    .map((p) => `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.65;">${p}</p>`)
    .join('')

  const action = options.actionLabel && options.actionUrl
    ? `<p style="margin:28px 0 8px;"><a href="${options.actionUrl}" style="display:inline-block;background:#2F8F4E;color:#0A0A0A;font-weight:600;font-size:15px;padding:13px 24px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.15);">${options.actionLabel}</a></p>`
    : ''

  const footerNote = options.footerNote
    ? `<p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #E5E7EB;color:#9CA3AF;font-size:12px;line-height:1.6;">${options.footerNote}</p>`
    : ''

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${options.heading}</title></head><body style="margin:0;padding:0;background:#F4F4F5;font-family:Inter,system-ui,-apple-system,sans-serif;">${preheader}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:32px 16px;"><tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);"><tr><td style="padding:28px 32px 0;"><p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2F8F4E;">Havenue</p></td></tr><tr><td style="padding:14px 32px 0;"><h1 style="margin:0 0 18px;color:#0A0A0A;font-size:22px;line-height:1.3;font-weight:800;">${options.heading}</h1></td></tr><tr><td style="padding:0 32px 28px;">${body}${action}${footerNote}</td></tr><tr><td style="padding:18px 32px;border-top:1px solid #E5E7EB;background:#FAFAFA;"><p style="margin:0 0 6px;font-size:12px;color:#6B7280;">Havenue LLC &middot; DIFC Free Zone, Dubai, UAE</p><p style="margin:0;font-size:12px;color:#6B7280;">Reply to this email and a real person on the Havenue team will get back to you.</p></td></tr></table></td></tr></table></body></html>`
}

export function leadMagnetDeliveryHTML(vars: {
  magnetTitle: string
  downloadUrl: string
  firstNameHint?: string
}): string {
  const greeting = vars.firstNameHint ? `Hi ${vars.firstNameHint},` : 'Hi there,'
  return renderEmailTemplate({
    heading: `Here's your copy of ${vars.magnetTitle}`,
    preheader: `${vars.magnetTitle} — ready to download`,
    paragraphs: [
      `${greeting} thanks for requesting <strong>${vars.magnetTitle}</strong>. Your download is one click away below.`,
      `Inside, you'll find an interactive spreadsheet plus a short setup note so you can plug in your real numbers in about ten minutes &mdash; not weeks of consultancy.`,
      `If anything looks off, or you'd rather walk through it with a hospitality specialist, just reply to this email. A human reads every reply.`,
      `If the button below doesn't work, paste this link into your browser:<br><span style="word-break:break-all;color:#2F8F4E;">${vars.downloadUrl}</span>`,
    ],
    actionLabel: 'Download the calculator',
    actionUrl: vars.downloadUrl,
    footerNote: `You're receiving this because you requested the calculator on havenue.co. This is a transactional email for a resource you asked for &mdash; it is not a marketing message and you cannot unsubscribe from it. Marketing emails are separate and you can opt out of them at any time.`,
  })
}

export function trialWelcomeHTML(vars: {
  name: string
  plan: string
  trialEndDate: string
}): string {
  return renderEmailTemplate({
    heading: 'Welcome to Havenue — your trial is live',
    preheader: `Your ${vars.plan} trial is ready. Here's how to get to your first kitchen-ready event order.`,
    paragraphs: [
      `Hi ${vars.name}, your <strong>${vars.plan}</strong> workspace is ready and your free trial has started.`,
      `The fastest path to value: drop in a PDF of one of your existing menus, watch the OCR extract the recipes, and then build a single set menu so you can see your live cost-per-head and GP%.`,
      `We won't charge you anything until <strong>${vars.trialEndDate}</strong>. You can cancel anytime from account settings &mdash; no friction, no calls.`,
      `If you get stuck or want a 15-minute walkthrough with a hospitality specialist, just reply to this email.`,
    ],
    actionLabel: 'Open your Havenue dashboard',
    actionUrl: 'https://havenue.co',
  })
}

export function trialEndingHTML(vars: {
  name: string
  plan: string
  endDate: string
}): string {
  return renderEmailTemplate({
    heading: `3 days left on your ${vars.plan} trial`,
    preheader: `A quick heads-up before your trial converts on ${vars.endDate}.`,
    paragraphs: [
      `Hi ${vars.name}, just a quick heads-up: your Havenue trial converts on <strong>${vars.endDate}</strong>.`,
      `If you keep your plan, nothing breaks &mdash; your menus, suppliers, and event sheets carry across without a reset, and the team you invited stays put.`,
      `If you'd rather cancel, you can do that in two clicks from account settings before <strong>${vars.endDate}</strong>. No call, no questionnaire.`,
      `If you're on the fence, reply to this email and tell me what's missing. I read every reply personally.`,
    ],
    actionLabel: 'Continue using Havenue',
    actionUrl: 'https://havenue.co',
  })
}

export function paymentReceiptHTML(vars: {
  name: string
  amount: string
  invoiceUrl: string
  period: string
}): string {
  return renderEmailTemplate({
    heading: 'Payment received — thank you',
    preheader: `Your invoice for ${vars.period} is ready.`,
    paragraphs: [
      `Hi ${vars.name}, thanks for renewing &mdash; we received your payment of <strong>${vars.amount}</strong> for ${vars.period}.`,
      `Your invoice is attached at the link below for your accounting team. Nothing else from you required.`,
    ],
    actionLabel: 'View invoice',
    actionUrl: vars.invoiceUrl,
  })
}

export function paymentFailedHTML(vars: {
  invoiceUrl: string
}): string {
  return renderEmailTemplate({
    heading: "We couldn't charge your card — quick fix below",
    preheader: 'Update your payment method to keep Havenue running without interruption.',
    paragraphs: [
      `We tried to put through your latest Havenue payment and your card declined. This happens &mdash; usually it's an expired card or a temporary bank flag.`,
      `Update your payment method below and we'll retry automatically. Your account stays active in the meantime, no rush.`,
      `If you've already fixed it on your bank's side, you can ignore this email.`,
    ],
    actionLabel: 'Update payment method',
    actionUrl: vars.invoiceUrl,
  })
}
