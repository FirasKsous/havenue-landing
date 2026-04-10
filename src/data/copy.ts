import type { SectionCopy, NavLink } from '../types';

export const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'ROI', href: '#roi' },
];

export const heroCopy: SectionCopy = {
  eyebrow: 'THE OPERATIONAL BRAIN FOR ELITE HOSPITALITY',
  headline: 'The First AI Engine That Costs Your Menus, Runs Your Events, and Eliminates Allergy Risk.',
  subheadline: 'Stop guessing your margins and risking allergy incidents. Havenue uses a 100% deterministic AI engine to instantly cost your menus, track your inventory, and generate flawless kitchen-ready event orders.',
  cta: {
    text: 'Start Your Free Trial',
    href: '#pricing',
    variant: 'primary',
    microcopy: 'No credit card required. 20-minute setup.',
    analyticsEvent: 'hero_cta_clicked',
  },
};

export const trustBarCopy = {
  badges: [
    { icon: 'ChefHat', text: 'Built by Hospitality Veterans (Chefs & Sales Managers)' },
    { icon: 'ShieldCheck', text: '100% Zero-Hallucination AI Architecture' },
    { icon: 'FileCheck', text: "Natasha's Law Compliant" },
    { icon: 'Globe', text: 'FDA Dietary Standard Ready' },
  ],
};

export const agitationCopy: SectionCopy = {
  headline: 'Your Venue Is Losing £127,000 a Year. And You Can\'t See Where.',
  subheadline: 'Between wasted food, burned wages, and one allergen mistake away from a lawsuit — the cost of running catering on spreadsheets is catastrophic. Here\'s what it\'s actually costing you.',
};

export const agitationCards = [
  {
    icon: 'TrendingDown',
    title: 'Blind Costing & Waste.',
    body: 'Untracked ingredient price fluctuations and manual over-ordering are silently killing your Gross Profit. Stop guessing your COGS on broken spreadsheets.',
    anchor: 'The average venue loses £38,000–£52,000/year to untracked food waste and over-ordering alone.',
  },
  {
    icon: 'Clock',
    title: 'Wasted Wages on Manual Admin.',
    body: 'Your Sales Managers and Executive Chefs are spending 20+ hours a week each manually typing out dietary requirements and event sheets instead of driving revenue.',
    anchor: 'At £25/hour, that is £47,000/year per manager burned on spreadsheets.',
  },
  {
    icon: 'AlertTriangle',
    title: 'The 1-in-10 Risk.',
    body: 'A single manual data-entry error mapping a guest\'s severe allergy to a set menu can result in guest distress, loss of trust, and business-ending lawsuits.',
    anchor: 'Average UK allergen claim settlement: £85,000+. One incident can destroy a decade of reputation.',
  },
];

export const paradigmShiftCopy: SectionCopy = {
  headline: 'One Unified Brain. From Event Booking to Kitchen Floor.',
  body: 'Stop using five different softwares that refuse to talk to each other. Havenue\'s Event CRM tracks every executed event with ruthless financial accuracy. Visualize your exact costs, revenue, and realized profit on past events—and accurately forecast your future pipeline—all in one dashboard.',
};

export const howItWorksCopy: SectionCopy = {
  headline: 'From PDF Menus to Kitchen-Ready Event Orders. In Three Clicks.',
  subheadline: 'Go live in 20 minutes — not 90 days. No IT department required. No broken integrations.',
};

export const steps = [
  {
    icon: 'Upload',
    title: 'Upload Your Menus',
    description: 'Drag and drop your existing PDF recipes and supplier lists. Our OCR engine digitizes everything in seconds.',
  },
  {
    icon: 'Calculator',
    title: 'Build & Cost Menus',
    description: 'Create recipes and set menus with live Cost Per Head and GP% tracking. Lock in your margins before the event.',
  },
  {
    icon: 'FileOutput',
    title: 'Generate Event Orders',
    description: 'The AI engine produces kitchen-ready, allergy-safe Catering Event Order Forms. Hit print and execute.',
  },
];

export const featureOCRCopy: SectionCopy = {
  headline: 'Don\'t Type. Upload.',
  body: 'Forget 90-day onboarding nightmares. Simply drag and drop your existing PDF recipes and supplier set menus into our proprietary OCR engine. Havenue instantly reads, digitizes, and maps your unstructured data into a smart, searchable Smart Inventory Database in seconds.',
  bullets: [
    'Instant digitisation of PDFs and Word Docs.',
    'Automatic allergen and dietary tag extraction',
    'Supplier price import with cost tracking',
  ],
};

export const featureMenuBuilderCopy: SectionCopy = {
  headline: 'Build Menus. Protect Margins. Down to the Penny.',
  body: 'Take absolute control of your profitability. Our Set Menu & Recipe Builder dynamically links to your live ingredient database. As you drag and drop dishes into an event menu, watch your Cost Per Head (CPH) and projected Gross Profit (GP%) update in real-time. Lock in an 80%+ margin before a single carrot is chopped.',
  bullets: [
    'Live COGS tracking & theoretical yield management.',
    'Per-course cost breakdown (Starter, Main, Dessert)',
    'Automatic allergen and dietary flags on every menu item',
  ],
};

export const featureSafetyEngineCopy: SectionCopy = {
  headline: 'From Allergy List to Kitchen-Ready Event Order. Zero Errors.',
  body: 'Inconsistent AI that "hallucinates" has no place in a commercial kitchen. Our AI Engine guarantees mathematically perfect, zero-error dietary safety. When a group of guests submits a complex allergy list, the system automatically flags hazards, swaps recipes, and assigns flawless replacement dishes and custom sub-menus for each of them.',
};

export const safetySteps = [
  {
    icon: 'Users',
    label: 'Guest Profiles & Allergies',
    description: 'Input dietary requirements for each guest',
  },
  {
    icon: 'Cpu',
    label: 'Deterministic AI Engine Scan',
    description: '100% Deterministic — Zero Hallucination',
  },
  {
    icon: 'FileOutput',
    label: 'Kitchen-Ready Output',
    description: 'Branded PDF & DOCX Event Orders',
  },
];

export const roiCopy: SectionCopy = {
  headline: 'The Numbers Behind Venues That Scale.',
};

export const roiMetrics = [
  {
    icon: 'Clock',
    value: '200+',
    unit: 'HOURS / MONTH',
    label: 'Hours Saved',
    description: 'recovered from manual data entry and spreadsheet formatting',
  },
  {
    icon: 'TrendingUp',
    value: '100%',
    unit: 'MARGIN CLARITY',
    label: 'Margin Clarity',
    description: 'No more guessing COGS. Live GP% tracking protects your bottom line',
  },
  {
    icon: 'ChefHat',
    value: '30%',
    unit: 'CAPACITY SCALING',
    label: 'More Events',
    description: 'Automating the admin allows your venue to physically execute and book 30% more events every month without hiring additional staff',
  },
];

export const roiCalculation = {
  title: 'ROI Example: 100-Guest Corporate Event',
  subtitle: 'Based on Pro Plan pricing',
  fees: {
    monthly: '£399/mo',
    perEvent: '£3/event',
  },
  gain: '+£1,850 GP',
  roi: '24× return',
};

export const socialProofCopy: SectionCopy = {
  headline: 'What Our Early Adopters Are Saying',
  subheadline: 'Real feedback from chefs, sales managers, and venue staff who tried Havenue.',
};

export const pricingCopy: SectionCopy = {
  headline: 'Less Than the Cost of One Mis-Costed Event.',
  subheadline: 'Choose the plan that fits your venue. Go live in 20 minutes. Cancel anytime.',
};

export const faqCopy: SectionCopy = {
  headline: 'Everything You Need to Know',
  subheadline: 'Straight answers to the questions hospitality professionals ask most.',
};

export const footerCopy = {
  tagline: 'The operational brain for elite hospitality.',
  cta: {
    headline: 'Join the Venues Already Scaling with us.',
    buttonText: 'Start Automating Your Venue',
    microcopy: 'Free trial. No credit card. 20-minute setup.',
  },
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Book a Demo', href: '#pricing' },
        { label: 'OCR Engine', href: '#features' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Hospitality ROI Calculator', href: '#roi' },
        { label: "Natasha's Law Guide", href: '#safety-engine' },
        { label: 'Blog', href: '#testimonials' },
        { label: 'Help Center', href: '#faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy/' },
        { label: 'Cookie Policy', href: '/cookie-policy/' },
        { label: 'Marketing Policy', href: '/marketing-policy/' },
      ],
    },
  ],
  copyright: '© 2026 Havenue. All rights reserved.',
};
