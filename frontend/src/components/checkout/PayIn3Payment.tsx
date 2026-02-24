import React, { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';

interface PayIn3PaymentProps {
  amount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export default function PayIn3Payment({ amount, onConfirm, isLoading }: PayIn3PaymentProps) {
  const [agreed, setAgreed] = useState(false);

  const installment = Math.ceil(amount / 3);
  const today = new Date();
  const dates = [0, 30, 60].map((days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-sm border border-border bg-muted/30">
        <Calendar className="w-6 h-6 text-sunset-purple" />
        <div>
          <p className="font-orbitron text-sm font-bold text-foreground">Pay in 3 Installments</p>
          <p className="font-rajdhani text-xs text-muted-foreground">Split your payment over 3 months</p>
        </div>
      </div>

      {/* Installment schedule */}
      <div className="space-y-2">
        {dates.map((date, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-sm border transition-colors ${
              i === 0
                ? 'border-sunset-purple/50 bg-sunset-purple/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-orbitron font-bold ${
                i === 0 ? 'bg-sunset-purple text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <div>
                <p className="font-rajdhani text-sm font-semibold text-foreground">{date}</p>
                <p className="font-rajdhani text-xs text-muted-foreground">
                  {i === 0 ? 'Due today' : `Due in ${i * 30} days`}
                </p>
              </div>
            </div>
            <span className="font-orbitron font-bold text-sunset-gold">
              £{(installment / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-3 rounded-sm border border-border bg-muted/30">
        <span className="font-rajdhani font-semibold text-muted-foreground">Total</span>
        <span className="font-orbitron font-bold text-sunset-gold">
          £{(amount / 100).toFixed(2)}
        </span>
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-sunset-purple"
        />
        <span className="font-rajdhani text-sm text-muted-foreground">
          I agree to the Pay in 3 terms and authorise the scheduled payments
        </span>
      </label>

      <button
        onClick={onConfirm}
        disabled={!agreed || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-purple to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-purple disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          'Confirm & Pay First Installment'
        )}
      </button>
    </div>
  );
}
