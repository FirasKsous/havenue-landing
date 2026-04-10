import { memo } from 'react';
import { testimonials, socialProofCopy } from '../../data';
import { SectionHeading } from '../ui/SectionHeading';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  metric?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

// Wider horizontal card: ~540px wide, compact height
const TestimonialCard = memo(function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div
      className="flex flex-col shrink-0 w-[540px] px-8 py-5 select-none rounded-2xl border border-white/10 bg-white/[0.03]"
    >
      {/* Top Row: Attribution + Metric */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2F8F4E]/20 to-transparent flex items-center justify-center shrink-0">
            <span className="font-bold text-[#2F8F4E] text-sm">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h5 className="font-semibold text-white text-sm truncate">
              {testimonial.name}
            </h5>
            <p className="text-white/50 text-xs truncate">
              {testimonial.role}
            </p>
          </div>
        </div>

        {/* Metric Tag */}
        {testimonial.metric && (
          <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2F8F4E]/10 text-[#2F8F4E] border border-[#2F8F4E]/20 uppercase tracking-wide whitespace-nowrap">
            {testimonial.metric}
          </span>
        )}
      </div>

      {/* Quote Content */}
      <div className="relative flex-1">
        <Quote className="absolute -top-0.5 left-0 w-5 h-5 text-[#2F8F4E]/20" />
        <p className="text-white/80 leading-relaxed italic text-sm pl-7 pr-2">
          "{testimonial.quote}"
        </p>
      </div>
    </div>
  );
});

interface MarqueeRowProps {
  items: Testimonial[];
  direction?: 'left' | 'right';
  speed?: number;
}

// Two identical sets side-by-side for seamless loop
function MarqueeRow({ items, direction = 'left', speed = 50 }: MarqueeRowProps) {
  // Duplicate items enough to fill viewport (3x per set for ultra-wide)
  const set = [...items, ...items, ...items];

  return (
    <div
      role="marquee"
      aria-label={`Scrolling testimonials - row ${direction === 'left' ? '1' : '2'}`}
      className="relative overflow-hidden group"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
      }}
    >
      <div
        className={`flex w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{
          animationDuration: `${speed}s`,
          willChange: 'transform',
        }}
      >
        {/* Set A */}
        <div className="flex gap-6 shrink-0 pr-6">
          {set.map((item, index) => (
            <TestimonialCard key={`a-${item.name}-${index}`} testimonial={item} />
          ))}
        </div>
        {/* Set B (identical clone) */}
        <div className="flex gap-6 shrink-0 pr-6">
          {set.map((item, index) => (
            <TestimonialCard key={`b-${item.name}-${index}`} testimonial={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SocialProof() {
  // Split testimonials into two rows
  const midPoint = Math.ceil(testimonials.length / 2);
  const topRow = testimonials.slice(0, midPoint);
  const bottomRow = testimonials.slice(midPoint);

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)',
      }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <SectionHeading
          headline={socialProofCopy.headline}
          subheadline={socialProofCopy.subheadline}
          className="mb-10 px-4"
        />

        {/* Marquee Container */}
        <div className="flex flex-col gap-5">
          <MarqueeRow items={topRow} direction="left" speed={45} />
          <MarqueeRow items={bottomRow} direction="right" speed={50} />
        </div>

        {/* Stats Bar */}
        <div className="max-w-4xl mx-auto mt-12 px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: '£3.2M+', label: 'Costs Tracked' },
              { value: '50K+', label: 'Events Managed' },
              { value: '99.9%', label: 'Uptime' },
              { value: '0', label: 'Allergen Incidents' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-bold text-[#2F8F4E] text-xl md:text-2xl mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 uppercase tracking-wide text-xs md:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
