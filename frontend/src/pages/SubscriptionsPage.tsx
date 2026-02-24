import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useSubscriptionTiers } from '../hooks/useQueries';
import type { SubscriptionTier } from '../backend';
import { Badge } from '@/components/ui/badge';

interface SubscriptionsPageProps {
  onSubscribe: (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly', price: number) => void;
}

const TIER_ICONS: Record<string, React.ReactNode> = {
  Starter: <Zap className="w-6 h-6" />,
  Basic: <Star className="w-6 h-6" />,
  Premium: <Sparkles className="w-6 h-6" />,
  Pro: <Crown className="w-6 h-6" />,
};

const TIER_COLORS: Record<string, { border: string; icon: string; badge: string; glow: string }> = {
  Starter: {
    border: 'border-border hover:border-sunset-gold/50',
    icon: 'text-sunset-gold',
    badge: 'bg-sunset-gold/10 text-sunset-gold border-sunset-gold/30',
    glow: '',
  },
  Basic: {
    border: 'border-border hover:border-sunset-orange/50',
    icon: 'text-sunset-orange',
    badge: 'bg-sunset-orange/10 text-sunset-orange border-sunset-orange/30',
    glow: '',
  },
  Premium: {
    border: 'border-border hover:border-sunset-pink/50',
    icon: 'text-sunset-pink',
    badge: 'bg-sunset-pink/10 text-sunset-pink border-sunset-pink/30',
    glow: '',
  },
  Pro: {
    border: 'border-sunset-gold sunset-glow',
    icon: 'text-sunset-gold',
    badge: 'bg-sunset-gold/20 text-sunset-gold border-sunset-gold/50',
    glow: 'sunset-glow',
  },
};

function TierCard({
  tier,
  billingCycle,
  onSubscribe,
}: {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  onSubscribe: () => void;
}) {
  const isPro = tier.name === 'Pro';
  const colors = TIER_COLORS[tier.name] ?? TIER_COLORS['Starter'];
  const icon = TIER_ICONS[tier.name] ?? <Star className="w-6 h-6" />;
  const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const priceLabel = billingCycle === 'monthly' ? '/mo' : '/yr';

  return (
    <div
      className={`relative flex flex-col rounded-sm border bg-card transition-all duration-200 ${colors.border} ${isPro ? 'scale-[1.02]' : ''}`}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-sunset-orange to-sunset-pink text-white text-xs font-orbitron font-bold tracking-wider uppercase sunset-glow-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-sm bg-muted ${colors.icon}`}>
              {icon}
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-lg text-foreground">{tier.name}</h3>
              {tier.freeTrialEnabled && (
                <span className={`inline-flex items-center gap-1 text-xs font-rajdhani font-semibold px-2 py-0.5 rounded-full border mt-1 ${colors.badge}`}>
                  <Sparkles className="w-3 h-3" />
                  7-day free trial
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="font-rajdhani text-xs text-muted-foreground mb-4 italic">
          If you select monthly you will need to pay monthly each time
        </p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-end gap-1">
            <span className={`font-orbitron font-black text-3xl ${isPro ? 'text-sunset-gold' : 'text-foreground'}`}>
              £{price.toFixed(2)}
            </span>
            <span className="font-rajdhani text-muted-foreground text-sm mb-1">{priceLabel}</span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="font-rajdhani text-xs text-success mt-1">
              Save ~20% vs monthly billing
            </p>
          )}
        </div>

        {/* Perks */}
        <ul className="space-y-2.5 mb-6">
          {tier.perks.map((perk, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.icon}`} />
              <span className="font-rajdhani text-sm text-muted-foreground">{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-6 pt-0">
        {tier.freeTrialEnabled && (
          <p className="font-rajdhani text-xs text-center text-muted-foreground mb-2">
            Start free — billing begins after 7 days
          </p>
        )}
        <button
          onClick={onSubscribe}
          className={`w-full py-3 rounded-sm font-rajdhani font-bold tracking-wider uppercase text-sm transition-all ${
            isPro
              ? 'bg-gradient-to-r from-sunset-orange to-sunset-pink text-white hover:opacity-90 sunset-glow-sm'
              : 'border border-border text-foreground hover:border-sunset-gold hover:text-sunset-gold hover:bg-sunset-gold/5'
          }`}
        >
          {tier.freeTrialEnabled ? 'Start Free Trial' : `Subscribe to ${tier.name}`}
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionsPage({ onSubscribe }: SubscriptionsPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { data: tiers, isLoading, error } = useSubscriptionTiers();

  const orderedTiers = tiers
    ? [...tiers].sort((a, b) => Number(a.id) - Number(b.id))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sunset-gold/30 bg-sunset-gold/5 mb-4">
            <Crown className="w-4 h-4 text-sunset-gold" />
            <span className="font-rajdhani text-sm font-semibold text-sunset-gold tracking-wider uppercase">
              Game Vault Memberships
            </span>
          </div>
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-foreground mb-3">
            Choose Your{' '}
            <span className="game-vault-gradient">Subscription</span>
          </h1>
          <p className="font-rajdhani text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock exclusive perks, discounts, and benefits with a Game Vault membership.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex items-center gap-1 p-1 rounded-sm border border-border bg-card">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-sm font-rajdhani font-semibold text-sm tracking-wider uppercase transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-sunset-gold text-background sunset-glow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-sm font-rajdhani font-semibold text-sm tracking-wider uppercase transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-sunset-gold text-background sunset-glow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
          {billingCycle === 'monthly' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-sm border border-warning/30 bg-warning/5">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
              <p className="font-rajdhani text-sm text-warning">
                If you select monthly you will need to pay monthly each time
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sunset-gold" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <p className="font-rajdhani text-muted-foreground">Failed to load subscription tiers.</p>
            </div>
          </div>
        )}

        {/* Empty state — tiers not yet initialized */}
        {!isLoading && !error && orderedTiers.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <Crown className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-rajdhani text-muted-foreground">
                Subscription tiers are being set up. Please check back soon.
              </p>
            </div>
          </div>
        )}

        {/* Tier Cards */}
        {!isLoading && orderedTiers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {orderedTiers.map((tier) => (
              <TierCard
                key={tier.id.toString()}
                tier={tier}
                billingCycle={billingCycle}
                onSubscribe={() => {
                  const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
                  onSubscribe(tier, billingCycle, price);
                }}
              />
            ))}
          </div>
        )}

        {/* Payment methods note */}
        {!isLoading && orderedTiers.length > 0 && (
          <p className="text-center font-rajdhani text-xs text-muted-foreground mt-8">
            Subscriptions are paid via PayPal or Cryptocurrency only.
          </p>
        )}
      </div>
    </div>
  );
}
