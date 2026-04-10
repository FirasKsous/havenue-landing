import { useEffect, useState } from 'react';
import { GlassButton } from '../ui/GlassButton';

interface MobileCTABarProps {
  showAfterScroll?: number; // Scroll position in pixels to show the bar
}

export function MobileCTABar({ showAfterScroll = 600 }: MobileCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check scroll position
    const handleScroll = () => {
      if (window.scrollY > showAfterScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkMobile();
    handleScroll();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfterScroll]);

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div 
        className="px-4 py-4 pb-6"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <GlassButton 
          href="#pricing" 
          variant="primary" 
          className="w-full animate-glow-pulse"
        >
          Start Your Free Trial
        </GlassButton>
        <p className="text-center text-xs text-white/50 mt-2">
          No credit card required
        </p>
      </div>
    </div>
  );
}
