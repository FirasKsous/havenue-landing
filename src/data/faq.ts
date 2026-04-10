import type { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    question: 'How long does it take to set up catering management software?',
    answer: "Most catering software takes weeks or months to set up. Havenue is different — most venues are fully operational in about 20 minutes. You upload your existing PDF recipes and menus, our AI engine reads them, and your ingredient database builds itself into a smart recipe and inventory system. No IT department needed, no data migration project, no training programme. You can run your first event the same day you sign up.",
  },
  {
    question: "Why isn't there other AI software like this for catering? What makes Havenue different?",
    answer: "Honestly, because it's an incredibly hard problem to solve. During development, we discovered that building an AI engine for dietary safety in catering isn't something you can do with ChatGPT or any off-the-shelf AI. Those tools guess — and in a commercial kitchen, guessing about a nut allergy can put someone in hospital. So we built something from scratch: an engine that checks every single dish against every single guest's dietary requirements using your actual verified ingredient data. It doesn't predict or generate. That's why it can't make a mistake.",
  },
  {
    question: 'Can I import my existing recipes and supplier price lists into Havenue?',
    answer: "Yes. Our AI engine accepts PDF and Word documents — recipe cards, supplier price lists, set menus, whatever you've got. Upload them, and Havenue digitises everything automatically. Most venues upload 50 to 100 recipes in under 10 minutes. You don't have to retype a single ingredient.",
  },
  {
    question: 'How does Havenue pricing work? Is there a per-event fee?',
    answer: 'Havenue has three main plans: Starter at £199/month, Pro at £399/month, and our Multi-Venue Enterprise Plan. They include a small per-event fee — £7 per event on Starter, £3 per event on Pro, and £2 per event on Enterprise. This means you pay based on how much you actually use the platform. The more events you run, the more value you get.',
  },
  {
    question: 'How does Havenue handle food allergens and dietary requirements for catering events?',
    answer: "When you create an event, you enter each guest's dietary requirements — nut allergy, gluten-free, vegan, even 'No Aubergine' — whatever they need. The AI engine scans every dish on your set menu against every guest's requirements and flags exactly which dishes are safe and which aren't. On our Pro plan, it automatically generates a personalised sub-menu for each dietary guest with safe alternative dishes already selected. The output is a kitchen-ready Catering Event Order with clear allergen annotations.",
  },
  {
    question: 'What is a good gross profit margin for a catering business, and how do I track it?',
    answer: "A healthy gross profit margin for catering is typically between 65% and 80%, depending on the type of venue and event. The challenge is that most venues don't know their real GP% until weeks after an event — if they calculate it at all. Havenue shows you your projected GP% in real-time as you build each set menu, so you can lock in your target margin before a single ingredient is ordered.",
  },
  {
    question: 'Is my recipe and pricing data secure on Havenue?',
    answer: "Your data is stored on enterprise-grade infrastructure with full encryption at rest and in transit. Every venue's data is completely isolated — no other customer can ever see your recipes, ingredient costs, or guest information. We are GDPR compliant and aligned with Natasha's Law (UK) and FDA dietary standards. Your recipes and pricing are your competitive advantage, and we treat them that way.",
  },
  {
    question: 'Can I use Havenue if I run a restaurant without private events or catering?',
    answer: 'Absolutely. Havenue is not just for caterers. The Starter plan includes full Smart Inventory Management, a Recipe Builder with ingredient-level costing, a Set Menu Builder with live GP% tracking, and real-time COGS tracking. If you run a restaurant and want to know exactly what every dish costs you — without spreadsheets — Havenue does that.',
  },
  {
    question: 'How do I calculate the true cost of a catering menu item including waste and portion variation?',
    answer: "Traditional recipe costing misses two things: prep waste (trim, peel, bones) and portion inconsistency. Havenue handles this at the recipe level. When you build a recipe, you set yields per ingredient, and the system calculates your true cost per portion automatically. As ingredient prices change, your recipe costs update in real-time, so your menu pricing always reflects reality, not last quarter's spreadsheet.",
  },
  {
    question: 'Can a hospitality software handle multiple venues, brands, or client accounts?',
    answer: 'Yes. Our Enterprise tier supports multi-tenant architecture where you can manage multiple venues, brands, or client accounts from one login. Each venue maintains its own completely isolated database of recipes, menus, ingredients, and pricing. A hotel group running five restaurants and a catering arm can manage all of them centrally while keeping each kitchen\'s data separate.',
  },
  {
    question: 'What file formats does Havenue export for kitchen use?',
    answer: 'Havenue exports kitchen-ready Catering Event Order Forms in PDF format on the Starter plan, and both PDF and DOCX (editable Word) on the Pro plan. Every export is branded with your venue\'s identity and includes full dietary annotations, allergen safety flags, course-by-course breakdowns, and a financial summary.',
  },
  {
    question: 'What if I\'m currently managing everything in spreadsheets — is it worth switching?',
    answer: 'Spreadsheets cannot update your recipe costs when suppliers raise prices. They cannot flag that the chicken dish you\'re serving contains an allergen that a guest reported. They cannot show you your GP% in real-time. And they definitely cannot generate a kitchen-ready event order with allergen annotations for 200 guests in seconds. If you\'re running a food business on spreadsheets, you\'re spending hours on work that should take minutes — and you\'re carrying risk you cannot see. The switch takes 20 minutes.',
  },
];

export const faqCta = {
  question: "Still have questions? We're here to help.",
  cta: {
    text: 'Chat with Us',
    href: '#pricing',
  },
};
