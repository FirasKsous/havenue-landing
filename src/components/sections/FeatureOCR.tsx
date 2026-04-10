import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { featureOCRCopy } from '../../data/copy';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight } from 'lucide-react';
import { MessyPDFBefore } from '../ui/MessyPDFBefore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ShowcaseImageModal } from '../modals/ShowcaseImageModal';

export function FeatureOCR() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleImageClick = useCallback(() => setIsModalOpen(true), []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Before PDF slides in from left, After dashboard slides in from right
  const beforeX = useTransform(scrollYProgress, [0, 0.6], [-60, 0]);
  const afterX = useTransform(scrollYProgress, [0, 0.6], [80, 0]);
  const beforeOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const afterOpacity = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const afterScale = useTransform(scrollYProgress, [0.1, 0.6], [0.92, 1]);
  // Arrow pulses into view
  const arrowScale = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const arrowOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1]);

  return (
    <section
      id="features"
      className="relative overflow-x-clip"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)',
      }}
    >
      {/* Subtle ambient glow — pre-blurred gradient, no CSS filter */}
      <div
        className="absolute top-1/2 right-0 w-[800px] h-[800px] -translate-y-1/2 translate-x-1/3 opacity-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(47, 143, 78,0.06) 0%, transparent 50%)',
        }}
      />

      <div ref={sectionRef} className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Asymmetric grid: images wider on left */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-center">
          {/* Visual — LEFT: Before/After transformation narrative (wider) */}
          <div className="relative lg:-ml-12 xl:-ml-24">
            {/* Before → After flow */}
            <div className="flex items-center gap-3 lg:gap-5">
              {/* BEFORE: Messy PDF Document */}
              <motion.div
                className="flex-shrink-0 w-[28%]"
                style={isMobile ? undefined : { x: beforeX, opacity: beforeOpacity, willChange: 'transform' }}
              >
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 text-center">
                  Before
                </div>
                <MessyPDFBefore />
              </motion.div>

              {/* Arrow connector — springs into view on scroll */}
              <motion.div
                className="flex-shrink-0"
                style={isMobile ? undefined : { scale: arrowScale, opacity: arrowOpacity }}
              >
                <div className="w-10 h-10 rounded-full bg-[#2F8F4E]/15 flex items-center justify-center border-2 border-[#2F8F4E]/40" style={{ boxShadow: '0 0 12px rgba(47, 143, 78,0.2), 0 0 30px rgba(47, 143, 78,0.08)' }}>
                  <ArrowRight className="w-5 h-5 text-[#2F8F4E]" />
                </div>
              </motion.div>

              {/* AFTER: Clean OCR Dashboard — dominant, scales in */}
              <motion.div
                className="flex-1"
                style={isMobile ? undefined : { x: afterX, opacity: afterOpacity, scale: afterScale, willChange: 'transform' }}
              >
                <div className="text-[10px] font-bold text-[#2F8F4E] uppercase tracking-wider mb-2 text-center">
                  After
                </div>
                <GlassCard
                  noBlur
                  className="relative p-0 border-[#2F8F4E]/30 cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.03]"
                  style={{
                    boxShadow:
                      '0 30px 60px rgba(0,0,0,0.5), 0 0 60px rgba(47, 143, 78,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                  onClick={handleImageClick}
                >
                  <div className="rounded-lg overflow-hidden bg-[#111]">
                    <picture>
                      <source
                        srcSet="/images/ocr-dish-database.webp"
                        type="image/webp"
                      />
                      <img
                        src="/images/ocr-dish-database.png"
                        alt="Havenue OCR engine converting PDF menus into structured dish database with ingredients and costs"
                        className="w-full h-auto block"
                        width="800"
                        height="500"
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Ambient glow — no blur filter for performance */}
            <div className="absolute -inset-20 rounded-3xl -z-10 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse at center, rgba(47, 143, 78,0.04) 0%, transparent 70%)' }} />
          </div>

          {/* Content — RIGHT (narrower) */}
          <div>
            <SectionHeading
              headline={featureOCRCopy.headline}
              headingLevel="h3"
              body={featureOCRCopy.body}
              bullets={featureOCRCopy.bullets}
              align="left"
            />
          </div>
        </div>
      </div>

      <ShowcaseImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc="/images/ocr-dish-database.png"
        imageWebP="/images/ocr-dish-database.webp"
        imageAlt="Havenue OCR engine converting PDF menus into structured dish database with ingredients and costs"
      />
    </section>
  );
}
