import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { X, Download, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';
import { getAnonymousId, getStoredUTMParams } from '../../lib/identity';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExitIntentModal({ isOpen, onClose }: ExitIntentModalProps) {
  const [triggered, setTriggered] = useState(false);
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = useCallback(() => {
    if (!success) {
      trackEvent({ event: 'exit_intent_dismissed' });
    }
    onClose();
    setTriggered(false);
  }, [onClose, success]);

  // Exit-intent detection — fires once per session
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem('exitIntentShown')) {
        setTriggered(true);
        localStorage.setItem('exitIntentShown', 'true');
        trackEvent({ event: 'exit_intent_shown' });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // Escape key closes
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen || triggered) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, triggered, handleClose]);

  const shouldShow = isOpen || triggered;

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

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
          email: email.trim(),
          anonymousId,
          source: 'exit_intent',
          leadMagnet: 'hospitality_profit_calculator',
          marketingConsent,
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

      trackEvent({ event: 'exit_intent_submitted', data: { email: email.trim() } });
      setSuccess(true);

      // Open download in new tab if URL returned
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, marketingConsent]);

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300',
        shouldShow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Download the 2026 Hospitality Profit Calculator"
    >
      <GlassCard
        className={cn(
          'relative max-w-md w-full p-8 text-center transition-all duration-300',
          shouldShow ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
        hoverEffect={false}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <>
            {/* Success State */}
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center mx-auto">
                <Download className="w-6 h-6 text-[#2F8F4E]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Check Your Inbox
            </h3>
            <p className="text-sm text-white/70 mb-5">
              Your calculator should have opened in a new tab. Keep exploring while you review it.
            </p>
            <GlassButton onClick={handleClose} variant="ghost" className="w-full">
              Continue Exploring
            </GlassButton>
          </>
        ) : (
          <>
            {/* Lead Magnet Offer */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F8F4E] bg-[#2F8F4E]/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                Free Download
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Your Free Profit Calculator
            </h3>
            <p className="text-sm text-white/70 mb-5">
              Plug in your venue numbers, see your true GP%, and find where margin is leaking.
            </p>

            {/* Offer Details */}
            <div className="bg-white/5 rounded-lg p-3.5 mb-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-[#2F8F4E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Instant download</p>
                  <p className="text-xs text-white/50">Interactive spreadsheet + recovery guide</p>
                </div>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F4E]/50 focus:border-[#2F8F4E]/30 transition-colors"
                aria-label="Email address"
              />
              <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-[#2F8F4E] focus:ring-[#2F8F4E]/40"
                />
                <span className="text-xs leading-relaxed text-white/70">
                  Also send me Havenue updates and hospitality insights. Optional — unsubscribe anytime.
                </span>
              </label>
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
                We&rsquo;ll email the calculator to the address above. By submitting you consent to this transactional message. <a href="/privacy-policy/" className="text-[#2F8F4E] hover:underline">Privacy Policy</a>. Ticking the box opts you in to marketing per our <a href="/marketing-policy/" className="text-[#2F8F4E] hover:underline">Marketing Policy</a> — unsubscribe anytime.
              </p>
            </form>

            <button
              onClick={handleClose}
              className="mt-3 text-sm text-white/50 hover:text-white transition-colors"
            >
              No thanks, I'll figure it out myself
            </button>
          </>
        )}
      </GlassCard>
    </div>
  );
}
