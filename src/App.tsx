import { useState, useEffect } from 'react';

// Layout components
import { StickyHeader } from './components/layout/StickyHeader';
import { Footer } from './components/layout/Footer';
import { MobileCTABar } from './components/layout/MobileCTABar';

// Section components
import { HeroSection } from './components/sections/HeroSection';
import { TrustBar } from './components/sections/TrustBar';
import { AgitationSection } from './components/sections/AgitationSection';
import { ParadigmShift } from './components/sections/ParadigmShift';
import { HowItWorks } from './components/sections/HowItWorks';
import { FeatureOCR } from './components/sections/FeatureOCR';
import { FeatureMenuBuilder } from './components/sections/FeatureMenuBuilder';
import { FeatureSafetyEngine } from './components/sections/FeatureSafetyEngine';
import { SocialProof } from './components/sections/SocialProof';
import { ROIAnchor } from './components/sections/ROIAnchor';
import { PricingSection } from './components/sections/PricingSection';
import { FAQSection } from './components/sections/FAQSection';
import { CheckoutSuccess } from './components/sections/CheckoutSuccess';

// Modal components
import { VideoModal } from './components/modals/VideoModal';
import { ExitIntentModal } from './components/modals/ExitIntentModal';
import { CookieConsent } from './components/modals/CookieConsent';

// Analytics & Identity
import { trackEvent, initScrollTracking } from './lib/analytics';
import { captureUTMParams, isReturnVisit } from './lib/identity';
import { useSectionTracking } from './hooks/useSectionTracking';

function App() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);

  // Check if this is the checkout success page
  const isCheckoutSuccess = new URLSearchParams(window.location.search).get('checkout') === 'success';

  // Initialize analytics, UTM capture, and identity on mount
  useEffect(() => {
    // Capture UTM params from URL
    captureUTMParams();

    // Track page view
    trackEvent({ event: 'page_viewed', data: { page: window.location.pathname } });

    // Track return visits
    if (isReturnVisit()) {
      trackEvent({ event: 'return_visit' });
    }

    // Initialize scroll depth tracking
    const cleanupScroll = initScrollTracking();

    return () => {
      cleanupScroll();
    };
  }, []);

  // Initialize section-level view tracking
  useSectionTracking();

  // Checkout success view
  if (isCheckoutSuccess) {
    return (
      <div className="min-h-screen bg-[#080808] relative overflow-x-hidden">
        <StickyHeader />
        <main id="main" className="relative z-10">
          <CheckoutSuccess />
        </main>
      </div>
    );
  }

  const videoUrl = import.meta.env.VITE_DEMO_VIDEO_URL || undefined;

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-x-hidden">
      {/* Skip to content - accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#2F8F4E] focus:text-[#0A0A0A] focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Global ambient gradient - top glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(47, 143, 78, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 30%, rgba(47, 143, 78, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse 40% 30% at 80% 70%, rgba(47, 143, 78, 0.03) 0%, transparent 40%)
          `,
        }}
      />

      {/* Subtle vignette overlay for depth */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(8, 8, 8, 0.4) 100%)`,
        }}
      />
      {/* Header */}
      <StickyHeader />

      {/* Main content */}
      <main id="main" className="relative z-10">
        {/* S1: Hero Section */}
        <HeroSection onVideoClick={() => setIsVideoModalOpen(true)} videoAvailable={Boolean(videoUrl)} />

        {/* S2: Trust Bar */}
        <TrustBar />

        {/* S3: Agitation Section (Pain Points) */}
        <AgitationSection />

        {/* S4: Paradigm Shift (Event CRM) */}
        <ParadigmShift />

        {/* S5: How It Works (3-step process) */}
        <HowItWorks />

        {/* S6: Feature - OCR Import */}
        <FeatureOCR />

        {/* S7: Feature - Menu Builder */}
        <FeatureMenuBuilder />

        {/* S8: Feature - Safety Engine */}
        <FeatureSafetyEngine />

        {/* S9: ROI Anchor (Business case) */}
        <ROIAnchor />

        {/* S10: Social Proof (Testimonials) */}
        <SocialProof />

        {/* S11: Pricing Section */}
        <PricingSection />

        {/* S12: FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Mobile CTA Bar */}
      <MobileCTABar />

      {/* Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoUrl}
      />
      <ExitIntentModal
        isOpen={isExitIntentOpen}
        onClose={() => setIsExitIntentOpen(false)}
      />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}

export default App;
