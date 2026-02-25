import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShoppingCart, User, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethod } from '../backend';
import type { Product } from '../backend';
import { usePlaceOrder, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import PayPalPayment from '../components/checkout/PayPalPayment';
import CryptoPayment from '../components/checkout/CryptoPayment';
import GiftCardPayment from '../components/checkout/GiftCardPayment';
import PayIn3Payment from '../components/checkout/PayIn3Payment';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  onOrderComplete: (orderId: bigint) => void;
  onBack: () => void;
}

type Step = 'review' | 'contact' | 'payment-method' | 'payment-details';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'review', label: 'Review', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact', icon: <User className="w-4 h-4" /> },
  { id: 'payment-method', label: 'Method', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'payment-details', label: 'Payment', icon: <CheckCircle className="w-4 h-4" /> },
];

export default function CheckoutPage({ cartItems, onOrderComplete, onBack }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('review');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const placeOrder = usePlaceOrder();

  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const buildOrderVars = (gcNumber = '', gcBalance = '') => {
    const product = cartItems[0].product;
    const principal = identity?.getPrincipal() ?? Principal.anonymous();
    return {
      buyerPrincipal: principal,
      username: userProfile?.username ?? '',
      email: email.trim() || userProfile?.email || '',
      contactInfo: contact.trim() || userProfile?.contact || '',
      productId: product.id,
      paymentMethod: selectedMethod!,
      giftCardNumber: gcNumber,
      giftCardBalance: gcBalance,
    };
  };

  const handlePlaceOrder = async () => {
    if (!selectedMethod || cartItems.length === 0) return;
    try {
      await placeOrder.mutateAsync(buildOrderVars());
      // Use 0n as sentinel — OrderConfirmationPage handles this gracefully
      onOrderComplete(0n);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      toast.error(msg);
    }
  };

  const handleGiftCardPlaceOrder = async (cardNumber: string, cardBalance: string) => {
    if (!selectedMethod || cartItems.length === 0) return;
    try {
      await placeOrder.mutateAsync(buildOrderVars(cardNumber, cardBalance));
      onOrderComplete(0n);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-sunset-gold transition-colors mb-6 font-rajdhani font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-rajdhani font-semibold transition-colors ${
                i === currentStepIndex
                  ? 'bg-sunset-gold/10 text-sunset-gold border border-sunset-gold/30'
                  : i < currentStepIndex
                  ? 'text-success'
                  : 'text-muted-foreground'
              }`}>
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < currentStepIndex ? 'bg-success' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-sunset-orange via-sunset-pink to-sunset-purple" />
          <div className="p-6">

            {/* Review */}
            {step === 'review' && (
              <div className="space-y-4">
                <h2 className="font-orbitron text-lg font-bold text-foreground">Order Review</h2>
                {cartItems.map((item) => (
                  <div key={item.product.id.toString()} className="flex items-start justify-between gap-3 p-3 rounded-sm border border-border bg-background">
                    <div>
                      <p className="font-orbitron text-sm font-bold text-foreground">{item.product.gameName}</p>
                      <p className="font-rajdhani text-xs text-muted-foreground mt-0.5">{item.product.title}</p>
                    </div>
                    <span className="font-orbitron font-bold text-sunset-gold flex-shrink-0">
                      £{(Number(item.product.price) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-rajdhani font-semibold text-muted-foreground">Total</span>
                  <span className="font-orbitron font-bold text-sunset-gold text-xl">
                    £{(total / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setStep('contact')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Contact */}
            {step === 'contact' && (
              <div className="space-y-4">
                <h2 className="font-orbitron text-lg font-bold text-foreground">Contact Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={userProfile?.email || 'your@email.com'}
                      className="w-full px-3 py-2 rounded-sm border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold/30 font-rajdhani transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Contact / Discord (optional)
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={userProfile?.contact || 'Discord#1234 or phone'}
                      className="w-full px-3 py-2 rounded-sm border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold/30 font-rajdhani transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('review')}
                    className="flex-1 py-2.5 rounded-sm border border-border text-muted-foreground font-rajdhani font-semibold hover:border-sunset-gold/40 hover:text-sunset-gold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('payment-method')}
                    disabled={!email.trim() && !userProfile?.email}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Payment method */}
            {step === 'payment-method' && (
              <div className="space-y-4">
                <h2 className="font-orbitron text-lg font-bold text-foreground">Payment Method</h2>
                <PaymentMethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('contact')}
                    className="flex-1 py-2.5 rounded-sm border border-border text-muted-foreground font-rajdhani font-semibold hover:border-sunset-gold/40 hover:text-sunset-gold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('payment-details')}
                    disabled={!selectedMethod}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Payment details */}
            {step === 'payment-details' && selectedMethod && (
              <div className="space-y-4">
                <h2 className="font-orbitron text-lg font-bold text-foreground">Payment Details</h2>
                {selectedMethod === PaymentMethod.paypal && (
                  <PayPalPayment
                    amount={total}
                    onConfirm={handlePlaceOrder}
                    isLoading={placeOrder.isPending}
                  />
                )}
                {selectedMethod === PaymentMethod.cryptocurrency && (
                  <CryptoPayment
                    amount={total}
                    onConfirm={handlePlaceOrder}
                    isLoading={placeOrder.isPending}
                  />
                )}
                {selectedMethod === PaymentMethod.ukGiftCard && (
                  <GiftCardPayment
                    amount={total}
                    onConfirm={handleGiftCardPlaceOrder}
                    isLoading={placeOrder.isPending}
                  />
                )}
                {selectedMethod === PaymentMethod.payIn3Installments && (
                  <PayIn3Payment
                    amount={total}
                    onConfirm={handlePlaceOrder}
                    isLoading={placeOrder.isPending}
                  />
                )}
                <button
                  onClick={() => setStep('payment-method')}
                  className="w-full py-2 rounded-sm border border-border text-muted-foreground font-rajdhani font-semibold hover:border-sunset-gold/40 hover:text-sunset-gold transition-colors text-sm"
                >
                  ← Change Payment Method
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
