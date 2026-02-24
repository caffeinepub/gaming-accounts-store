import { useState } from 'react';
import { CreditCard, Calendar, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PayIn3PaymentProps {
  total: bigint;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function PayIn3Payment({ total, onConfirm, onBack, isLoading }: PayIn3PaymentProps) {
  const [agreed, setAgreed] = useState(false);

  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;
  const installment = total / BigInt(3);
  const remainder = total - installment * BigInt(2);

  const today = new Date();
  const date2 = new Date(today);
  date2.setDate(date2.getDate() + 30);
  const date3 = new Date(today);
  date3.setDate(date3.getDate() + 60);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const installments = [
    { label: 'Today', date: formatDate(today), amount: installment, highlight: true },
    { label: '2nd Payment', date: formatDate(date2), amount: installment, highlight: false },
    { label: '3rd Payment', date: formatDate(date3), amount: remainder, highlight: false },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'oklch(0.08 0.005 260)',
          border: '1px solid oklch(0.65 0.28 330 / 0.4)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={28} style={{ color: 'oklch(0.65 0.28 330)' }} />
          <div>
            <p className="font-heading font-bold" style={{ color: 'oklch(0.9 0.01 260)' }}>
              Pay in 3 Installments
            </p>
            <p className="text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>
              Split your payment into 3 interest-free installments
            </p>
          </div>
        </div>

        {/* Total */}
        <div
          className="p-3 rounded-lg text-center mb-4"
          style={{
            background: 'oklch(0.65 0.28 330 / 0.1)',
            border: '1px solid oklch(0.65 0.28 330 / 0.3)',
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'oklch(0.55 0.02 260)' }}>Total order value</p>
          <p className="font-gaming text-2xl" style={{ color: 'oklch(0.65 0.28 330)' }}>
            {formatPrice(total)}
          </p>
        </div>

        {/* Installment schedule */}
        <div className="flex flex-col gap-2">
          {installments.map(({ label, date, amount, highlight }, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: highlight
                  ? 'oklch(0.65 0.28 330 / 0.15)'
                  : 'oklch(0.12 0.008 260)',
                border: `1px solid ${highlight ? 'oklch(0.65 0.28 330 / 0.5)' : 'oklch(0.2 0.01 260)'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <Calendar
                  size={14}
                  style={{ color: highlight ? 'oklch(0.65 0.28 330)' : 'oklch(0.45 0.02 260)' }}
                />
                <div>
                  <p
                    className="font-heading font-semibold text-sm"
                    style={{ color: highlight ? 'oklch(0.65 0.28 330)' : 'oklch(0.75 0.02 260)' }}
                  >
                    {label}
                  </p>
                  <p className="text-xs" style={{ color: 'oklch(0.45 0.02 260)' }}>
                    {date}
                  </p>
                </div>
              </div>
              <span
                className="font-gaming text-base"
                style={{ color: highlight ? 'oklch(0.65 0.28 330)' : 'oklch(0.72 0.22 35)' }}
              >
                {formatPrice(amount)}
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-3 p-2 rounded text-xs text-center"
          style={{
            background: 'oklch(0.5 0.18 145 / 0.1)',
            color: 'oklch(0.5 0.18 145)',
          }}
        >
          ✓ 0% interest — No hidden fees
        </div>
      </div>

      {/* Agreement */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="pay3-agree"
          checked={agreed}
          onCheckedChange={v => setAgreed(!!v)}
          className="mt-0.5"
        />
        <Label htmlFor="pay3-agree" className="text-sm cursor-pointer" style={{ color: 'oklch(0.6 0.02 260)' }}>
          I agree to the Pay in 3 installment plan. The first payment of {formatPrice(installment)} will be
          charged today, with subsequent payments on the dates shown above.
        </Label>
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
          disabled={!agreed || isLoading}
          className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: agreed && !isLoading ? '0 0 20px oklch(0.72 0.22 35 / 0.4)' : 'none',
          }}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
