import { loadStripe, type Stripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Lazy-loads the Stripe.js library. Only loads on first call (typically
 * when the user interacts with pricing CTAs), not on page load.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.warn('Stripe publishable key not configured. Checkout disabled.')
      stripePromise = Promise.resolve(null)
    } else {
      stripePromise = loadStripe(stripePublishableKey)
    }
  }
  return stripePromise
}
