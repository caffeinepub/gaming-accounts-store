import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Loader2 } from 'lucide-react';

interface PayPalPaymentProps {
  amount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export default function PayPalPayment({ amount, onConfirm, isLoading }: PayPalPaymentProps) {
  const [redirected, setRedirected] = useState(false);

  const handleRedirect = () => {
    setRedirected(true);
  };

  return (
    <div className="space-y-5">
      {/* PayPal branding */}
      <div className="flex items-center justify-center p-6 rounded-sm border border-border bg-muted/30">
        <div className="text-center space-y-2">
          <div className="font-orbitron text-2xl font-bold text-sunset-gold">PayPal</div>
          <p className="font-rajdhani text-muted-foreground text-sm">Secure payment via PayPal</p>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between p-4 rounded-sm border border-border bg-card">
        <span className="font-rajdhani font-semibold text-muted-foreground">Amount to pay</span>
        <span className="font-orbitron font-bold text-sunset-gold text-lg">
          £{(amount / 100).toFixed(2)}
        </span>
      </div>

      {/* Steps */}
      {!redirected ? (
        <div className="space-y-3">
          <p className="font-rajdhani text-sm text-muted-foreground">
            Click below to be redirected to PayPal to complete your payment securely.
          </p>
          <button
            onClick={handleRedirect}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-sunset-gold text-background font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Continue to PayPal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-sm border border-success/30 bg-success/10">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <p className="font-rajdhani text-sm text-success">
              Payment authorised on PayPal. Click below to confirm your order.
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
                Placing Order...
              </>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
