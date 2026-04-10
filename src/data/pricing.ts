import type { PricingTier, SectionCopy } from '../types';

export const pricingCopy: SectionCopy = {
  headline: 'Less Than the Cost of One Mis-Costed Event.',
  subheadline: 'Choose the plan that fits your venue. Go live in 20 minutes. Cancel anytime.',
};

/** Stripe price IDs — populated from environment variables at runtime */
export const stripePriceIds = {
  starter_monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY ?? '',
  starter_annual: import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL ?? '',
  pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL ?? '',
} as const;

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '£199',
    perEvent: '£7/event',
    target: 'Perfect for independent caterers, restaurants, and chef-owned venues.',
    description: 'Everything you need to run professional catering operations.',
    features: [
      'Smart Inventory Management',
      'Recipe & Set Menu Builder',
      'Live COGS & GP% Tracking',
      'AI Allergen Safety Flagging',
      'Catering Order Form Generation & Editor (PDF)',
      'OCR Menu Digitisation',
    ],
    unavailableFeatures: [
      'Generated Guest Dietary Sub-Menus',
      'Event CRM Dashboard',
      'Financial Vault (Per-Event P&L)',
      'DOCX Export',
    ],
    cta: {
      text: 'Start Free Trial',
      href: '#',
      variant: 'ghost',
      microcopy: '7-day free trial · Cancel anytime · No charge until day 8',
      analyticsEvent: 'pricing_starter_clicked',
    },
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '£399',
    perEvent: '£3/event',
    target: 'For high-volume venues, event caterers, and scaling agencies.',
    description: 'Advanced features for power users who want full control.',
    features: [
      'Everything in Starter',
      'Guest Dietary Sub-Menu Generation',
      'Event CRM Dashboard',
      'Financial Vault (Per-Event P&L)',
      'PDF + DOCX Export',
      'Priority Support (12h)',
      '£3/event (vs £7 on Starter)',
    ],
    cta: {
      text: 'Start Your Pro Free Trial',
      href: '#',
      variant: 'primary',
      microcopy: '7-day free trial · Cancel anytime · No charge until day 8',
      analyticsEvent: 'pricing_pro_clicked',
    },
    highlighted: true,
    badge: 'MOST POPULAR',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    perEvent: '£2/event',
    target: 'For multi-venue hotel groups and global hospitality brands.',
    description: 'White-glove service for complex multi-tenant deployments.',
    features: [
      'Everything in Pro',
      'Multi-Tenant Architecture',
      'Dedicated Account Manager',
      'White-Glove Onboarding',
      'Custom Integrations & API',
      'SLA Guarantees',
      '£2/event — built for scale',
    ],
    cta: {
      text: 'Talk to the Team',
      href: '#',
      variant: 'ghost',
      microcopy: 'No commitment required',
      analyticsEvent: 'pricing_enterprise_clicked',
    },
    highlighted: false,
  },
];

export const pricingUrgency = {
  banner: 'Beta Pricing — Lock in these rates before general availability.',
};
