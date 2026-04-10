import { useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { heroCopy } from '../../data/copy';
import { GlassButton } from '../ui/GlassButton';
import { Play, ArrowRight } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { trackEvent } from '../../lib/analytics';

interface HeroSectionProps {
  onVideoClick: () => void;
  videoAvailable?: boolean;
}

export function HeroSection({ onVideoClick, videoAvailable = false }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // 3D perspective transforms on scroll — dashboard tilts as user scrolls
  const rotateX = useTransform(scrollYProgress, [0, 1], [3, -8]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-8, -2]);
  const dashboardScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // COF card floats up and forward on scroll
  const cofY = useTransform(scrollYProgress, [0, 0.6], [0, -30]);
  const cofScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.08]);

  const handleHeroCTAClick = useCallback(() => {
    trackEvent({ event: 'cta_clicked', data: { location: 'hero', label: heroCopy.cta?.text ?? 'Start Free Trial' } });
  }, []);

  const handleVideoClick = useCallback(() => {
    const label = videoAvailable ? 'Watch Demo' : 'See How It Works';
    trackEvent({ event: 'cta_clicked', data: { location: 'hero', label } });
    if (videoAvailable) {
      onVideoClick();
      return;
    }

    document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [onVideoClick, videoAvailable]);

  const heroVisual = (
    <div className="relative lg:-mr-12 xl:-mr-28">
      {/* Main Dashboard with scroll-linked 3D perspective */}
      <div style={{ perspective: '1200px' }}>
        <motion.div
          className="relative rounded-xl overflow-hidden cursor-pointer"
          style={isMobile ? {
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(47, 143, 78,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            background: '#111',
          } : {
            rotateX,
            rotateY,
            scale: dashboardScale,
            transformStyle: 'preserve-3d',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(47, 143, 78,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            background: '#111',
            willChange: 'transform',
          }}
          whileHover={isMobile ? undefined : { scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <picture>
            <source srcSet="/images/hero-dashboard-full.webp" type="image/webp" />
            <img
              src="/images/hero-dashboard-full.png"
              alt="Havenue dashboard showing revenue of £70,900, GP% at 78.5%, and event management"
              className="w-full h-auto block"
              width="1200"
              height="800"
              loading="eager"
              decoding="async"
            />
          </picture>
        </motion.div>
      </div>

      {/* Floating COF Output */}
      <motion.div
        className="absolute rounded-lg overflow-hidden cursor-pointer"
        style={isMobile ? {
          width: 'clamp(10rem, 40vw, 14rem)',
          bottom: '-24px',
          right: '-12px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 60px rgba(47, 143, 78,0.25)',
          border: '2px solid rgba(47, 143, 78,0.45)',
          background: '#111',
          zIndex: 20,
        } : {
          width: 'clamp(14rem, 22vw, 26rem)',
          bottom: '-36px',
          right: '-28px',
          y: cofY,
          scale: cofScale,
          boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 60px rgba(47, 143, 78,0.25)',
          border: '2px solid rgba(47, 143, 78,0.45)',
          background: '#111',
          zIndex: 20,
          willChange: 'transform',
        }}
        whileHover={isMobile ? undefined : { scale: 1.15, y: -10 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      >
        <picture>
          <source srcSet="/images/engine-cof-output.webp" type="image/webp" />
          <img
            src="/images/engine-cof-output.png"
            alt="Catering Event Order Form output"
            className="w-full h-auto block"
            width="600"
            height="400"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </motion.div>

      {/* Decorative glow — pre-blurred gradient, no CSS filter */}
      <div
        className="absolute -top-10 -left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(47, 143, 78,0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[84vh] items-start lg:min-h-[calc(100vh-4.25rem)]"
      style={{
        paddingTop: 'calc(var(--section-padding-y) + 1rem)',
        paddingBottom: 'var(--section-padding-y)'
      }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 40%, rgba(47, 143, 78, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      <div className="mx-auto -mt-4 w-full max-w-7xl px-4 sm:-mt-6 sm:px-6 lg:-mt-10 lg:px-8">
        {/* Desktop: side-by-side grid. Mobile: stacked with visual between text and CTAs */}
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12">
          {/* Content column */}
          <div className="max-w-[38rem]">
            {heroCopy.eyebrow && (
              <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#2F8F4E]">
                {heroCopy.eyebrow}
              </span>
            )}
            <h1
              className="mb-4 font-extrabold leading-[1.03] tracking-tight text-white md:leading-[1.05]"
              style={{ fontSize: 'var(--font-size-hero)' }}
            >
              {heroCopy.headline}
            </h1>
            <p className="mb-6 max-w-xl text-base leading-relaxed text-white/70 lg:text-lg">
              {heroCopy.subheadline}
            </p>

            {/* Mobile: show visual here, between subheadline and CTAs */}
            {isMobile && (
              <div className="mb-6">
                {heroVisual}
                {/* Spacer for floating COF card */}
                <div className="h-6" />
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {heroCopy.cta && (
                <GlassButton
                  href={heroCopy.cta.href}
                  variant="primary"
                  className="group px-7 py-3.5 text-[0.95rem] sm:text-base"
                  onClick={handleHeroCTAClick}
                >
                  {heroCopy.cta.text}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </GlassButton>
              )}
              <button
                onClick={handleVideoClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[0.95rem] font-medium text-white backdrop-blur-sm transition-all duration-200 hover:border-[#2F8F4E]/40 hover:bg-white/[0.08] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),0_0_20px_rgba(47,143,78,0.15)] active:translate-y-0 active:scale-[0.98] sm:text-base"
              >
                <Play className="w-4 h-4" />
                {videoAvailable ? 'Watch the 2-Minute Demo' : 'See How It Works'}
              </button>
            </div>

            {heroCopy.cta?.microcopy && (
              <p className="mt-3 flex items-center gap-2 text-sm text-white/50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F8F4E] animate-pulse" />
                {heroCopy.cta.microcopy}
              </p>
            )}
          </div>

          {/* Desktop: visual in right column */}
          {!isMobile && (
            <div className="lg:pl-2">
              {heroVisual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
