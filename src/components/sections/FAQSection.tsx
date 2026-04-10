import { faqItems, faqCta } from '../../data/faq';
import { faqCopy } from '../../data/copy';
import { SectionHeading } from '../ui/SectionHeading';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

function FAQItem({ question, answer, index }: {
  question: string;
  answer: string;
  index: number;
}) {
  const headingId = `faq-heading-${index}`;

  return (
    <GlassCard
      className="p-5 md:p-6"
      hoverEffect={false}
    >
      <article aria-labelledby={headingId}>
        <h3 id={headingId} className="text-base font-semibold text-white mb-3">
          {question}
        </h3>
        <p className="text-base text-white/70 leading-relaxed">
          {answer}
        </p>
      </article>
    </GlassCard>
  );
}

export function FAQSection() {
  return (
    <section
      id="faq"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Header */}
          <SectionHeading
            eyebrow="FAQ"
            headline={faqCopy.headline}
            subheadline={faqCopy.subheadline}
            className="mb-8"
          />

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                index={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10 pt-8 border-t border-white/10">
            <p className="text-base text-white/80 mb-4">{faqCta.question}</p>
            <GlassButton href={faqCta.cta.href} variant="primary" className="text-sm px-5 py-2.5">
              {faqCta.cta.text}
            </GlassButton>
          </div>
        </div>
      </div>
    </section>
  );
}
