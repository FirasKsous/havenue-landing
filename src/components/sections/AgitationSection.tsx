import { agitationCopy, agitationCards } from '../../data/copy';
import { TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeading } from '../ui/SectionHeading';

const iconMap = {
  TrendingDown,
  Clock,
  AlertTriangle,
};

export function AgitationSection() {
  return (
    <section
      id="problem"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headline={agitationCopy.headline}
          subheadline={agitationCopy.subheadline}
          className="mb-10 lg:mb-14"
        />

        <div className="grid md:grid-cols-3 gap-5 lg:gap-8">
          {agitationCards.map((card, index) => {
            const Icon = iconMap[card.icon as keyof typeof iconMap];
            return (
              <GlassCard
                key={index}
                className="p-7 lg:p-10 hover:border-red-500/20 transition-all duration-300"
                hoverEffect
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-red-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-base lg:text-lg text-white/70 mb-4 leading-relaxed">{card.body}</p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm lg:text-base text-red-400/80 italic">{card.anchor}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
