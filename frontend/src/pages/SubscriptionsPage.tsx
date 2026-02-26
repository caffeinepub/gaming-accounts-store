import React, { useState } from 'react';
import { Crown, Check, Loader2, Zap } from 'lucide-react';
import { useGetSubscriptionTiers } from '../hooks/useQueries';
import { type SubscriptionTier } from '../backend';

interface TierCardProps {
  tier: SubscriptionTier;
  isYearly: boolean;
  onSubscribe: (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly', price: number) => void;
}

function TierCard({ tier, isYearly, onSubscribe }: TierCardProps) {
  const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  const period = isYearly ? 'yr' : 'mo';
  const billingCycle: 'monthly' | 'yearly' = isYearly ? 'yearly' : 'monthly';

  const isPopular = tier.name.toLowerCase() === 'premium';

  return (
    <div
      className={`relative rounded-2xl border flex flex-col overflow-hidden transition-transform hover:-translate-y-1 ${
        isPopular
          ? 'border-sunset-gold bg-dusk-mid shadow-lg shadow-sunset-gold/10'
          : 'border-sunset-gold/20 bg-dusk-mid/60'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sunset-orange via-sunset-gold to-sunset-orange" />
      )}

      <div className="px-6 pt-6 pb-4">
        {isPopular && (
          <div className="flex items-center gap-1.5 mb-3">
            <Crown size={13} className="text-sunset-gold" />
            <span className="font-rajdhani text-xs text-sunset-gold uppercase tracking-widest font-semibold">
              Most Popular
            </span>
          </div>
        )}

        <h3 className="font-orbitron text-xl font-bold text-foreground tracking-wide">
          {tier.name}
        </h3>

        <div className="mt-3 flex items-end gap-1">
          <span className="font-orbitron text-3xl font-bold text-sunset-gold">
            £{price.toFixed(2)}
          </span>
          <span className="font-rajdhani text-muted-foreground text-sm mb-1">/{period}</span>
        </div>

        {isYearly && tier.monthlyPrice > 0 && (
          <p className="font-rajdhani text-xs text-sunset-orange mt-1">
            Save £{((tier.monthlyPrice * 12) - tier.yearlyPrice).toFixed(2)} vs monthly
          </p>
        )}

        {tier.freeTrialEnabled && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sunset-orange/15 border border-sunset-orange/30">
            <Zap size={11} className="text-sunset-orange" />
            <span className="font-rajdhani text-xs text-sunset-orange font-semibold">
              Free Trial Available
            </span>
          </div>
        )}
      </div>

      {tier.perks.length > 0 && (
        <div className="px-6 pb-4 flex-1">
          <ul className="space-y-2">
            {tier.perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check size={14} className="text-sunset-gold mt-0.5 shrink-0" />
                <span className="font-rajdhani text-sm text-foreground/80">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={() => onSubscribe(tier, billingCycle, price)}
          className={`w-full py-2.5 rounded-xl font-rajdhani font-semibold text-sm tracking-wide transition-all ${
            isPopular
              ? 'bg-sunset-gold hover:bg-sunset-gold/90 text-dusk-bg'
              : 'bg-sunset-gold/15 hover:bg-sunset-gold/25 text-sunset-gold border border-sunset-gold/30'
          }`}
        >
          {tier.freeTrialEnabled ? 'Start Free Trial' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
}

interface SubscriptionsPageProps {
  onSubscribe?: (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly', price: number) => void;
}

export default function SubscriptionsPage({ onSubscribe }: SubscriptionsPageProps) {
  const [isYearly, setIsYearly] = useState(false);
  const { data: tiers, isLoading, isError } = useGetSubscriptionTiers();

  const handleSubscribe = (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly', price: number) => {
    if (onSubscribe) {
      onSubscribe(tier, billingCycle, price);
    }
  };

  return (
    <main className="min-h-screen bg-dusk-bg py-16 px-4">
      {/* Page header */}
      <div className="max-w-5xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown size={22} className="text-sunset-gold" />
          <span className="font-orbitron text-sunset-gold text-sm uppercase tracking-widest font-semibold">
            Membership Plans
          </span>
        </div>
        <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="font-rajdhani text-muted-foreground text-lg max-w-xl mx-auto">
          Unlock exclusive perks, early access, and premium support with a Game Vault membership.
        </p>

        {/* Billing toggle — only show when tiers exist */}
        {tiers && tiers.length > 0 && (
          <div className="mt-8 inline-flex items-center gap-3 bg-dusk-mid border border-sunset-gold/20 rounded-full px-5 py-2.5">
            <button
              onClick={() => setIsYearly(false)}
              className={`font-rajdhani text-sm font-semibold transition-colors ${
                !isYearly ? 'text-sunset-gold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <div
              onClick={() => setIsYearly((v) => !v)}
              className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
                isYearly ? 'bg-sunset-gold' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-dusk-bg transition-transform ${
                  isYearly ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <button
              onClick={() => setIsYearly(true)}
              className={`font-rajdhani text-sm font-semibold transition-colors ${
                isYearly ? 'text-sunset-gold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-sunset-orange font-rajdhani">Save more</span>
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-sunset-gold" size={36} />
          </div>
        ) : isError ? (
          <div className="text-center py-24">
            <p className="font-rajdhani text-destructive text-lg">
              Failed to load subscription plans. Please try again later.
            </p>
          </div>
        ) : tiers && tiers.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex flex-col items-center gap-4">
              <Crown size={48} className="text-sunset-gold/30" />
              <p className="font-orbitron text-foreground/60 text-lg tracking-wide">
                We are currently updating our subscriptions, please check back later
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers?.map((tier) => (
              <TierCard
                key={tier.id.toString()}
                tier={tier}
                isYearly={isYearly}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {tiers && tiers.length > 0 && (
        <div className="max-w-5xl mx-auto mt-10 text-center">
          <p className="font-rajdhani text-xs text-muted-foreground">
            All prices shown in GBP. Subscriptions renew automatically. Cancel anytime.
          </p>
        </div>
      )}
    </main>
  );
}
