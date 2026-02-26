import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import {
  useGetSubscriptionTiers,
  useUpdateSubscriptionTierPrices,
  useSetSubscriptionTierFreeTrial,
  useCreateSubscriptionTier,
  useDeleteSubscriptionTier,
} from '../../hooks/useQueries';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TierRowProps {
  tier: {
    id: bigint;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    perks: string[];
    freeTrialEnabled: boolean;
  };
}

function TierRow({ tier }: TierRowProps) {
  const [monthlyPrice, setMonthlyPrice] = useState(tier.monthlyPrice.toString());
  const [yearlyPrice, setYearlyPrice] = useState(tier.yearlyPrice.toString());
  const [expanded, setExpanded] = useState(false);

  const updatePrices = useUpdateSubscriptionTierPrices();
  const setFreeTrial = useSetSubscriptionTierFreeTrial();
  const deleteTier = useDeleteSubscriptionTier();

  const handleSavePrices = async () => {
    const monthly = parseFloat(monthlyPrice);
    const yearly = parseFloat(yearlyPrice);
    if (isNaN(monthly) || isNaN(yearly)) {
      toast.error('Please enter valid prices.');
      return;
    }
    try {
      await updatePrices.mutateAsync({ id: tier.id, monthlyPrice: monthly, yearlyPrice: yearly });
      toast.success(`Prices updated for ${tier.name}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update prices');
    }
  };

  const handleToggleFreeTrial = async (enabled: boolean) => {
    try {
      await setFreeTrial.mutateAsync({ id: tier.id, enabled });
      toast.success(`Free trial ${enabled ? 'enabled' : 'disabled'} for ${tier.name}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update free trial');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTier.mutateAsync(tier.id);
      toast.success(`"${tier.name}" tier deleted`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete tier');
    }
  };

  return (
    <div className="rounded-xl border border-sunset-gold/20 bg-dusk-mid overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <span className="font-orbitron text-sunset-gold font-semibold text-base tracking-wide">
            {tier.name}
          </span>
          <span className="font-rajdhani text-muted-foreground text-sm">
            £{tier.monthlyPrice.toFixed(2)}/mo · £{tier.yearlyPrice.toFixed(2)}/yr
          </span>
          {tier.freeTrialEnabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-sunset-orange/20 text-sunset-orange font-rajdhani border border-sunset-orange/30">
              Free Trial
            </span>
          )}
          <span className="ml-auto text-muted-foreground">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-3 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              disabled={deleteTier.isPending}
            >
              {deleteTier.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-dusk-bg border-sunset-gold/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-orbitron text-sunset-gold">
                Delete Tier
              </AlertDialogTitle>
              <AlertDialogDescription className="font-rajdhani text-muted-foreground">
                Are you sure you want to delete the <strong className="text-foreground">"{tier.name}"</strong> subscription tier? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-rajdhani border-sunset-gold/30 hover:bg-sunset-gold/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="font-rajdhani bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-sunset-gold/10 px-5 py-4 space-y-4">
          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">
                Monthly Price (£)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className="bg-dusk-bg border-sunset-gold/20 font-rajdhani text-foreground focus:border-sunset-gold"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">
                Yearly Price (£)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                className="bg-dusk-bg border-sunset-gold/20 font-rajdhani text-foreground focus:border-sunset-gold"
              />
            </div>
          </div>

          <Button
            onClick={handleSavePrices}
            disabled={updatePrices.isPending}
            size="sm"
            className="font-rajdhani bg-sunset-gold/20 hover:bg-sunset-gold/30 text-sunset-gold border border-sunset-gold/30"
          >
            {updatePrices.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />Saving…</>
            ) : (
              <><Check size={14} className="mr-2" />Save Prices</>
            )}
          </Button>

          {/* Free trial toggle */}
          <div className="flex items-center gap-3 pt-1">
            <Switch
              checked={tier.freeTrialEnabled}
              onCheckedChange={handleToggleFreeTrial}
              disabled={setFreeTrial.isPending}
              className="data-[state=checked]:bg-sunset-orange"
            />
            <span className="font-rajdhani text-sm text-foreground">
              Free Trial Enabled
            </span>
            {setFreeTrial.isPending && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          </div>

          {/* Perks list (read-only display) */}
          {tier.perks.length > 0 && (
            <div className="space-y-1">
              <p className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">Perks</p>
              <ul className="space-y-1">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="font-rajdhani text-sm text-foreground flex items-start gap-2">
                    <span className="text-sunset-gold mt-0.5">•</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CreateTierFormProps {
  onClose: () => void;
}

function CreateTierForm({ onClose }: CreateTierFormProps) {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [perksText, setPerksText] = useState('');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);

  const createTier = useCreateSubscriptionTier();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Tier name is required.');
      return;
    }
    const monthly = parseFloat(monthlyPrice);
    const yearly = parseFloat(yearlyPrice);
    if (isNaN(monthly) || monthly < 0) {
      toast.error('Please enter a valid monthly price.');
      return;
    }
    if (isNaN(yearly) || yearly < 0) {
      toast.error('Please enter a valid yearly price.');
      return;
    }

    // Parse perks: split by newline or comma, trim, filter empty
    const perks = perksText
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      await createTier.mutateAsync({
        name: name.trim(),
        monthlyPrice: monthly,
        yearlyPrice: yearly,
        perks,
        freeTrialEnabled,
      });
      toast.success(`"${name.trim()}" tier created successfully!`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create tier');
    }
  };

  return (
    <div className="rounded-xl border border-sunset-gold/40 bg-dusk-mid overflow-hidden">
      {/* Form header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sunset-gold/20">
        <h3 className="font-orbitron text-sunset-gold font-semibold tracking-wide text-sm">
          New Subscription Tier
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close form"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {/* Tier name */}
        <div className="space-y-1">
          <Label className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">
            Tier Name *
          </Label>
          <Input
            type="text"
            placeholder="e.g. Gold, Diamond, Elite…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-dusk-bg border-sunset-gold/20 font-rajdhani text-foreground focus:border-sunset-gold"
            required
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">
              Monthly Price (£) *
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              className="bg-dusk-bg border-sunset-gold/20 font-rajdhani text-foreground focus:border-sunset-gold"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">
              Yearly Price (£) *
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={yearlyPrice}
              onChange={(e) => setYearlyPrice(e.target.value)}
              className="bg-dusk-bg border-sunset-gold/20 font-rajdhani text-foreground focus:border-sunset-gold"
              required
            />
          </div>
        </div>

        {/* Perks */}
        <div className="space-y-1">
          <Label className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wider">
            Perks
          </Label>
          <Textarea
            placeholder="Enter perks separated by new lines or commas&#10;e.g. Unlimited downloads&#10;Priority support&#10;Early access"
            value={perksText}
            onChange={(e) => setPerksText(e.target.value)}
            rows={4}
            className="bg-dusk-bg border-sunset-gold/20 font-rajdhani text-foreground focus:border-sunset-gold resize-none"
          />
          <p className="font-rajdhani text-xs text-muted-foreground">
            Separate perks with new lines or commas.
          </p>
        </div>

        {/* Free trial toggle */}
        <div className="flex items-center gap-3">
          <Switch
            checked={freeTrialEnabled}
            onCheckedChange={setFreeTrialEnabled}
            className="data-[state=checked]:bg-sunset-orange"
          />
          <span className="font-rajdhani text-sm text-foreground">Enable Free Trial</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={createTier.isPending}
            className="font-rajdhani bg-sunset-gold hover:bg-sunset-gold/90 text-dusk-bg font-semibold flex-1"
          >
            {createTier.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />Creating…</>
            ) : (
              <><Plus size={14} className="mr-2" />Create Tier</>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={createTier.isPending}
            className="font-rajdhani border border-sunset-gold/20 hover:bg-sunset-gold/10 text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SubscriptionManager() {
  const { data: tiers, isLoading, isError } = useGetSubscriptionTiers();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-sunset-gold" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="font-rajdhani text-destructive text-lg">Failed to load subscription tiers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-sunset-gold text-xl font-bold tracking-wide">
            Subscription Tiers
          </h2>
          <p className="font-rajdhani text-muted-foreground text-sm mt-0.5">
            {tiers && tiers.length > 0
              ? `${tiers.length} tier${tiers.length !== 1 ? 's' : ''} configured`
              : 'No tiers yet — create one below'}
          </p>
        </div>

        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="font-rajdhani bg-sunset-gold hover:bg-sunset-gold/90 text-dusk-bg font-semibold gap-2"
          >
            <Plus size={16} />
            Create New Tier
          </Button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <CreateTierForm onClose={() => setShowCreateForm(false)} />
      )}

      {/* Tier list */}
      {tiers && tiers.length > 0 ? (
        <div className="space-y-3">
          {tiers.map((tier) => (
            <TierRow key={tier.id.toString()} tier={tier} />
          ))}
        </div>
      ) : (
        !showCreateForm && (
          <div className="rounded-xl border border-sunset-gold/10 bg-dusk-mid px-6 py-12 text-center">
            <p className="font-rajdhani text-muted-foreground text-base">
              No subscription tiers found. Click <span className="text-sunset-gold font-semibold">Create New Tier</span> to add one.
            </p>
          </div>
        )
      )}
    </div>
  );
}
