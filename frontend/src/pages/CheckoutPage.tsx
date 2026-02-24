import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { usePlaceOrder } from '../hooks/useQueries';
import { PaymentMethod } from '../backend';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import PayPalPayment from '../components/checkout/PayPalPayment';
import CryptoPayment from '../components/checkout/CryptoPayment';
import GiftCardPayment from '../components/checkout/GiftCardPayment';
import PayIn3Payment from '../components/checkout/PayIn3Payment';
import { toast } from 'sonner';

type Step = 'review' | 'payment-method' | 'payment-details' | 'confirmation';

const STEPS: { key: Step; label: string }[] = [
  { key: 'review', label: 'Review' },
  { key: 'payment-method', label: 'Payment' },
  { key: 'payment-details', label: 'Details' },
  { key: 'confirmation', label: 'Confirm' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { identity } = useInternetIdentity();
  const placeOrder = usePlaceOrder();
  const [step, setStep] = useState<Step>('review');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [orderId, setOrderId] = useState<bigint | null>(null);

  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  if (!identity) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="font-heading text-xl mb-4" style={{ color: 'oklch(0.55 0.02 260)' }}>
          Please login to checkout
        </p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-6 py-3 rounded font-heading font-bold tracking-wide uppercase text-sm"
          style={{ background: 'oklch(0.72 0.22 35)', color: 'oklch(0.08 0.005 260)' }}
        >
          Back to Store
        </button>
      </div>
    );
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="font-heading text-xl mb-4" style={{ color: 'oklch(0.55 0.02 260)' }}>
          Your cart is empty
        </p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-6 py-3 rounded font-heading font-bold tracking-wide uppercase text-sm"
          style={{ background: 'oklch(0.72 0.22 35)', color: 'oklch(0.08 0.005 260)' }}
        >
          Browse Store
        </button>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  const handlePlaceOrder = async () => {
    if (!selectedMethod || items.length === 0) return;
    try {
      const firstItem = items[0];
      const id = await placeOrder.mutateAsync({
        productId: firstItem.product.id,
        paymentMethod: selectedMethod,
        status: 'pending',
      });
      setOrderId(id);
      clearCart();
      setStep('confirmation');
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      {step !== 'confirmation' && (
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: 'oklch(0.55 0.02 260)' }}
        >
          <ArrowLeft size={14} />
          Back to Store
        </button>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-gaming transition-all duration-300"
                style={{
                  background:
                    i < currentStepIndex
                      ? 'oklch(0.5 0.18 145)'
                      : i === currentStepIndex
                      ? 'oklch(0.72 0.22 35)'
                      : 'oklch(0.18 0.01 260)',
                  color:
                    i <= currentStepIndex ? 'oklch(0.08 0.005 260)' : 'oklch(0.45 0.02 260)',
                  border: `1px solid ${
                    i === currentStepIndex
                      ? 'oklch(0.72 0.22 35)'
                      : 'oklch(0.25 0.015 260)'
                  }`,
                  boxShadow:
                    i === currentStepIndex
                      ? '0 0 15px oklch(0.72 0.22 35 / 0.5)'
                      : 'none',
                }}
              >
                {i < currentStepIndex ? <Check size={12} /> : i + 1}
              </div>
              <span
                className="text-xs mt-1 hidden sm:block"
                style={{
                  color:
                    i === currentStepIndex
                      ? 'oklch(0.72 0.22 35)'
                      : 'oklch(0.4 0.02 260)',
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-12 sm:w-20 h-px mx-2 transition-all duration-300"
                style={{
                  background:
                    i < currentStepIndex
                      ? 'oklch(0.5 0.18 145)'
                      : 'oklch(0.25 0.015 260)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'oklch(0.13 0.008 260)',
          border: '1px solid oklch(0.22 0.012 260)',
        }}
      >
        {/* Step 1: Review */}
        {step === 'review' && (
          <div>
            <h2
              className="font-heading text-xl font-bold mb-4"
              style={{ color: 'oklch(0.95 0.01 260)' }}
            >
              Review Your Order
            </h2>
            <div className="flex flex-col gap-3 mb-6">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id.toString()}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    background: 'oklch(0.15 0.01 260)',
                    border: '1px solid oklch(0.22 0.012 260)',
                  }}
                >
                  <span className="text-2xl">🎮</span>
                  <div className="flex-1">
                    <p
                      className="font-heading font-semibold text-sm"
                      style={{ color: 'oklch(0.9 0.01 260)' }}
                    >
                      {product.title}
                    </p>
                    <p className="text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>
                      {product.gameName} × {quantity}
                    </p>
                  </div>
                  <span
                    className="font-gaming text-sm"
                    style={{ color: 'oklch(0.72 0.22 35)' }}
                  >
                    {formatPrice(product.price * BigInt(quantity))}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between p-4 rounded-lg mb-6"
              style={{
                background: 'oklch(0.1 0.005 260)',
                border: '1px solid oklch(0.72 0.22 35 / 0.3)',
              }}
            >
              <span
                className="font-heading font-bold"
                style={{ color: 'oklch(0.75 0.02 260)' }}
              >
                Total
              </span>
              <span
                className="font-gaming text-2xl"
                style={{ color: 'oklch(0.72 0.22 35)' }}
              >
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={() => setStep('payment-method')}
              className="w-full py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'oklch(0.72 0.22 35)',
                color: 'oklch(0.08 0.005 260)',
                boxShadow: '0 0 20px oklch(0.72 0.22 35 / 0.4)',
              }}
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 'payment-method' && (
          <div>
            <h2
              className="font-heading text-xl font-bold mb-4"
              style={{ color: 'oklch(0.95 0.01 260)' }}
            >
              Select Payment Method
            </h2>
            <PaymentMethodSelector
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('review')}
                className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200"
                style={{
                  background: 'oklch(0.18 0.01 260)',
                  color: 'oklch(0.7 0.02 260)',
                  border: '1px solid oklch(0.25 0.015 260)',
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep('payment-details')}
                disabled={!selectedMethod}
                className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'oklch(0.72 0.22 35)',
                  color: 'oklch(0.08 0.005 260)',
                  boxShadow: selectedMethod
                    ? '0 0 20px oklch(0.72 0.22 35 / 0.4)'
                    : 'none',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 'payment-details' && selectedMethod && (
          <div>
            <h2
              className="font-heading text-xl font-bold mb-4"
              style={{ color: 'oklch(0.95 0.01 260)' }}
            >
              Payment Details
            </h2>
            {selectedMethod === PaymentMethod.paypal && (
              <PayPalPayment
                total={totalPrice}
                onConfirm={handlePlaceOrder}
                onBack={() => setStep('payment-method')}
                isLoading={placeOrder.isPending}
              />
            )}
            {selectedMethod === PaymentMethod.cryptocurrency && (
              <CryptoPayment
                total={totalPrice}
                onConfirm={handlePlaceOrder}
                onBack={() => setStep('payment-method')}
                isLoading={placeOrder.isPending}
              />
            )}
            {selectedMethod === PaymentMethod.ukGiftCard && (
              <GiftCardPayment
                total={totalPrice}
                onConfirm={handlePlaceOrder}
                onBack={() => setStep('payment-method')}
                isLoading={placeOrder.isPending}
              />
            )}
            {selectedMethod === PaymentMethod.payIn3Installments && (
              <PayIn3Payment
                total={totalPrice}
                onConfirm={handlePlaceOrder}
                onBack={() => setStep('payment-method')}
                isLoading={placeOrder.isPending}
              />
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && (
          <div className="text-center py-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'oklch(0.5 0.18 145 / 0.2)',
                border: '2px solid oklch(0.5 0.18 145)',
                boxShadow: '0 0 30px oklch(0.5 0.18 145 / 0.4)',
              }}
            >
              <Check size={36} style={{ color: 'oklch(0.5 0.18 145)' }} />
            </div>
            <h2
              className="font-gaming text-2xl font-bold mb-2"
              style={{ color: 'oklch(0.95 0.01 260)' }}
            >
              Order Placed!
            </h2>
            <p className="mb-2" style={{ color: 'oklch(0.6 0.02 260)' }}>
              Your order has been successfully placed.
            </p>
            {orderId !== null && (
              <p
                className="font-gaming text-sm mb-6"
                style={{ color: 'oklch(0.65 0.25 195)' }}
              >
                Order #{orderId.toString()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate({ to: '/order-confirmation', search: { orderId: orderId?.toString() ?? '' } })}
                className="px-6 py-3 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200"
                style={{
                  background: 'oklch(0.72 0.22 35)',
                  color: 'oklch(0.08 0.005 260)',
                  boxShadow: '0 0 20px oklch(0.72 0.22 35 / 0.4)',
                }}
              >
                View Order Details
              </button>
              <button
                onClick={() => navigate({ to: '/' })}
                className="px-6 py-3 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200"
                style={{
                  background: 'oklch(0.18 0.01 260)',
                  color: 'oklch(0.7 0.02 260)',
                  border: '1px solid oklch(0.25 0.015 260)',
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
