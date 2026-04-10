import { assert, assertNotMatch } from 'jsr:@std/assert'

import {
  paymentFailedHTML,
  paymentReceiptHTML,
  trialEndingHTML,
  trialWelcomeHTML,
} from './resend.ts'

const stripeWebhookPath = new URL('../stripe-webhook/index.ts', import.meta.url)

Deno.test('transactional email templates stay Havenue-branded and text-first', () => {
  const renderedTemplates = [
    trialWelcomeHTML({ name: 'Alex', plan: 'Pro', trialEndDate: '18 April 2026' }),
    trialEndingHTML({ name: 'Alex', plan: 'Pro', endDate: '18 April 2026' }),
    paymentReceiptHTML({
      name: 'Alex',
      amount: '£399',
      invoiceUrl: 'https://example.com/invoice',
      period: 'your monthly plan',
    }),
    paymentFailedHTML({ invoiceUrl: 'https://example.com/invoice' }),
  ]

  for (const markup of renderedTemplates) {
    assert(markup.includes('Havenue'))
    assertNotMatch(markup, /CateringOS/u)
    assertNotMatch(markup, /<img\b/u)
    assertNotMatch(markup, /box-shadow|border-radius|background:/u)
  }
})

Deno.test('stripe webhook reuses shared transactional email templates instead of duplicating them', async () => {
  const source = await Deno.readTextFile(stripeWebhookPath)

  assertNotMatch(source, /function trialWelcomeHTML/u)
  assertNotMatch(source, /function trialEndingHTML/u)
  assertNotMatch(source, /function paymentReceiptHTML/u)
  assertNotMatch(source, /function paymentFailedHTML/u)
})
