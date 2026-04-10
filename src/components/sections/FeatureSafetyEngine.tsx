import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { featureSafetyEngineCopy, safetySteps } from '../../data/copy';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeading } from '../ui/SectionHeading';
import { Users, Cpu, FileOutput } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const iconMap = {
  Users,
  Cpu,
  FileOutput,
};

export function FeatureSafetyEngine() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Main COF Output: slight rotation that changes on scroll (desktop only)
  const mainRotate = useTransform(scrollYProgress, [0, 0.5], [2, -1]);

  // Financial Vault: separates on scroll to reveal layered depth (desktop only)
  const vaultY = useTransform(scrollYProgress, [0.1, 0.35, 0.6], [0, 25, 60]);
  const vaultX = useTransform(scrollYProgress, [0.1, 0.35, 0.6], [0, 20, 50]);
  const vaultScale = useTransform(scrollYProgress, [0.1, 0.4, 0.6], [0.85, 0.95, 1.02]);
  const vaultRotate = useTransform(scrollYProgress, [0.1, 0.5], [-2, 3]);

  return (
    <section
      id="safety-engine"
      className="relative overflow-x-clip"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      {/* Subtle ambient glow — pre-blurred gradient, no CSS filter */}
      <div
        className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-12 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(47, 143, 78,0.06) 0%, transparent 50%)',
        }}
      />

      <div ref={sectionRef} className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Asymmetric grid: images wider on left */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-center">
          {/* Visual — LEFT (wider): Stacked on mobile, parallax layered on desktop */}
          <div className="relative order-2 lg:order-1 lg:-ml-12 xl:-ml-28 lg:min-h-[400px]">
            {/* Primary: COF Output — scroll-linked rotation (desktop only) */}
            <motion.div
              className="relative z-10"
              style={isMobile ? undefined : {
                rotate: mainRotate,
                willChange: 'transform',
              }}
            >
              <GlassCard
                noBlur
                className="relative p-0 border-[#2F8F4E]/25 cursor-pointer"
                style={{
                  boxShadow: `
                    0 40px 80px rgba(0,0,0,0.5),
                    0 0 60px rgba(47, 143, 78,0.1),
                    inset 0 1px 0 rgba(255,255,255,0.06)
                  `,
                }}
              >
                <div className="rounded-lg overflow-hidden bg-[#111]">
                  <picture>
                    <source srcSet="/images/engine-cof-output.webp" type="image/webp" />
                    <img
                      src="/images/engine-cof-output.png"
                alt="Havenue AI Safety Engine generating allergy-safe Catering Event Order with dietary sub-menus"
                      className="w-full h-auto block"
                      width="1200"
                      height="800"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
              </GlassCard>
            </motion.div>

            {/* Secondary: Financial Vault — overlapping card on mobile, absolute overlay on desktop */}
            <motion.div
              className="relative -mt-10 w-[92%] ml-auto z-20 lg:absolute lg:mt-0 lg:ml-0 lg:-bottom-6 lg:-right-2 lg:w-[62%]"
              style={isMobile ? undefined : {
                y: vaultY,
                x: vaultX,
                scale: vaultScale,
                rotate: vaultRotate,
                willChange: 'transform',
              }}
            >
              <div
                className="rounded-xl overflow-hidden border-2 border-[#2F8F4E]/45 bg-[#111] cursor-pointer"
                style={{
                  boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 50px rgba(47, 143, 78,0.2)',
                }}
              >
                <picture>
                  <source srcSet="/images/financial-vault-breakdown.webp" type="image/webp" />
                  <img
                    src="/images/financial-vault-breakdown.png"
                    alt="Financial breakdown showing per-event P&L with revenue, food cost, and GP%"
                    className="w-full h-auto block"
                    width="600"
                    height="400"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </motion.div>

            {/* Ambient glow — no blur filter for performance */}
            <div className="absolute -inset-20 rounded-3xl -z-10 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse at center, rgba(47, 143, 78,0.04) 0%, transparent 70%)' }} />
          </div>

          {/* Content — RIGHT (narrower) */}
          <div className="order-1 lg:order-2">
            <SectionHeading
              headline={featureSafetyEngineCopy.headline}
              headingLevel="h3"
              body={featureSafetyEngineCopy.body}
              align="left"
            />

            {/* Steps */}
            <div className="mt-10 space-y-4">
              {safetySteps.map((step, index) => {
                const Icon = iconMap[step.icon as keyof typeof iconMap];
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#2F8F4E]/20 hover:bg-white/[0.04] transition-colors duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#2F8F4E]/10 flex items-center justify-center flex-shrink-0 border border-[#2F8F4E]/20">
                      <Icon className="w-5 h-5 text-[#2F8F4E]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1 text-base lg:text-lg">
                        {step.label}
                      </h4>
                      <p className="text-white/50 text-base leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
