import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import { X, Calculator, Loader2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { trackEvent } from '../../lib/analytics';
import { getAnonymousId, getStoredUTMParams } from '../../lib/identity';

interface ROICalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ROICalculatorModal({ isOpen, onClose }: ROICalculatorModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address.');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const anonymousId = getAnonymousId();
      const utm = getStoredUTMParams();
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`;

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: trimmed,
          anonymousId,
          source: 'roi_calculator_cta',
          leadMagnet: 'hospitality_profit_calculator',
          marketingConsent: false,
          ...(utm && {
            utmParams: {
              utm_source: utm.utm_source,
              utm_medium: utm.utm_medium,
              utm_campaign: utm.utm_campaign,
              utm_term: utm.utm_term,
              utm_content: utm.utm_content,
            },
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit. Please try again.');
      }

      trackEvent({ event: 'roi_calculator_submitted', data: { email: trimmed } });
      setSuccess(true);

      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Get your free ROI calculator"
    >
      <GlassCard
        className="relative max-w-md w-full p-8 text-center transition-all duration-300 scale-100 translate-y-0"
        hoverEffect={false}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <>
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center mx-auto">
                <Calculator className="w-6 h-6 text-[#2F8F4E]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Check Your Inbox
            </h3>
            <p className="text-sm text-white/70 mb-5">
              Your calculator is on its way. It should also have opened in a new tab.
            </p>
            <GlassButton onClick={onClose} variant="ghost" className="w-full">
              Continue Exploring
            </GlassButton>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center mx-auto">
                <Calculator className="w-6 h-6 text-[#2F8F4E]" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              See Your True GP%
            </h3>
            <p className="text-sm text-white/70 mb-5">
              Enter your email and we&rsquo;ll send you our interactive profit calculator — plug in your venue numbers and find where margin is hiding.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                placeholder="chef@yourvenue.co.uk"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F4E]/50 focus:border-[#2F8F4E]/30 transition-colors"
                aria-label="Email address"
              />
              <GlassButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Get My Free Calculator'
                )}
              </GlassButton>
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              <p className="text-[11px] leading-relaxed text-white/45">
                We&rsquo;ll email the calculator to the address above. By submitting you consent to this transactional message. <a href="/privacy-policy/" className="text-[#2F8F4E] hover:underline">Privacy Policy</a>.
              </p>
            </form>

            <button
              onClick={onClose}
              className="mt-3 text-sm text-white/50 hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </GlassCard>
    </div>
  );
}
