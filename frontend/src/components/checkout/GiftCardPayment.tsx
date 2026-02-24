import React, { useState } from 'react';
import { Gift, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface GiftCardPaymentProps {
  amount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export default function GiftCardPayment({ amount, onConfirm, isLoading }: GiftCardPaymentProps) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleValidate = async () => {
    if (!code.trim()) return;
    setValidating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setValidationState(code.length >= 8 ? 'valid' : 'invalid');
    setValidating(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-sm border border-border bg-muted/30">
        <Gift className="w-6 h-6 text-sunset-pink" />
        <div>
          <p className="font-orbitron text-sm font-bold text-foreground">UK Gift Card</p>
          <p className="font-rajdhani text-xs text-muted-foreground">Enter your gift card code below</p>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between p-4 rounded-sm border border-border bg-card">
        <span className="font-rajdhani font-semibold text-muted-foreground">Amount to pay</span>
        <span className="font-orbitron font-bold text-sunset-gold text-lg">
          £{(amount / 100).toFixed(2)}
        </span>
      </div>

      {/* Code input */}
      <div className="space-y-2">
        <label className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Gift Card Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setValidationState('idle'); }}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="flex-1 px-3 py-2 rounded-sm border border-border bg-input text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-sunset-pink focus:ring-1 focus:ring-sunset-pink/30 transition-colors"
          />
          <button
            onClick={handleValidate}
            disabled={!code.trim() || validating}
            className="px-4 py-2 rounded-sm border border-sunset-pink bg-sunset-pink/10 text-sunset-pink font-rajdhani font-semibold text-sm hover:bg-sunset-pink/20 transition-colors disabled:opacity-50"
          >
            {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
          </button>
        </div>

        {/* Validation feedback */}
        {validationState === 'valid' && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-4 h-4" />
            <span className="font-rajdhani text-sm">Gift card validated successfully!</span>
          </div>
        )}
        {validationState === 'invalid' && (
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="w-4 h-4" />
            <span className="font-rajdhani text-sm">Invalid gift card code. Please try again.</span>
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={validationState !== 'valid' || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          'Confirm Order'
        )}
      </button>
    </div>
  );
}
