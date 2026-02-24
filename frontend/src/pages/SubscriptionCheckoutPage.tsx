import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Bitcoin, Loader2, Calendar, Crown, Sparkles } from 'lucide-react';
import { PaymentMethod } from '../backend';
import type { SubscriptionTier } from '../backend';

interface SubscriptionCheckoutPageProps {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  onBack: () => void;
  onComplete: () => void;
}

type CheckoutStep = 'review' | 'payment-method' | 'payment-details' | 'confirmation';

const SUBSCRIPTION_PAYMENT_METHODS = [
  {
    id: PaymentMethod.paypal,
    label: 'PayPal',
    description: 'Pay securely with PayPal',
    icon: CreditCard,
    color: 'text-sunset-gold',
  },
  {
    id: PaymentMethod.cryptocurrency,
    label: 'Cryptocurrency',
    description: 'BTC, ETH and more',
    icon: Bitcoin,
    color: 'text-sunset-orange',
  },
];

const MOCK_BTC_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf';
const MOCK_ETH_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9B8e4e3f1a2b3';
const BTC_RATE = 0.000015;
const ETH_RATE = 0.00045;

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-orbitron font-bold transition-all ${
                idx < current
                  ? 'bg-success text-background'
                  : idx === current
                  ? 'bg-sunset-gold text-background sunset-glow-sm'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < current ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <span
              className={`hidden sm:block font-rajdhani text-xs font-semibold uppercase tracking-wider ${
                idx === current ? 'text-sunset-gold' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-px ${idx < current ? 'bg-success/50' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ReviewStep({
  tier,
  billingCycle,
  price,
  onNext,
}: {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron text-xl font-bold text-foreground mb-1">Review Your Plan</h2>
        <p className="font-rajdhani text-muted-foreground text-sm">Confirm your subscription details before payment.</p>
      </div>

      {/* Tier summary card */}
      <div className="p-5 rounded-sm border border-sunset-gold/30 bg-sunset-gold/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm bg-muted text-sunset-gold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="font-orbitron font-bold text-foreground">{tier.name} Plan</p>
            <p className="font-rajdhani text-sm text-muted-foreground capitalize">{billingCycle} billing</p>
          </div>
          {tier.freeTrialEnabled && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-rajdhani font-semibold px-2 py-0.5 rounded-full border bg-success/10 text-success border-success/30">
              <Sparkles className="w-3 h-3" />
              7-day free trial
            </span>
          )}
        </div>

        {tier.freeTrialEnabled && (
          <div className="flex items-start gap-2 p-3 rounded-sm border border-success/20 bg-success/5 mb-4">
            <Calendar className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <p className="font-rajdhani text-sm text-success">
              7-day free trial — billing starts after your trial ends
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-rajdhani font-semibold text-muted-foreground">
            {billingCycle === 'monthly' ? 'Monthly price' : 'Yearly price'}
          </span>
          <span className="font-orbitron font-black text-sunset-gold text-xl">
            £{price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Perks summary */}
      <div className="p-4 rounded-sm border border-border bg-card">
        <p className="font-rajdhani font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Included perks
        </p>
        <ul className="space-y-2">
          {tier.perks.map((perk, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span className="font-rajdhani text-sm text-foreground">{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm"
      >
        Continue to Payment
      </button>
    </div>
  );
}

function PaymentMethodStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron text-xl font-bold text-foreground mb-1">Payment Method</h2>
        <p className="font-rajdhani text-muted-foreground text-sm">Choose how you'd like to pay for your subscription.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUBSCRIPTION_PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`flex items-start gap-3 p-4 rounded-sm border text-left transition-all ${
                isSelected
                  ? 'border-sunset-gold bg-sunset-gold/10 sunset-glow-sm'
                  : 'border-border bg-card hover:border-sunset-gold/40 hover:bg-muted'
              }`}
            >
              <div className={`mt-0.5 ${method.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-orbitron text-sm font-bold ${isSelected ? 'text-sunset-gold' : 'text-foreground'}`}>
                  {method.label}
                </p>
                <p className="font-rajdhani text-xs text-muted-foreground mt-0.5">
                  {method.description}
                </p>
              </div>
              {isSelected && (
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-sunset-gold bg-sunset-gold/30 flex-shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="w-full py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}

function PayPalStep({
  price,
  freeTrialEnabled,
  onConfirm,
  isLoading,
}: {
  price: number;
  freeTrialEnabled: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const [redirected, setRedirected] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-orbitron text-xl font-bold text-foreground mb-1">PayPal Payment</h2>
        <p className="font-rajdhani text-muted-foreground text-sm">Complete your subscription payment via PayPal.</p>
      </div>

      {freeTrialEnabled && (
        <div className="flex items-start gap-2 p-3 rounded-sm border border-success/20 bg-success/5">
          <Calendar className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          <p className="font-rajdhani text-sm text-success">
            7-day free trial — billing starts after your trial ends
          </p>
        </div>
      )}

      <div className="flex items-center justify-center p-6 rounded-sm border border-border bg-muted/30">
        <div className="text-center space-y-2">
          <div className="font-orbitron text-2xl font-bold text-sunset-gold">PayPal</div>
          <p className="font-rajdhani text-muted-foreground text-sm">Secure subscription payment via PayPal</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-sm border border-border bg-card">
        <span className="font-rajdhani font-semibold text-muted-foreground">
          {freeTrialEnabled ? 'Amount after trial' : 'Amount to pay'}
        </span>
        <span className="font-orbitron font-bold text-sunset-gold text-lg">
          £{price.toFixed(2)}
        </span>
      </div>

      {!redirected ? (
        <button
          onClick={() => setRedirected(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-sunset-gold text-background font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm"
        >
          Continue to PayPal
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-sm border border-success/30 bg-success/10">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <p className="font-rajdhani text-sm text-success">
              Payment authorised on PayPal. Click below to confirm your subscription.
            </p>
          </div>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Subscription'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function CryptoStep({
  price,
  freeTrialEnabled,
  onConfirm,
  isLoading,
}: {
  price: number;
  freeTrialEnabled: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH'>('BTC');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const address = selectedCurrency === 'BTC' ? MOCK_BTC_ADDRESS : MOCK_ETH_ADDRESS;
  const cryptoAmount =
    selectedCurrency === 'BTC'
      ? (price * BTC_RATE).toFixed(8)
      : (price * ETH_RATE).toFixed(6);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-orbitron text-xl font-bold text-foreground mb-1">Crypto Payment</h2>
        <p className="font-rajdhani text-muted-foreground text-sm">Send the exact amount to the address below.</p>
      </div>

      {freeTrialEnabled && (
        <div className="flex items-start gap-2 p-3 rounded-sm border border-success/20 bg-success/5">
          <Calendar className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
          <p className="font-rajdhani text-sm text-success">
            7-day free trial — billing starts after your trial ends
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {(['BTC', 'ETH'] as const).map((currency) => (
          <button
            key={currency}
            onClick={() => setSelectedCurrency(currency)}
            className={`flex-1 py-2 rounded-sm border font-orbitron text-sm font-bold transition-all ${
              selectedCurrency === currency
                ? 'border-sunset-orange bg-sunset-orange/10 text-sunset-orange sunset-glow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-sunset-orange/40'
            }`}
          >
            {currency}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-sm border border-border bg-card space-y-2">
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">GBP Amount</span>
          <span className="font-orbitron font-bold text-sunset-gold">£{price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">{selectedCurrency} Amount</span>
          <span className="font-orbitron font-bold text-sunset-orange">
            {cryptoAmount} {selectedCurrency}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Send to address
        </p>
        <div className="flex items-center gap-2 p-3 rounded-sm border border-border bg-muted/30">
          <code className="flex-1 font-mono text-xs text-sunset-gold break-all">{address}</code>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors flex-shrink-0"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Bitcoin className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-sunset-orange"
        />
        <span className="font-rajdhani text-sm text-muted-foreground">
          I have sent the exact amount to the address above
        </span>
      </label>

      <button
        onClick={onConfirm}
        disabled={!confirmed || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Confirming...
          </>
        ) : (
          'Confirm Payment'
        )}
      </button>
    </div>
  );
}

function ConfirmationStep({
  tier,
  billingCycle,
  price,
  paymentMethod,
  onComplete,
}: {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  paymentMethod: PaymentMethod;
  onComplete: () => void;
}) {
  const methodLabel = paymentMethod === PaymentMethod.paypal ? 'PayPal' : 'Cryptocurrency';

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center sunset-glow-sm">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <div>
          <h2 className="font-orbitron text-2xl font-black text-foreground mb-1">
            Subscription Confirmed!
          </h2>
          <p className="font-rajdhani text-muted-foreground">
            Welcome to Game Vault {tier.name}. Your membership is now active.
          </p>
        </div>
      </div>

      {tier.freeTrialEnabled && (
        <div className="flex items-center gap-2 p-3 rounded-sm border border-success/20 bg-success/5 text-left">
          <Calendar className="w-4 h-4 text-success flex-shrink-0" />
          <p className="font-rajdhani text-sm text-success">
            Your 7-day free trial has started. Billing begins after the trial period.
          </p>
        </div>
      )}

      <div className="p-5 rounded-sm border border-border bg-card text-left space-y-3">
        <p className="font-rajdhani font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Order Summary
        </p>
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">Plan</span>
          <span className="font-orbitron font-bold text-foreground text-sm">{tier.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">Billing Cycle</span>
          <span className="font-rajdhani font-semibold text-foreground text-sm capitalize">{billingCycle}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">Amount</span>
          <span className="font-orbitron font-bold text-sunset-gold text-sm">£{price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">Payment Method</span>
          <span className="font-rajdhani font-semibold text-foreground text-sm">{methodLabel}</span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm"
      >
        Back to Store
      </button>
    </div>
  );
}

const STEP_LABELS = ['Review', 'Payment', 'Details', 'Confirm'];

export default function SubscriptionCheckoutPage({
  tier,
  billingCycle,
  price,
  onBack,
  onComplete,
}: SubscriptionCheckoutPageProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stepIndex: Record<CheckoutStep, number> = {
    review: 0,
    'payment-method': 1,
    'payment-details': 2,
    confirmation: 3,
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    // Simulate async processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setStep('confirmation');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back button */}
        {step !== 'confirmation' && (
          <button
            onClick={step === 'review' ? onBack : () => {
              if (step === 'payment-method') setStep('review');
              else if (step === 'payment-details') setStep('payment-method');
            }}
            className="flex items-center gap-2 font-rajdhani text-sm text-muted-foreground hover:text-sunset-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'review' ? 'Back to Subscriptions' : 'Back'}
          </button>
        )}

        {/* Step indicator */}
        <StepIndicator current={stepIndex[step]} steps={STEP_LABELS} />

        {/* Step content */}
        {step === 'review' && (
          <ReviewStep
            tier={tier}
            billingCycle={billingCycle}
            price={price}
            onNext={() => setStep('payment-method')}
          />
        )}

        {step === 'payment-method' && (
          <PaymentMethodStep
            selected={selectedMethod}
            onSelect={setSelectedMethod}
            onNext={() => setStep('payment-details')}
          />
        )}

        {step === 'payment-details' && selectedMethod === PaymentMethod.paypal && (
          <PayPalStep
            price={price}
            freeTrialEnabled={tier.freeTrialEnabled}
            onConfirm={handleConfirmPayment}
            isLoading={isProcessing}
          />
        )}

        {step === 'payment-details' && selectedMethod === PaymentMethod.cryptocurrency && (
          <CryptoStep
            price={price}
            freeTrialEnabled={tier.freeTrialEnabled}
            onConfirm={handleConfirmPayment}
            isLoading={isProcessing}
          />
        )}

        {step === 'confirmation' && selectedMethod && (
          <ConfirmationStep
            tier={tier}
            billingCycle={billingCycle}
            price={price}
            paymentMethod={selectedMethod}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
}
