import { useState, useCallback } from 'react';
import { TrendingUp, Clock, ChefHat, Calculator } from 'lucide-react';
import { roiCopy, roiCalculation } from '../../data/copy';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { SectionHeading } from '../ui/SectionHeading';
import { CounterAnimation } from '../ui/CounterAnimation';
import { ROICalculatorModal } from '../modals/ROICalculatorModal';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';

const iconMap = {
  TrendingUp,
  Clock,
  ChefHat,
};

interface MetricCardProps {
  iconName: string;
  metric: string;
  label: string;
  description: string;
  numericValue?: number;
  suffix?: string;
  showDivider?: boolean;
}

function MetricCard({ iconName, metric, label, description, numericValue, suffix = '', showDivider = false }: MetricCardProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap] || TrendingUp;

  return (
    <GlassCard
      className={cn(
        'p-5 text-center',
        showDivider && 'sm:border-r sm:border-white/10 sm:rounded-r-none'
      )}
      hoverEffect
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#2F8F4E]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#2F8F4E]" />
      </div>
      <div className="font-extrabold text-[#2F8F4E] mb-1 text-4xl md:text-6xl lg:text-7xl">
        {numericValue !== undefined ? (
          <CounterAnimation
            end={numericValue}
            suffix={suffix}
            isVisible={true}
          />
        ) : (
          metric
        )}
      </div>
      <div className="font-semibold text-white mb-2 text-sm">
        {label}
      </div>
      <p className="text-white/50 max-w-xs mx-auto text-sm leading-relaxed">
        {description}
      </p>
    </GlassCard>
  );
}

export function ROIAnchor() {
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  const handleCalcCTAClick = useCallback(() => {
    trackEvent({ event: 'cta_clicked', data: { location: 'roi_section', label: 'Get your free ROI calculator' } });
    setIsCalcModalOpen(true);
  }, []);

  return (
    <section
      id="roi"
      className="relative"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headline={roiCopy.headline}
          subheadline={roiCopy.subheadline}
          className="mb-10"
        />

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <MetricCard
            iconName="Clock"
            metric="200+"
            numericValue={200}
            suffix="+"
            label="Hours Saved"
            description="recovered from manual data entry"
            showDivider
          />
          <MetricCard
            iconName="TrendingUp"
            metric="100%"
            numericValue={100}
            suffix="%"
            label="Margin Clarity"
            description="Live GP% tracking protects profits"
            showDivider
          />
          <MetricCard
            iconName="ChefHat"
            metric="30%"
            numericValue={30}
            suffix="%"
            label="More Events"
            description="Book more without hiring staff"
          />
        </div>

        {/* ROI Calculation */}
        <GlassCard
          className="max-w-4xl mx-auto p-8 md:p-10 border-[#2F8F4E]/20"
          hoverEffect={false}
        >
          <div className="text-center mb-8">
            <h3 className="font-bold text-white mb-2 text-2xl md:text-3xl">
              {roiCalculation.title}
            </h3>
            <p className="text-white/50 text-sm">
              {roiCalculation.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-white/50 uppercase tracking-wider mb-1 text-xs">
                Monthly Fee
              </p>
              <p className="font-bold text-white text-xl md:text-2xl">
                {roiCalculation.fees.monthly}
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-white/50 uppercase tracking-wider mb-1 text-xs">
                Per-Event Fee
              </p>
              <p className="font-bold text-white text-xl md:text-2xl">
                {roiCalculation.fees.perEvent}
              </p>
            </div>
            <div className="text-center p-4 bg-[#2F8F4E]/10 rounded-lg border border-[#2F8F4E]/20">
              <p className="text-[#2F8F4E]/70 uppercase tracking-wider mb-1 text-xs">
                GP Recovery
              </p>
              <p className="font-bold text-[#2F8F4E] text-xl md:text-2xl">
                {roiCalculation.gain}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="text-center sm:text-left">
              <p className="text-white/70 text-sm">
                <span className="font-semibold text-white">ROI:</span> {roiCalculation.roi}
              </p>
              <p className="text-white/50 text-sm">
                Average across first 3 events
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <GlassButton
                onClick={handleCalcCTAClick}
                variant="secondary"
                className="text-sm px-5 py-2.5"
              >
                <Calculator className="w-4 h-4" />
                Get Your Free ROI Calculator
              </GlassButton>
              <GlassButton href="#pricing" variant="primary" className="text-sm px-5 py-2.5">
                Start Free Trial
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>

      <ROICalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
      />
    </section>
  );
}
