import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Lock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckoutEmailModalProps {
  isOpen: boolean;
  tier: string;
  price: string;
  isAnnual: boolean;
  onConfirm: (email: string) => void;
  onDismiss: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutEmailModal({
  isOpen,
  tier,
  price,
  isAnnual,
  onConfirm,
  onDismiss,
}: CheckoutEmailModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetFormState = useCallback(() => {
    setEmail('');
    setError('');
    setIsSubmitting(false);
  }, []);

  const handleDismiss = useCallback(() => {
    resetFormState();
    onDismiss();
  }, [onDismiss, resetFormState]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC to dismiss
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleDismiss(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, handleDismiss]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid work email address.');
      inputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    onConfirm(trimmed);
  }, [email, onConfirm]);

  if (!isOpen) return null;

  const billingLabel = isAnnual
    ? `${price}/mo billed annually`
    : `${price}/month after trial`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Start ${tier} free trial`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-white/10',
          'bg-[rgba(10,10,10,0.96)] backdrop-blur-2xl',
          'shadow-[0_0_80px_rgba(47,143,78,0.2),0_32px_64px_rgba(0,0,0,0.8)]',
          'p-8',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/50 focus-visible:outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + badge */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-full bg-[#2F8F4E]/10 border border-[#2F8F4E]/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[#2F8F4E]" />
          </div>
          <span className="text-[10px] font-bold text-[#2F8F4E] tracking-[0.15em] uppercase">
            7-Day Free Trial · No Card Needed
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-extrabold text-white leading-tight mb-1">
          Start your {tier} trial
        </h2>
        <p className="text-sm text-white/40 mb-7">
          {billingLabel} · Cancel anytime · Go live in 20 minutes
        </p>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label
              htmlFor="checkout-email"
              className="block text-xs font-semibold text-white/60 mb-2 tracking-wide uppercase"
            >
              Work email
            </label>
            <input
              ref={inputRef}
              id="checkout-email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
              placeholder="chef@yourvenue.co.uk"
              required
              autoComplete="email"
              className={cn(
                'w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/25',
                'bg-white/[0.04] border transition-all duration-150',
                'focus:outline-none focus:ring-2',
                error
                  ? 'border-red-500/50 focus:ring-red-500/30'
                  : 'border-white/10 hover:border-white/20 focus:border-[#2F8F4E]/40 focus:ring-[#2F8F4E]/20',
              )}
            />
            {error && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                {error}
              </p>
            )}
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-4 px-6 rounded-xl font-bold text-sm text-[#0A0A0A] bg-[#2F8F4E]',
              'transition-all duration-200',
              'shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),0_0_30px_rgba(47,143,78,0.35),0_0_60px_rgba(47,143,78,0.12)]',
              'hover:bg-[#36A458] hover:-translate-y-[2px]',
              'hover:shadow-[0_8px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2),0_0_44px_rgba(47,143,78,0.55),0_0_80px_rgba(47,143,78,0.18)]',
              'focus-visible:ring-2 focus-visible:ring-[#2F8F4E] focus-visible:outline-none',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
            )}
          >
            {isSubmitting ? 'Redirecting to Stripe…' : `Start My ${tier} Trial →`}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            By starting your trial, you agree to the <a href="/privacy-policy/" className="text-[#2F8F4E] hover:underline">Privacy Policy</a> and <a href="/cookie-policy/" className="text-[#2F8F4E] hover:underline">Cookie Policy</a>. Optional marketing updates are not switched on in this step.
          </p>
        </form>

        {/* Trust bar */}
        <div className="mt-5 pt-5 border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-4 text-[11px] text-white/25">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Secured by Stripe
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span>No charge for 7 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
