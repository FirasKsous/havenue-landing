import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { X, Calendar, Send, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';
import { getAnonymousId } from '../../lib/identity';

interface BookDemoModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

function loadCalendlyAssets(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Calendly) { resolve(); return; }

    const existingStylesheet = document.querySelector('link[href*="calendly.com/assets/external/widget.css"]');
    if (!existingStylesheet) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(stylesheet);
    }

    const existing = document.querySelector('script[src*="calendly.com/assets"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

function buildCalendlyUrl(base: string): string {
  try {
    const url = new URL(base);
    url.searchParams.set('background_color', '0a0a0a');
    url.searchParams.set('text_color', 'ffffff');
    url.searchParams.set('primary_color', '2F8F4E');
    url.searchParams.set('hide_gdpr_banner', '1');
    return url.toString();
  } catch {
    return base;
  }
}

// ─── Lead capture form ────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  venue: string;
  events: string;
}

interface LeadFormProps {
  onSuccess: () => void;
}

function LeadForm({ onSuccess }: LeadFormProps) {
  const nameId = useId();
  const emailId = useId();
  const venueId = useId();
  const eventsId = useId();
  const [form, setForm] = useState<FormState>({ name: '', email: '', venue: '', events: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Demo booking is not configured yet. Please contact the Havenue team.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/capture-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: form.email,
          source: 'book_demo',
          anonymousId: getAnonymousId(),
          metadata: { name: form.name, venue: form.venue, monthly_events: form.events },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.error) {
        throw new Error(payload?.error || 'Something went wrong. Please try again or contact the Havenue team.');
      }

      trackEvent({ event: 'demo_request_submitted', data: { events: form.events } });
      onSuccess();
    } catch {
        setError('Something went wrong. Please try again or contact the Havenue team.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = cn(
    'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25',
    'bg-white/[0.04] border border-white/10 hover:border-white/20',
    'focus:outline-none focus:ring-2 focus:border-[#2F8F4E]/40 focus:ring-[#2F8F4E]/20',
    'transition-all duration-150',
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
      <p className="text-sm text-white/50 leading-relaxed">
        Fill in your details and we'll send a calendar invite within one business day.
      </p>
      <p className="text-xs text-white/40 leading-relaxed">
        We use these details to arrange your demo request. Read the <a href="/privacy-policy/" className="text-[#2F8F4E] hover:underline">Privacy Policy</a> for how Havenue handles booking enquiries. Optional marketing updates are handled separately.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={nameId} className="block text-[11px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
            Your name *
          </label>
          <input
            id={nameId}
            type="text" value={form.name} onChange={set('name')}
            placeholder="Chef Marco" required className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={emailId} className="block text-[11px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
            Work email *
          </label>
          <input
            id={emailId}
            type="email" value={form.email} onChange={set('email')}
            placeholder="you@yourvenue.co.uk" required className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={venueId} className="block text-[11px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
            Venue name
          </label>
          <input
            id={venueId}
            type="text" value={form.venue} onChange={set('venue')}
            placeholder="The Grand Oak Hotel" className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={eventsId} className="block text-[11px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
            Events per month
          </label>
          <select id={eventsId} value={form.events} onChange={set('events')} className={cn(inputCls, 'cursor-pointer')}>
            <option value="">Select…</option>
            <option value="none">None — restaurant / standalone inventory</option>
            <option value="1-5">1 – 5</option>
            <option value="6-15">6 – 15</option>
            <option value="16-30">16 – 30</option>
            <option value="30+">30+</option>
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full py-3.5 px-6 rounded-xl font-bold text-sm text-[#0A0A0A] bg-[#2F8F4E]',
          'transition-all duration-200',
          'shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1),0_0_28px_rgba(47,143,78,0.4)]',
          'hover:bg-[#38A35D] hover:-translate-y-px',
          'hover:shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_44px_rgba(47,143,78,0.6)]',
          'focus-visible:ring-2 focus-visible:ring-[#2F8F4E] focus-visible:outline-none',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {loading ? 'Sending…' : 'Request My Demo'}
        {!loading && <Send className="inline ml-2 w-3.5 h-3.5" />}
      </button>
    </form>
  );
}

type DemoSuccessMode = 'request' | 'scheduled';

interface SuccessStateProps {
  onDismiss: () => void;
  mode: DemoSuccessMode;
}

function SuccessState({ onDismiss, mode }: SuccessStateProps) {
  const heading = mode === 'scheduled' ? "You're booked in" : 'Request received';
  const description = mode === 'scheduled'
    ? 'Your slot is confirmed. Look out for the Calendly confirmation and calendar invite in your inbox.'
    : "We'll review your request and send you a calendar invite within one business day. Look out for an email from the Havenue team.";

  return (
    <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[#2F8F4E]/10 border border-[#2F8F4E]/20 flex items-center justify-center">
        <CheckCircle className="w-7 h-7 text-[#2F8F4E]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">{heading}</h3>
        <p className="text-sm text-white/50 max-w-xs">
          {description}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="mt-2 text-sm text-[#2F8F4E] hover:text-white transition-colors font-medium"
      >
        Back to the page →
      </button>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

/**
 * Two-track demo booking modal:
 *
 * Track A (default): Lead form shown IMMEDIATELY — no loading wait.
 * Track B (when Calendly URL configured): SDK loads silently in background.
 *   → On ready: "Pick a specific slot →" toggle appears above the form.
 *   → User can switch to inline calendar view for instant booking.
 *   → `calendly.event_scheduled` auto-shows SuccessState.
 *
 * This eliminates the 7-second spinner entirely while keeping both
 * lead qualification (form) and instant booking (calendar) available.
 */
export function BookDemoModal({ isOpen, onDismiss }: BookDemoModalProps) {
  const calendlyContainerRef = useRef<HTMLDivElement>(null);
  const calendlyReadyRef = useRef(false);
  const [calendlyReady, setCalendlyReady] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'calendar'>('form');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<DemoSuccessMode>('request');

  const handleDismiss = useCallback(() => {
    setCalendlyReady(false);
    setViewMode('form');
    setShowSuccess(false);
    setSuccessMode('request');
    calendlyReadyRef.current = false;
    if (calendlyContainerRef.current) {
      calendlyContainerRef.current.innerHTML = '';
    }
    onDismiss();
  }, [onDismiss]);

  const rawCalendlyUrl = import.meta.env.VITE_CALENDLY_URL as string | undefined;
  const hasCalendlyUrl = Boolean(rawCalendlyUrl);

  // Silently load Calendly in an off-screen container so the user never waits.
  // The form is always shown immediately; the calendar becomes available
  // once Calendly signals readiness via postMessage.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!hasCalendlyUrl) return; // No URL → form-only mode

    let mounted = true;

    function onCalendlyMessage(e: MessageEvent) {
      if (typeof e.data !== 'object' || !e.data?.event?.startsWith?.('calendly.')) return;
      const eventName = e.data.event as string;

      if (eventName === 'calendly.profile_page_viewed' || eventName === 'calendly.event_type_viewed') {
        if (mounted && !calendlyReadyRef.current) {
          calendlyReadyRef.current = true;
          setCalendlyReady(true);
          trackEvent({ event: 'demo_calendly_opened' });
        }
      }

      if (eventName === 'calendly.event_scheduled') {
        if (mounted) {
          trackEvent({ event: 'demo_request_submitted', data: { source: 'calendly' } });
          setSuccessMode('scheduled');
          setShowSuccess(true);
        }
      }
    }

    window.addEventListener('message', onCalendlyMessage);

    // Clean up after 30s if Calendly never signals (silent, no user impact)
    const cleanupTimer = setTimeout(() => { mounted = false; }, 30_000);

    // Initialize the widget into the off-screen container
    loadCalendlyAssets().then(() => {
      if (!mounted || !calendlyContainerRef.current) return;
      if (!window.Calendly) return;
      calendlyContainerRef.current.innerHTML = '';
      window.Calendly.initInlineWidget({
        url: buildCalendlyUrl(rawCalendlyUrl!),
        parentElement: calendlyContainerRef.current,
      });
    }).catch(() => { /* silent fail — form already visible */ });

    return () => {
      mounted = false;
      clearTimeout(cleanupTimer);
      window.removeEventListener('message', onCalendlyMessage);
    };
  }, [isOpen, hasCalendlyUrl, rawCalendlyUrl]);

  // ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleDismiss(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, handleDismiss]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const switchToCalendar = useCallback(() => {
    setViewMode('calendar');
    trackEvent({ event: 'demo_calendly_opened' });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Book a demo call with the Havenue team"
    >
      {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={handleDismiss}
          aria-hidden="true"
        />

      {/* Modal — expands to max-w-3xl when calendar is active */}
      <div
        className={cn(
          'relative w-full rounded-2xl border border-white/10',
          'bg-[rgba(10,10,10,0.97)] backdrop-blur-2xl',
          'shadow-[0_0_80px_rgba(47,143,78,0.18),0_32px_64px_rgba(0,0,0,0.9)]',
          'flex flex-col overflow-hidden',
          'transition-[max-width] duration-300',
          viewMode === 'calendar' && calendlyReady ? 'max-w-3xl' : 'max-w-lg',
          'max-h-[92vh]',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2F8F4E]/10 border border-[#2F8F4E]/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-[#2F8F4E]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {showSuccess ? 'Demo Booked' : 'Book a 30-Minute Demo'}
              </h2>
              <p className="text-[11px] text-white/35 leading-none mt-0.5">
                {showSuccess
                  ? 'See you soon'
                  : 'See Havenue live · No commitment · Tailored to your venue'}
              </p>
            </div>
          </div>
            <button
              onClick={handleDismiss}
              aria-label="Close"
              className="text-white/30 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/50 focus-visible:outline-none"
            >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {showSuccess ? (
          <SuccessState onDismiss={handleDismiss} mode={successMode} />
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Form view */}
            <div className={viewMode === 'form' ? 'block' : 'hidden'}>
              {/* "Pick a slot" toggle — appears once Calendly is ready */}
              {calendlyReady && (
                <div className="px-6 pt-5 pb-0">
                  <button
                    onClick={switchToCalendar}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl',
                      'text-sm font-medium text-[#2F8F4E]',
                      'border border-[#2F8F4E]/25 bg-[#2F8F4E]/[0.06]',
                      'hover:bg-[#2F8F4E]/10 hover:border-[#2F8F4E]/40',
                      'transition-all duration-200',
                      'focus-visible:ring-2 focus-visible:ring-[#2F8F4E]/50 focus-visible:outline-none',
                    )}
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Pick a specific slot — view our live calendar →
                  </button>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[10px] text-white/25 uppercase tracking-widest">or fill the form</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                </div>
              )}
              <LeadForm onSuccess={() => { setSuccessMode('request'); setShowSuccess(true); }} />
            </div>

            {/* Calendar view */}
            {viewMode === 'calendar' && (
              <div>
                <div className="px-6 pt-4 pb-2">
                  <button
                    onClick={() => setViewMode('form')}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                  >
                    ← Use the request form instead
                  </button>
                </div>
              </div>
            )}

            {/*
             * Calendly container — always in DOM when URL configured.
             * When in form view: positioned off-screen so iframe preloads silently.
             * When in calendar view: rendered inline at full height.
             */}
            {hasCalendlyUrl && (
              <div
                ref={calendlyContainerRef}
                aria-hidden={viewMode !== 'calendar'}
                className={cn(
                  'w-full',
                  viewMode === 'calendar'
                    ? 'block min-h-[520px]'
                    : 'fixed -top-[9999px] -left-[9999px] w-[720px] h-[600px] opacity-0 pointer-events-none'
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Note: window.Calendly type is declared globally in src/types/index.ts
