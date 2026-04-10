export interface CTAConfig {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  microcopy?: string;
  analyticsEvent?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  perEvent: string;
  target: string;
  description: string;
  features: string[];
  unavailableFeatures?: string[];
  cta: CTAConfig;
  highlighted: boolean;
  badge?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  metric?: string;
}

export interface Metric {
  value: string;
  unit: string;
  subtext: string;
  prefix?: string;
  suffix?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SectionCopy {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  body?: string;
  bullets?: string[];
  cta?: CTAConfig;
}

// Calendly embed widget global type
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}
