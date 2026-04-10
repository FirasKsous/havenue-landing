import { useEffect, useState, useCallback } from 'react';
import { Cookie, Shield, BarChart3, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';
import { getAnonymousId } from '../../lib/identity';
import { getConsentState, saveConsentState } from '../../lib/consent';
import { supabase } from '../../lib/supabase';

type ConsentDecision = 'accept_all' | 'essentials_only' | 'custom'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('havenue_consent'));
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const consentState = getConsentState();
    const hasStoredDecision = Boolean(localStorage.getItem('havenue_consent'));

    if (!hasStoredDecision) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }

    if (consentState.analytics) {
      loadGA4();
    }
  }, []);

  const recordConsent = useCallback(
    async (decision: ConsentDecision, analytics: boolean, marketing: boolean) => {
      if (!supabase) return;
      try {
        const anonymousId = analytics ? getAnonymousId() : null;
        await supabase.from('consents').insert({
          anonymous_id: anonymousId,
          consent_type: 'cookie_banner',
          granted: analytics || marketing,
          consent_text: `Cookie banner decision: ${decision}. analytics=${analytics}, marketing=${marketing}`,
          consent_version: '1.0',
          user_agent: navigator.userAgent,
        });
      } catch {
        // Consent recording must never block UX
      }
    },
    []
  );

  const dismissBanner = useCallback(() => {
    setIsVisible(false);
    setIsExpanded(false);
    setTimeout(() => setIsDismissed(true), 300);
  }, []);

  const handleAcceptAll = useCallback(() => {
    saveConsentState({ analytics: true, marketing: true });
    trackEvent({ event: 'cookie_consent_accepted', data: { decision: 'accept_all' } });
    void recordConsent('accept_all', true, true);
    loadGA4();
    dismissBanner();
  }, [dismissBanner, recordConsent]);

  const handleEssentialsOnly = useCallback(() => {
    saveConsentState({ analytics: false, marketing: false });
    void recordConsent('essentials_only', false, false);
    dismissBanner();
  }, [dismissBanner, recordConsent]);

  const handleSavePreferences = useCallback(() => {
    saveConsentState({ analytics: analyticsEnabled, marketing: marketingEnabled });
    trackEvent({
      event: 'cookie_consent_accepted',
      data: { decision: 'custom', analytics: analyticsEnabled, marketing: marketingEnabled },
    });
    void recordConsent('custom', analyticsEnabled, marketingEnabled);
    if (analyticsEnabled) loadGA4();
    dismissBanner();
  }, [analyticsEnabled, marketingEnabled, dismissBanner, recordConsent]);

  const toggleManage = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (isDismissed) return null;

  return (
    <>
      {/* Backdrop scrim only when drawer is expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[99] bg-black/60 transition-opacity duration-200"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        role={isExpanded ? 'dialog' : 'region'}
        aria-modal={isExpanded ? 'true' : undefined}
        aria-label="Cookie consent"
        className={cn(
          'fixed z-[100] left-1/2 -translate-x-1/2 bottom-4 md:bottom-6',
          'w-[calc(100%-2rem)]',
          isExpanded ? 'max-w-2xl' : 'max-w-lg',
          'transition-[transform,opacity,max-width] duration-300 ease-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'border border-white/10 bg-white/[0.04] backdrop-blur-2xl',
            'shadow-[0_24px_60px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.02)]'
          )}
        >
          {/* Soft accent glow in the top-left corner for brand warmth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#2F8F4E]/15 blur-3xl"
          />

          <div className="relative px-5 py-4 md:px-6 md:py-5">
            {/* Compact header row */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#2F8F4E]/25 bg-[#2F8F4E]/10">
                <Cookie className="h-4 w-4 text-[#2F8F4E]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13.5px] font-semibold text-white">Your privacy on Havenue</h4>
                  <Shield className="h-3.5 w-3.5 text-[#2F8F4E]/70" />
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-white/65">
                  Essentials keep Havenue running. Analytics and marketing cookies are optional — your call. See our{' '}
                  <a href="/cookie-policy/" className="text-[#2F8F4E] underline-offset-2 hover:underline">
                    Cookie Policy
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy/" className="text-[#2F8F4E] underline-offset-2 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Action row — Accept All dominant, Essentials secondary, Manage tertiary */}
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handleAcceptAll}
                className={cn(
                  'flex-1 sm:flex-none rounded-lg px-5 py-2.5 text-[13px] font-semibold text-[#0A0A0A] bg-[#2F8F4E]',
                  'shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),0_0_30px_rgba(47,143,78,0.35),0_0_60px_rgba(47,143,78,0.12)]',
                  'hover:bg-[#36A458] hover:-translate-y-px',
                  'hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2),0_0_44px_rgba(47,143,78,0.55),0_0_80px_rgba(47,143,78,0.18)]',
                  'transition-[transform,box-shadow,background-color] duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/60'
                )}
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleEssentialsOnly}
                className={cn(
                  'rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-white/70',
                  'hover:bg-white/[0.06] hover:border-white/20 hover:text-white',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                )}
              >
                Essentials Only
              </button>
              <button
                type="button"
                onClick={toggleManage}
                aria-expanded={isExpanded}
                className={cn(
                  'rounded-lg px-3 py-2 text-[11.5px] font-medium text-white/45',
                  'hover:text-white/70 transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25'
                )}
              >
                {isExpanded ? 'Hide preferences' : 'Manage'}
              </button>
            </div>

            {/* Expanded preferences drawer */}
            {isExpanded && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-3 text-[11.5px] leading-relaxed text-white/55">
                  Toggle each category and press <strong className="text-white/80">Save Preferences</strong>. Essentials stay on because Havenue cannot function without them.
                </p>

                <div className="space-y-2">
                  {/* Essential — locked */}
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-[#2F8F4E]/25 bg-[#2F8F4E]/15">
                        <Shield className="h-3 w-3 text-[#2F8F4E]" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[12px] font-semibold text-white">Essential</h5>
                        <p className="text-[11px] leading-snug text-white/50">
                          Required to load the site, remember your choice, and run secure checkout.
                        </p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 rounded border border-[#2F8F4E]/30 bg-[#2F8F4E]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#2F8F4E]">
                      Locked On
                    </span>
                  </div>

                  {/* Analytics — toggle */}
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-white/15 bg-white/10">
                        <BarChart3 className="h-3 w-3 text-white/75" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[12px] font-semibold text-white">Analytics</h5>
                        <p className="text-[11px] leading-snug text-white/50">
                          Anonymous Google Analytics 4 usage data. No ad identifiers.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={analyticsEnabled}
                      aria-label="Analytics cookies"
                      onClick={() => setAnalyticsEnabled((v) => !v)}
                      className={cn(
                        'relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
                        analyticsEnabled ? 'bg-[#2F8F4E]' : 'bg-white/20'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
                          analyticsEnabled ? 'translate-x-[18px]' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Marketing — toggle */}
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-white/15 bg-white/10">
                        <Mail className="h-3 w-3 text-white/75" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[12px] font-semibold text-white">Marketing</h5>
                        <p className="text-[11px] leading-snug text-white/50">
                          Campaign attribution and personalised outreach. Opt out anytime.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={marketingEnabled}
                      aria-label="Marketing cookies"
                      onClick={() => setMarketingEnabled((v) => !v)}
                      className={cn(
                        'relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]',
                        marketingEnabled ? 'bg-[#2F8F4E]' : 'bg-white/20'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
                          marketingEnabled ? 'translate-x-[18px]' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className={cn(
                      'rounded-lg px-5 py-2.5 text-[13px] font-semibold text-[#0A0A0A] bg-[#2F8F4E]',
                      'shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),0_0_30px_rgba(47,143,78,0.35),0_0_60px_rgba(47,143,78,0.12)]',
                      'hover:bg-[#36A458] hover:-translate-y-px',
                      'hover:shadow-[0_6px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2),0_0_44px_rgba(47,143,78,0.55),0_0_80px_rgba(47,143,78,0.18)]',
                      'transition-[transform,box-shadow,background-color] duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/60'
                    )}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/** Signal analytics consent to GTM dataLayer so GA4 tag can fire */
function loadGA4() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'analytics_consent_granted',
  });

  // Also configure gtag directly if GA4 ID is available (belt-and-suspenders)
  const gaId = import.meta.env.VITE_GA4_ID;
  if (gaId && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
}
