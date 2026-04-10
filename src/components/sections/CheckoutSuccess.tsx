import { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { trackEvent } from '../../lib/analytics';

export function CheckoutSuccess() {
  useEffect(() => {
    trackEvent({ event: 'page_viewed', data: { page: 'checkout_success' } });
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <GlassCard className="max-w-lg w-full p-8 md:p-12 text-center" hoverEffect={false}>
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-[#2F8F4E]" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome to Havenue
        </h1>
        <p className="text-lg text-white/70 mb-2">
          Your 7-Day Pro Trial is Active
        </p>
        <p className="text-sm text-white/50 mb-8">
          Check your inbox for login credentials and your onboarding guide.
          No charge until day 8 — cancel anytime.
        </p>

        {/* What's Next */}
        <div className="bg-white/5 rounded-lg p-6 mb-8 text-left space-y-4">
          <h3 className="text-sm font-semibold text-[#2F8F4E] uppercase tracking-wider">
            What Happens Next
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#2F8F4E]">1</span>
              <p className="text-sm text-white/80">Check your email for your login link and welcome guide</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#2F8F4E]">2</span>
              <p className="text-sm text-white/80">Upload your first menu via OCR — takes 30 seconds</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2F8F4E]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#2F8F4E]">3</span>
              <p className="text-sm text-white/80">See your live GP% and start automating your venue</p>
            </div>
          </div>
        </div>

        <GlassButton
          href="/"
          variant="primary"
          className="w-full group"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </GlassButton>

        <p className="mt-4 text-xs text-white/40">
            Need help? Reply to your welcome email or contact the Havenue team
        </p>
      </GlassCard>
    </section>
  );
}
