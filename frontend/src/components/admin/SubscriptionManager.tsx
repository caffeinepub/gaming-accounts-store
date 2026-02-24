import React, { useState } from 'react';
import { Edit2, Save, X, Loader2, Crown, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useSubscriptionTiers,
  useUpdateSubscriptionTierPrices,
  useSetSubscriptionTierFreeTrial,
  useInitializeDefaultTiers,
} from '../../hooks/useQueries';
import type { SubscriptionTier } from '../../backend';

interface EditState {
  monthlyPrice: string;
  yearlyPrice: string;
}

function TierRow({ tier }: { tier: SubscriptionTier }) {
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<EditState>({
    monthlyPrice: tier.monthlyPrice.toFixed(2),
    yearlyPrice: tier.yearlyPrice.toFixed(2),
  });

  const updatePrices = useUpdateSubscriptionTierPrices();
  const setFreeTrial = useSetSubscriptionTierFreeTrial();

  const handleSavePrices = async () => {
    const monthly = parseFloat(editValues.monthlyPrice);
    const yearly = parseFloat(editValues.yearlyPrice);

    if (isNaN(monthly) || monthly < 0) {
      toast.error('Invalid monthly price');
      return;
    }
    if (isNaN(yearly) || yearly < 0) {
      toast.error('Invalid yearly price');
      return;
    }

    try {
      await updatePrices.mutateAsync({ id: tier.id, monthlyPrice: monthly, yearlyPrice: yearly });
      toast.success(`${tier.name} prices updated successfully`);
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update prices');
    }
  };

  const handleCancelEdit = () => {
    setEditValues({
      monthlyPrice: tier.monthlyPrice.toFixed(2),
      yearlyPrice: tier.yearlyPrice.toFixed(2),
    });
    setEditing(false);
  };

  const handleToggleFreeTrial = async (enabled: boolean) => {
    try {
      await setFreeTrial.mutateAsync({ id: tier.id, enabled });
      toast.success(
        enabled
          ? `7-day free trial enabled for ${tier.name}`
          : `Free trial disabled for ${tier.name}`
      );
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update free trial setting');
    }
  };

  const isPro = tier.name === 'Pro';

  return (
    <div
      className={`p-5 rounded-sm border bg-card transition-all ${
        isPro ? 'border-sunset-gold/40 bg-sunset-gold/5' : 'border-border'
      }`}
    >
      {/* Tier header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-sm bg-muted ${isPro ? 'text-sunset-gold' : 'text-muted-foreground'}`}>
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-foreground">{tier.name}</h3>
            <p className="font-rajdhani text-xs text-muted-foreground">
              {tier.perks.length} perks included
            </p>
          </div>
          {isPro && (
            <span className="text-xs font-rajdhani font-semibold px-2 py-0.5 rounded-full bg-sunset-gold/20 text-sunset-gold border border-sunset-gold/30">
              Most Popular
            </span>
          )}
        </div>

        {!editing ? (
          <button
            onClick={() => {
              setEditValues({
                monthlyPrice: tier.monthlyPrice.toFixed(2),
                yearlyPrice: tier.yearlyPrice.toFixed(2),
              });
              setEditing(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border text-muted-foreground hover:border-sunset-gold hover:text-sunset-gold font-rajdhani text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Prices
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePrices}
              disabled={updatePrices.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-success/20 border border-success/30 text-success hover:bg-success/30 font-rajdhani text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {updatePrices.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={updatePrices.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border text-muted-foreground hover:border-destructive hover:text-destructive font-rajdhani text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Price fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label className="font-rajdhani text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Price (£)
          </Label>
          {editing ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editValues.monthlyPrice}
              onChange={(e) => setEditValues((prev) => ({ ...prev, monthlyPrice: e.target.value }))}
              className="font-orbitron text-sm bg-input border-border focus:border-sunset-gold"
            />
          ) : (
            <div className="px-3 py-2 rounded-sm border border-border bg-muted/30">
              <span className="font-orbitron font-bold text-sunset-gold">
                £{tier.monthlyPrice.toFixed(2)}
              </span>
              <span className="font-rajdhani text-xs text-muted-foreground ml-1">/mo</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="font-rajdhani text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Yearly Price (£)
          </Label>
          {editing ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editValues.yearlyPrice}
              onChange={(e) => setEditValues((prev) => ({ ...prev, yearlyPrice: e.target.value }))}
              className="font-orbitron text-sm bg-input border-border focus:border-sunset-gold"
            />
          ) : (
            <div className="px-3 py-2 rounded-sm border border-border bg-muted/30">
              <span className="font-orbitron font-bold text-sunset-orange">
                £{tier.yearlyPrice.toFixed(2)}
              </span>
              <span className="font-rajdhani text-xs text-muted-foreground ml-1">/yr</span>
            </div>
          )}
        </div>
      </div>

      {/* Free trial toggle */}
      <div className="flex items-center justify-between p-3 rounded-sm border border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${tier.freeTrialEnabled ? 'text-success' : 'text-muted-foreground'}`} />
          <div>
            <p className="font-rajdhani font-semibold text-sm text-foreground">7-Day Free Trial</p>
            <p className="font-rajdhani text-xs text-muted-foreground">
              {tier.freeTrialEnabled ? 'Enabled — users see a trial badge' : 'Disabled — no trial offered'}
            </p>
          </div>
        </div>
        <Switch
          checked={tier.freeTrialEnabled}
          onCheckedChange={handleToggleFreeTrial}
          disabled={setFreeTrial.isPending}
          className="data-[state=checked]:bg-success"
        />
      </div>

      {/* Perks preview */}
      <div className="mt-3">
        <p className="font-rajdhani text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Perks</p>
        <div className="flex flex-wrap gap-1.5">
          {tier.perks.map((perk, idx) => (
            <span
              key={idx}
              className="text-xs font-rajdhani px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground"
            >
              {perk}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionManager() {
  const { data: tiers, isLoading, error } = useSubscriptionTiers();
  const initTiers = useInitializeDefaultTiers();

  const orderedTiers = tiers ? [...tiers].sort((a, b) => Number(a.id) - Number(b.id)) : [];

  const handleInitialize = async () => {
    try {
      await initTiers.mutateAsync();
      toast.success('Default subscription tiers initialized');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to initialize tiers');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-sunset-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="font-rajdhani text-muted-foreground">Failed to load subscription tiers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-lg font-bold text-foreground">Subscription Tiers</h2>
          <p className="font-rajdhani text-sm text-muted-foreground mt-0.5">
            Manage pricing and free trial settings for each membership tier.
          </p>
        </div>
        {orderedTiers.length === 0 && (
          <button
            onClick={handleInitialize}
            disabled={initTiers.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm disabled:opacity-50"
          >
            {initTiers.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            Initialize Default Tiers
          </button>
        )}
      </div>

      {orderedTiers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-sm">
          <Crown className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-rajdhani text-muted-foreground text-center">
            No subscription tiers found. Click "Initialize Default Tiers" to create the default plans.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orderedTiers.map((tier) => (
            <TierRow key={tier.id.toString()} tier={tier} />
          ))}
        </div>
      )}
    </div>
  );
}
