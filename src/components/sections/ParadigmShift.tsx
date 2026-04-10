import { paradigmShiftCopy } from '../../data/copy';
import { SectionHeading } from '../ui/SectionHeading';

export function ParadigmShift() {
  return (
    <section
      id="solution"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Centered copy block */}
          <div>
            <SectionHeading
              headline={paradigmShiftCopy.headline}
              body={paradigmShiftCopy.body}
              className="mb-10"
            />

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 lg:mb-14">
              {['Event CRM', 'Live Costing', 'GP Tracking', 'Forecasting'].map((feature, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 bg-white/5 px-2.5 py-1 rounded-full border border-white/10"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F8F4E]" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Full-width screenshot — container expands with image on hover */}
          <div className="max-w-[82rem] mx-auto">
            <div
              className="bg-white/[0.03] border border-[#2F8F4E]/25 rounded-lg p-0 cursor-pointer transition-transform duration-500 ease-out hover:scale-[1.02]"
              style={{
                boxShadow: `
                  0 40px 80px rgba(0,0,0,0.5),
                  0 0 60px rgba(47, 143, 78,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.06)
                `,
              }}
            >
              <div className="rounded-lg overflow-hidden bg-[#111]">
                <picture>
                  <source srcSet="/images/Event_CRM.webp" type="image/webp" />
                  <img
                    src="/images/Event_CRM.png"
                alt="Havenue Event CRM showing event details, execution table, and financial tracking with actual revenue, food cost, and realized GP%"
                    className="w-full h-auto block"
                    width="1200"
                    height="800"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
