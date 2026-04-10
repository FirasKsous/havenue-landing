import type { Testimonial, SectionCopy } from '../types';

export const socialProofCopy: SectionCopy = {
  headline: 'What Our Early Adopters Are Saying',
  subheadline: 'Real feedback from chefs, sales managers, and venue staff who tried Havenue.',
};

export const testimonials: Testimonial[] = [
  {
    quote: "I used to throw away two bin bags of prep every Monday because my ordering was based on gut feeling and a spreadsheet from 2019. Since I started using Havenue, I can see exactly what every dish costs me down to the gram. My food waste has dropped and my GP went up in less than two months. I actually know where our money goes now.",
    name: 'Gianni R.',
    role: 'Executive Catering Chef',
    metric: 'GP: 68% → 79%',
  },
  {
    quote: "Honestly, I became a chef to cook, not to sit in an office typing dietary requirements into Word documents until midnight. Havenue cut my admin from about 19 hours a week to maybe two. The event orders come out perfect, every allergen is flagged, and I haven't had to redo a single one. I can now focus back on my kitchen instead.",
    name: 'Matteo M.',
    role: 'Executive Chef',
    metric: 'Admin: 15h → 2h/week',
  },
  {
    quote: "Before Havenue, showing to a client that we can cater for his party dietaries took me half a day, pulling recipes, checking allergies, building the menu, making sure the margins worked. Now I can build a fully costed Customer Order Form in 5 minutes and send it while the client is still on the phone. My Event's close rate went up because I'm faster than every other venue they're talking to.",
    name: 'Firas B.',
    role: 'Sales Manager',
    metric: 'Quotes in 5 min vs 4h',
  },
  {
    quote: "My floor staff used to hate allergy heavy events. Someone always got the wrong plate, a guest would complain, and I'd spend the rest of the night putting out fires. Since we started using this new system, every single event order comes with clear allergen flags for each guest. My team trusts it. Complaints have pretty much stopped. I can actually enjoy a service now instead of holding my breath the whole time.",
    name: 'Alisa I.',
    role: 'Event Supervisor',
    metric: 'Zero complaints',
  },
];

// Duplicate for infinite scroll effect
export const topRowTestimonials = [...testimonials.slice(0, 2), ...testimonials.slice(0, 2), ...testimonials.slice(0, 2)];
export const bottomRowTestimonials = [...testimonials.slice(2, 4), ...testimonials.slice(2, 4), ...testimonials.slice(2, 4)];
