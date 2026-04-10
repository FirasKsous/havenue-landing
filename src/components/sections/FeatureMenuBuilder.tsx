import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { featureMenuBuilderCopy } from '../../data/copy';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeading } from '../ui/SectionHeading';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ShowcaseImageModal } from '../modals/ShowcaseImageModal';

export function FeatureMenuBuilder() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [modalImage, setModalImage] = useState<{ src: string; webp: string; alt: string } | null>(null);
  const handleRecipeClick = useCallback(() => setModalImage({
    src: '/images/Recipe-Builder.png',
    webp: '/images/Recipe-Builder.webp',
    alt: 'Havenue Recipe Builder with ingredient drag-and-drop and cost tracking',
  }), []);
  const handleMenuClick = useCallback(() => setModalImage({
    src: '/images/Set-Menu-Builder.png',
    webp: '/images/Set-Menu-Builder.webp',
    alt: 'Havenue Set Menu Builder with live GP% tracking and cost per head calculations',
  }), []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Background Set Menu Builder: parallax separation on scroll (desktop effect)
  const behindY = useTransform(scrollYProgress, [0.1, 0.35, 0.55], [0, -30, -65]);
  const behindX = useTransform(scrollYProgress, [0.1, 0.35, 0.55], [0, 25, 55]);
  const behindScale = useTransform(scrollYProgress, [0.1, 0.4], [0.9, 0.96]);
  const behindOpacity = useTransform(scrollYProgress, [0, 0.15], [0.7, 1]);
  const behindRotate = useTransform(scrollYProgress, [0, 0.5], [2, -3]);

  // Foreground Recipe Builder: slides DOWN-LEFT to reveal behind image (desktop)
  const frontY = useTransform(scrollYProgress, [0.1, 0.35, 0.55], [0, 25, 65]);
  const frontX = useTransform(scrollYProgress, [0.1, 0.35, 0.55], [0, -15, -35]);
  const frontRotate = useTransform(scrollYProgress, [0, 0.5], [0, 2.5]);

  return (
    <section
      id="menu-builder"
      className="relative overflow-x-clip"
      style={{
        paddingTop: 'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      {/* Subtle ambient glow — pre-blurred gradient, no CSS filter */}
      <div
        className="absolute top-1/2 left-0 w-[900px] h-[900px] -translate-y-1/2 -translate-x-1/3 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(47, 143, 78,0.06) 0%, transparent 50%)',
        }}
      />

      <div ref={sectionRef} className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Asymmetric grid: text narrower, images wider */}
        <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-center">
          {/* Content — LEFT (narrower) */}
          <div>
            <SectionHeading
              headline={featureMenuBuilderCopy.headline}
              headingLevel="h3"
              body={featureMenuBuilderCopy.body}
              bullets={featureMenuBuilderCopy.bullets}
              align="left"
            />
          </div>

          {/* Visual — RIGHT: Stacked on mobile, parallax layered on desktop */}
          <div className="relative lg:-mr-12 xl:-mr-24 lg:min-h-[480px]">
            {/* Primary: Recipe Builder — front image, shows first on mobile */}
            <motion.div
              className="relative z-10 w-full lg:w-[90%] lg:mt-[55px]"
              style={isMobile ? undefined : {
                y: frontY,
                x: frontX,
                rotate: frontRotate,
                willChange: 'transform',
              }}
            >
              <GlassCard
                noBlur
                className="relative p-0 border-[#2F8F4E]/30 cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.03]"
                style={{
                  boxShadow: `
                    0 40px 80px rgba(0,0,0,0.5),
                    0 0 60px rgba(47, 143, 78,0.12),
                    inset 0 1px 0 rgba(255,255,255,0.06)
                  `,
                }}
                onClick={handleRecipeClick}
              >
                <div className="rounded-lg overflow-hidden bg-[#111]">
                  <picture>
                    <source srcSet="/images/Recipe-Builder.webp" type="image/webp" />
                    <img
                      src="/images/Recipe-Builder.png"
                      alt="Havenue Recipe Builder with ingredient drag-and-drop and cost tracking"
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

            {/* Secondary: Set Menu Builder — overlapping card on mobile, absolute behind on desktop */}
            <motion.div
              className="relative -mt-10 w-[92%] ml-auto z-20 lg:absolute lg:mt-0 lg:ml-0 lg:-top-10 lg:-right-2 lg:w-[80%] lg:z-0"
              style={isMobile ? undefined : {
                y: behindY,
                x: behindX,
                scale: behindScale,
                opacity: behindOpacity,
                rotate: behindRotate,
                transformOrigin: 'top right',
                willChange: 'transform',
              }}
            >
              <div
                className="rounded-xl overflow-hidden border border-white/25 cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.03]"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(47, 143, 78,0.12)',
                  background: '#111',
                }}
                onClick={handleMenuClick}
              >
                <picture>
                  <source srcSet="/images/Set-Menu-Builder.webp" type="image/webp" />
                  <img
                    src="/images/Set-Menu-Builder.png"
                    alt="Havenue Set Menu Builder with live GP% tracking and cost per head calculations"
                    className="w-full h-auto block"
                    width="800"
                    height="600"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </motion.div>

            {/* Ambient glow — no blur filter for performance */}
            <div className="absolute -inset-20 rounded-3xl -z-10 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse at center, rgba(47, 143, 78,0.04) 0%, transparent 70%)' }} />
          </div>
        </div>
      </div>

      {modalImage && (
        <ShowcaseImageModal
          isOpen={true}
          onClose={() => setModalImage(null)}
          imageSrc={modalImage.src}
          imageWebP={modalImage.webp}
          imageAlt={modalImage.alt}
        />
      )}
    </section>
  );
}
