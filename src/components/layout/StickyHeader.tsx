import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks } from '../../data/copy';
import { GlassButton } from '../ui/GlassButton';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';

export function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = useCallback(() => {
    trackEvent({ event: 'cta_clicked', data: { location: 'sticky_header', label: 'Start Free Trial' } });
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-[3.75rem] lg:h-[4.25rem]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2F8F4E] sm:h-8 sm:w-8">
              <span className="text-[#0A0A0A] font-bold text-sm">H</span>
            </div>
            <span className="hidden text-base font-semibold text-white sm:block lg:text-[1.05rem]">
              Havenue
            </span>
          </a>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-1.5 text-sm text-white/70 transition-all duration-200 hover:text-white hover:bg-white/[0.04] hover:shadow-[inset_0_0_0_1px_rgba(47,143,78,0.3),0_0_12px_rgba(47,143,78,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/50"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#pricing"
              className="rounded-lg px-3.5 py-1.5 text-sm text-white/70 transition-all duration-200 hover:text-white hover:bg-white/[0.04] hover:shadow-[inset_0_0_0_1px_rgba(47,143,78,0.3),0_0_12px_rgba(47,143,78,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/50"
            >
              Sign In
            </a>
            <GlassButton
              href="#pricing"
              variant="primary"
              className="min-h-10 px-4 py-2 text-sm"
              onClick={handleCTAClick}
            >
              Start Free Trial
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden absolute top-full left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300',
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
      >
        <nav className="space-y-4 px-4 py-5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="space-y-3 border-t border-white/10 pt-3">
            <a
              href="#pricing"
              className="block text-base text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <GlassButton
              href="#pricing"
              variant="primary"
              className="w-full"
              onClick={handleCTAClick}
            >
              Start Free Trial
            </GlassButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
