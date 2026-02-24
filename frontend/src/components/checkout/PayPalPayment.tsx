import { useState } from 'react';
import { SiPaypal } from 'react-icons/si';
import { ExternalLink, Loader2 } from 'lucide-react';

interface PayPalPaymentProps {
  total: bigint;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function PayPalPayment({ total, onConfirm, onBack, isLoading }: PayPalPaymentProps) {
  const [simulating, setSimulating] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulated(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* PayPal branding */}
      <div
        className="rounded-xl p-6 flex flex-col items-center gap-4"
        style={{
          background: 'oklch(0.08 0.005 260)',
          border: '1px solid oklch(0.65 0.18 240 / 0.4)',
        }}
      >
        <SiPaypal size={48} style={{ color: 'oklch(0.65 0.18 240)' }} />
        <div className="text-center">
          <p className="font-heading font-bold text-lg" style={{ color: 'oklch(0.9 0.01 260)' }}>
            Pay with PayPal
          </p>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 260)' }}>
            You will be redirected to PayPal to complete your payment
          </p>
        </div>
        <div
          className="px-6 py-3 rounded-lg text-center"
          style={{
            background: 'oklch(0.65 0.18 240 / 0.1)',
            border: '1px solid oklch(0.65 0.18 240 / 0.3)',
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'oklch(0.55 0.02 260)' }}>Amount to pay</p>
          <p className="font-gaming text-2xl" style={{ color: 'oklch(0.65 0.18 240)' }}>
            {formatPrice(total)}
          </p>
        </div>

        {!simulated ? (
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200 disabled:opacity-60"
            style={{
              background: 'oklch(0.65 0.18 240)',
              color: 'white',
            }}
          >
            {simulating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Redirecting to PayPal...
              </>
            ) : (
              <>
                <ExternalLink size={14} />
                Continue to PayPal
              </>
            )}
          </button>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{
              background: 'oklch(0.5 0.18 145 / 0.15)',
              color: 'oklch(0.5 0.18 145)',
              border: '1px solid oklch(0.5 0.18 145 / 0.3)',
            }}
          >
            ✓ PayPal payment authorized
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'oklch(0.18 0.01 260)',
            color: 'oklch(0.7 0.02 260)',
            border: '1px solid oklch(0.25 0.015 260)',
          }}
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!simulated || isLoading}
          className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: simulated && !isLoading ? '0 0 20px oklch(0.72 0.22 35 / 0.4)' : 'none',
          }}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
