import { useState } from 'react';
import { Gift, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GiftCardPaymentProps {
  total: bigint;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function GiftCardPayment({ total, onConfirm, onBack, isLoading }: GiftCardPaymentProps) {
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  const handleApply = () => {
    if (!code.trim()) {
      setError('Please enter a gift card code');
      return;
    }
    setError('');
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      if (code.trim().length >= 4) {
        setApplied(true);
      } else {
        setError('Invalid gift card code. Please check and try again.');
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Gift card visual */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, oklch(0.13 0.008 260), oklch(0.15 0.04 195))',
          border: '1px solid oklch(0.65 0.25 195 / 0.4)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Gift size={28} style={{ color: 'oklch(0.65 0.25 195)' }} />
          <div>
            <p className="font-heading font-bold" style={{ color: 'oklch(0.9 0.01 260)' }}>
              UK Gift Card
            </p>
            <p className="text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>
              Enter your gift card code to redeem
            </p>
          </div>
        </div>

        <div
          className="p-3 rounded-lg text-center mb-4"
          style={{
            background: 'oklch(0.65 0.25 195 / 0.1)',
            border: '1px solid oklch(0.65 0.25 195 / 0.3)',
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'oklch(0.55 0.02 260)' }}>Amount due</p>
          <p className="font-gaming text-2xl" style={{ color: 'oklch(0.65 0.25 195)' }}>
            {formatPrice(total)}
          </p>
        </div>

        {!applied ? (
          <div className="flex flex-col gap-3">
            <div>
              <Label
                htmlFor="gift-code"
                className="text-xs font-heading font-semibold uppercase tracking-wide mb-1.5 block"
                style={{ color: 'oklch(0.55 0.02 260)' }}
              >
                Gift Card Code
              </Label>
              <Input
                id="gift-code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="font-gaming tracking-widest text-center"
                style={{
                  background: 'oklch(0.1 0.005 260)',
                  border: `1px solid ${error ? 'oklch(0.6 0.22 25)' : 'oklch(0.3 0.015 260)'}`,
                  color: 'oklch(0.9 0.01 260)',
                }}
                onKeyDown={e => e.key === 'Enter' && handleApply()}
              />
              {error && (
                <p className="text-xs mt-1" style={{ color: 'oklch(0.6 0.22 25)' }}>
                  {error}
                </p>
              )}
            </div>
            <button
              onClick={handleApply}
              disabled={applying || !code.trim()}
              className="w-full py-2.5 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
              style={{
                background: 'oklch(0.65 0.25 195)',
                color: 'oklch(0.08 0.005 260)',
              }}
            >
              {applying ? <Loader2 size={14} className="animate-spin" /> : null}
              {applying ? 'Validating...' : 'Apply Gift Card'}
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{
              background: 'oklch(0.5 0.18 145 / 0.15)',
              border: '1px solid oklch(0.5 0.18 145 / 0.4)',
            }}
          >
            <CheckCircle size={20} style={{ color: 'oklch(0.5 0.18 145)' }} />
            <div>
              <p className="font-heading font-semibold text-sm" style={{ color: 'oklch(0.5 0.18 145)' }}>
                Gift card applied!
              </p>
              <p className="text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>
                Code: {code} — {formatPrice(total)} covered
              </p>
            </div>
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
          disabled={!applied || isLoading}
          className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: applied && !isLoading ? '0 0 20px oklch(0.72 0.22 35 / 0.4)' : 'none',
          }}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
