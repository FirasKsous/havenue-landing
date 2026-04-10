import { useState, useCallback } from "react";
import { Check, X, Sparkles, Users } from 'lucide-react';
import { pricingCopy, pricingTiers, pricingUrgency, stripePriceIds } from '../../data/pricing';
import { SectionHeading } from '../ui/SectionHeading';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { CheckoutEmailModal } from '../modals/CheckoutEmailModal';
import { BookDemoModal } from '../modals/BookDemoModal';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';
import { getAnonymousId } from '../../lib/identity';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Email modal state (replaces window.prompt)
  const [emailModal, setEmailModal] = useState<{
    open: boolean;
    tier: string;
    price: string;
    priceId: string;
  }>({ open: false, tier: '', price: '', priceId: '' });

  // Demo booking modal state
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handlePricingToggle = useCallback(() => {
    setIsAnnual(prev => !prev);
    trackEvent({ event: 'pricing_toggle', data: { to: !isAnnual ? 'annual' : 'monthly' } });
  }, [isAnnual]);

  // Opens the glassmorphic email modal instead of window.prompt
  const handleStartTrial = useCallback((tierName: string) => {
    trackEvent({ event: 'pricing_card_clicked', data: { tier: tierName } });

    // Enterprise → demo booking
    if (tierName === 'Enterprise') {
      trackEvent({ event: 'enterprise_contact_clicked' });
      setDemoModalOpen(true);
      return;
    }

    // Self-serve → email collection modal → Stripe checkout
    const priceKey = `${tierName.toLowerCase()}_${isAnnual ? 'annual' : 'monthly'}` as keyof typeof stripePriceIds;
    const priceId = stripePriceIds[priceKey];

    if (!priceId) {
      setCheckoutError('Checkout is not configured yet. Please contact us.');
      return;
    }

    const tier = pricingTiers.find(t => t.name === tierName);
    const rawPrice = tier?.price ?? '£199';
    const displayPrice = isAnnual
      ? `£${Math.round(parseInt(rawPrice.replace('£', '')) * 0.9)}`
      : rawPrice;

    setCheckoutError(null);
    setEmailModal({ open: true, tier: tierName, price: displayPrice, priceId });
  }, [isAnnual]);

  // Called by CheckoutEmailModal once user submits valid email
  const handleEmailConfirmed = useCallback(async (email: string) => {
    const { tier, priceId } = emailModal;
    setEmailModal(prev => ({ ...prev, open: false }));
    setCheckoutLoading(tier);
    setCheckoutError(null);

    try {
      trackEvent({
        event: 'stripe_checkout_started',
        data: { tier, billing: isAnnual ? 'annual' : 'monthly' },
      });

      const anonymousId = getAnonymousId();
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          priceId,
          email,
          anonymousId,
          billingInterval: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'Failed to create checkout session');
      if (!data.url) throw new Error('No checkout URL returned');

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }, [emailModal, isAnnual]);

  const handleOpenDemo = useCallback(() => {
    trackEvent({ event: 'book_demo_clicked' });
    setDemoModalOpen(true);
  }, []);

  return (
    <>
      <section
        id="pricing"
        className="[padding-top:var(--section-padding-y)] [padding-bottom:var(--section-padding-y)] scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            headline={pricingCopy.headline}
            subheadline={pricingCopy.subheadline}
            className="mb-6"
          />

          {/* Urgency Banner */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2F8F4E] bg-[#2F8F4E]/10 px-3 py-1.5 rounded-full border border-[#2F8F4E]/20">
              <Sparkles className="w-3 h-3" />
              {pricingUrgency.banner}
            </span>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <span className={cn('text-sm transition-colors', !isAnnual ? 'text-white' : 'text-white/50')}>
              Monthly
            </span>
            <button
              onClick={handlePricingToggle}
              role="switch"
              aria-checked={isAnnual}
              aria-label="Toggle annual billing"
              className="relative w-12 h-6 rounded-full bg-white/10 border border-white/20 transition-colors flex-shrink-0"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#2F8F4E] transition-transform duration-300',
                  isAnnual && 'translate-x-6'
                )}
              />
            </button>
            <span className={cn('text-sm transition-colors', isAnnual ? 'text-white' : 'text-white/50')}>
              Annual
            </span>
            <span className={cn(
              'text-xs font-semibold text-[#2F8F4E] bg-[#2F8F4E]/10 px-2 py-0.5 rounded transition-opacity duration-200',
              isAnnual ? 'opacity-100' : 'opacity-0'
            )}>
              Save 10%
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6 max-w-[1200px] mx-auto">
            {pricingTiers.map((tier) => {
              const isSelfServe = tier.name !== 'Enterprise';
              const isLoading = checkoutLoading === tier.name;

              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative',
                    tier.highlighted && 'lg:scale-105 lg:-translate-y-2 z-10',
                  )}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <span className="inline-block bg-[#2F8F4E] text-[#0A0A0A] text-[10px] font-bold tracking-widest uppercase py-1 px-3 rounded-full">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <GlassCard
                    className={cn(
                      'h-full p-6 lg:p-8 flex flex-col',
                      tier.highlighted && 'border-[#2F8F4E]/30 shadow-[0_0_40px_rgba(47,143,78,0.18),0_30px_60px_rgba(0,0,0,0.45)]'
                    )}
                    hoverEffect={!tier.highlighted}
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-0.5">{tier.name}</h3>
                      <p className="text-sm text-white/50">{tier.target}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          {isAnnual && tier.price !== 'Custom'
                            ? `£${Math.round(parseInt(tier.price.replace('£', '')) * 0.9)}`
                            : tier.price}
                        </span>
                        {tier.price !== 'Custom' && (
                          <span className="text-white/50 text-sm">/mo</span>
                        )}
                      </div>
                      <p className="text-xs text-[#2F8F4E] mt-0.5">+ {tier.perEvent}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#2F8F4E] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                      {tier.unavailableFeatures?.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 opacity-50">
                          <X className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/40 line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA block */}
                    <div className="space-y-2">
                      {/* Primary CTA */}
                      <GlassButton
                        onClick={() => handleStartTrial(tier.name)}
                        variant={tier.highlighted ? 'primary' : 'ghost'}
                        className="w-full text-sm py-2"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading…' : tier.cta.text}
                      </GlassButton>

                      {/* Microcopy */}
                      <p className="text-xs text-white/40 text-center">{tier.cta.microcopy}</p>

                      {/* Secondary CTA: "Talk to the Team" for self-serve tiers only */}
                      {isSelfServe && (
                        <button
                          onClick={handleOpenDemo}
                          className={cn(
                            'w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg',
                            'text-xs font-medium text-white/40 hover:text-white/70',
                            'border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]',
                            'transition-all duration-200',
                            'focus-visible:ring-1 focus-visible:ring-[#2F8F4E]/40 focus-visible:outline-none',
                          )}
                        >
                          <Users className="w-3 h-3 flex-shrink-0" />
                          Talk to the Team
                        </button>
                      )}

                      {/* Error message */}
                      {checkoutError && !checkoutLoading && (
                        <p className="text-xs text-red-400 text-center">{checkoutError}</p>
                      )}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

        {/* Glassmorphic email collection modal */}
        <CheckoutEmailModal
          key={`${emailModal.tier}:${emailModal.priceId}:${emailModal.open}`}
          isOpen={emailModal.open}
          tier={emailModal.tier}
          price={emailModal.price}
        isAnnual={isAnnual}
        onConfirm={handleEmailConfirmed}
        onDismiss={() => setEmailModal(prev => ({ ...prev, open: false }))}
      />

      {/* Demo booking modal */}
      <BookDemoModal
        isOpen={demoModalOpen}
        onDismiss={() => setDemoModalOpen(false)}
      />
    </>
  );
}
