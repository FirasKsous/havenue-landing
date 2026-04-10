import { howItWorksCopy, steps } from '../../data/copy';
import { Upload, Calculator, FileOutput, ArrowRight } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

const iconMap = {
  Upload,
  Calculator,
  FileOutput,
};

export function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headline={howItWorksCopy.headline}
          subheadline={howItWorksCopy.subheadline}
          className="mb-12 lg:mb-16"
        />

        <div className="relative">
          {/* Steps Container - Equal Height Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];
              return (
                <div
                  key={index}
                  className="relative h-full"
                >
                  {/* Step Card */}
                  <div className="h-full min-h-[280px] flex flex-col bg-white/[0.03] border border-white/10 rounded-xl p-6 lg:p-8 hover:border-[#2F8F4E]/30 hover:bg-white/[0.05] transition-all duration-300 group">
                    {/* Step Number */}
                <div className="absolute -top-3 -left-2 w-10 h-10 rounded-lg bg-[#2F8F4E] flex items-center justify-center text-[#0A0A0A] font-bold text-base shadow-lg shadow-[#2F8F4E]/20 z-10">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#2F8F4E]/10 flex items-center justify-center mb-4 group-hover:bg-[#2F8F4E]/15 group-hover:scale-105 transition-all duration-300">
                      <Icon className="w-6 h-6 text-[#2F8F4E]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-white mb-2 text-lg lg:text-xl">
                        {step.title}
                      </h3>
                      <p className="text-white/60 leading-relaxed text-base flex-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Connector - Desktop Only */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 lg:-right-4 transform -translate-y-1/2 z-10 items-center justify-center">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#2F8F4E]/10 border border-[#2F8F4E]/30 flex items-center justify-center animate-pulse">
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-[#2F8F4E]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Connectors */}
          <div className="md:hidden absolute left-6 top-12 bottom-12 w-px bg-gradient-to-b from-[#2F8F4E]/30 via-[#2F8F4E]/10 to-transparent -z-10" />
        </div>
      </div>
    </section>
  );
}
