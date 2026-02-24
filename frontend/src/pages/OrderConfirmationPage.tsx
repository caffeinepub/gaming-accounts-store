import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { useGetOrderById } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { PaymentMethod } from '../backend';

const PAYMENT_LABELS: Record<string, string> = {
  [PaymentMethod.paypal]: 'PayPal',
  [PaymentMethod.cryptocurrency]: 'Cryptocurrency',
  [PaymentMethod.ukGiftCard]: 'UK Gift Card',
  [PaymentMethod.payIn3Installments]: 'Pay in 3 Installments',
};

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const search = useSearch({ strict: false }) as { orderId?: string };
  const orderIdStr = search?.orderId ?? '';
  const orderId = orderIdStr ? BigInt(orderIdStr) : BigInt(0);

  const { data: order, isLoading } = useGetOrderById(orderId);

  if (!identity) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="font-heading text-xl mb-4" style={{ color: 'oklch(0.55 0.02 260)' }}>
          Please login to view your order
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 mb-6 text-sm transition-colors"
        style={{ color: 'oklch(0.55 0.02 260)' }}
      >
        <ArrowLeft size={14} />
        Back to Store
      </button>

      {/* Success header */}
      <div
        className="rounded-xl p-8 text-center mb-6"
        style={{
          background: 'linear-gradient(135deg, oklch(0.13 0.008 260), oklch(0.15 0.03 145))',
          border: '1px solid oklch(0.5 0.18 145 / 0.4)',
          boxShadow: '0 0 40px oklch(0.5 0.18 145 / 0.1)',
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'oklch(0.5 0.18 145 / 0.2)',
            border: '2px solid oklch(0.5 0.18 145)',
            boxShadow: '0 0 30px oklch(0.5 0.18 145 / 0.4)',
          }}
        >
          <CheckCircle size={40} style={{ color: 'oklch(0.5 0.18 145)' }} />
        </div>
        <h1
          className="font-gaming text-3xl font-bold mb-2"
          style={{
            color: 'oklch(0.95 0.01 260)',
            textShadow: '0 0 20px oklch(0.5 0.18 145 / 0.4)',
          }}
        >
          Order Confirmed!
        </h1>
        <p style={{ color: 'oklch(0.6 0.02 260)' }}>
          Thank you for your purchase. Your gaming account is on its way!
        </p>
        {orderId > BigInt(0) && (
          <div
            className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-gaming"
            style={{
              background: 'oklch(0.65 0.25 195 / 0.15)',
              color: 'oklch(0.65 0.25 195)',
              border: '1px solid oklch(0.65 0.25 195 / 0.3)',
            }}
          >
            Order #{orderId.toString()}
          </div>
        )}
      </div>

      {/* Order details */}
      {isLoading ? (
        <div
          className="rounded-xl p-6 animate-pulse"
          style={{ background: 'oklch(0.13 0.008 260)', border: '1px solid oklch(0.22 0.012 260)' }}
        >
          <div className="h-4 rounded mb-3" style={{ background: 'oklch(0.18 0.01 260)', width: '60%' }} />
          <div className="h-4 rounded mb-3" style={{ background: 'oklch(0.18 0.01 260)', width: '40%' }} />
          <div className="h-4 rounded" style={{ background: 'oklch(0.18 0.01 260)', width: '50%' }} />
        </div>
      ) : order ? (
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: 'oklch(0.13 0.008 260)',
            border: '1px solid oklch(0.22 0.012 260)',
          }}
        >
          <h2
            className="font-heading text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: 'oklch(0.85 0.01 260)' }}
          >
            <Package size={18} style={{ color: 'oklch(0.72 0.22 35)' }} />
            Order Details
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'oklch(0.2 0.01 260)' }}>
              <span className="text-sm" style={{ color: 'oklch(0.55 0.02 260)' }}>Order ID</span>
              <span className="font-gaming text-sm" style={{ color: 'oklch(0.65 0.25 195)' }}>
                #{orderId.toString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'oklch(0.2 0.01 260)' }}>
              <span className="text-sm" style={{ color: 'oklch(0.55 0.02 260)' }}>Product ID</span>
              <span className="font-gaming text-sm" style={{ color: 'oklch(0.9 0.01 260)' }}>
                #{order.productId.toString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'oklch(0.2 0.01 260)' }}>
              <span className="text-sm" style={{ color: 'oklch(0.55 0.02 260)' }}>Payment Method</span>
              <span
                className="text-sm font-heading font-semibold px-2 py-0.5 rounded"
                style={{
                  background: 'oklch(0.72 0.22 35 / 0.15)',
                  color: 'oklch(0.72 0.22 35)',
                }}
              >
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm" style={{ color: 'oklch(0.55 0.02 260)' }}>Status</span>
              <span
                className="text-sm font-gaming px-2 py-0.5 rounded"
                style={{
                  background: 'oklch(0.5 0.18 145 / 0.15)',
                  color: 'oklch(0.5 0.18 145)',
                }}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* What's next */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: 'oklch(0.13 0.008 260)',
          border: '1px solid oklch(0.22 0.012 260)',
        }}
      >
        <h2
          className="font-heading text-lg font-bold mb-4"
          style={{ color: 'oklch(0.85 0.01 260)' }}
        >
          What Happens Next?
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { step: '1', text: 'Your payment is being processed and verified.' },
            { step: '2', text: 'Account credentials will be delivered to your profile.' },
            { step: '3', text: 'You can access your account details from your order history.' },
          ].map(({ step: s, text }) => (
            <div key={s} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-gaming mt-0.5"
                style={{
                  background: 'oklch(0.72 0.22 35 / 0.2)',
                  color: 'oklch(0.72 0.22 35)',
                  border: '1px solid oklch(0.72 0.22 35 / 0.4)',
                }}
              >
                {s}
              </div>
              <p className="text-sm" style={{ color: 'oklch(0.6 0.02 260)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: '0 0 20px oklch(0.72 0.22 35 / 0.4)',
          }}
        >
          <ShoppingBag size={14} />
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
