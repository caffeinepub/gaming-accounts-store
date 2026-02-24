import React, { useState } from 'react';
import { Copy, CheckCircle, Loader2 } from 'lucide-react';

interface CryptoPaymentProps {
  amount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const MOCK_BTC_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf';
const MOCK_ETH_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9B8e4e3f1a2b3';
const BTC_RATE = 0.000015;
const ETH_RATE = 0.00045;

export default function CryptoPayment({ amount, onConfirm, isLoading }: CryptoPaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH'>('BTC');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const address = selectedCurrency === 'BTC' ? MOCK_BTC_ADDRESS : MOCK_ETH_ADDRESS;
  const cryptoAmount = selectedCurrency === 'BTC'
    ? ((amount / 100) * BTC_RATE).toFixed(8)
    : ((amount / 100) * ETH_RATE).toFixed(6);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Currency selector */}
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

      {/* Amount */}
      <div className="p-4 rounded-sm border border-border bg-card space-y-2">
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">GBP Amount</span>
          <span className="font-orbitron font-bold text-sunset-gold">£{(amount / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">{selectedCurrency} Amount</span>
          <span className="font-orbitron font-bold text-sunset-orange">{cryptoAmount} {selectedCurrency}</span>
        </div>
      </div>

      {/* Wallet address */}
      <div className="space-y-2">
        <p className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Send to address
        </p>
        <div className="flex items-center gap-2 p-3 rounded-sm border border-border bg-muted/30">
          <code className="flex-1 font-mono text-xs text-sunset-gold break-all">
            {address}
          </code>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors flex-shrink-0"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QR placeholder */}
      <div className="flex items-center justify-center p-6 rounded-sm border border-dashed border-border bg-muted/20">
        <div className="text-center space-y-1">
          <div className="w-24 h-24 mx-auto bg-muted rounded-sm flex items-center justify-center">
            <span className="font-rajdhani text-xs text-muted-foreground">QR Code</span>
          </div>
          <p className="font-rajdhani text-xs text-muted-foreground">Scan to pay</p>
        </div>
      </div>

      {/* Confirm checkbox */}
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
            Placing Order...
          </>
        ) : (
          'Confirm Payment'
        )}
      </button>
    </div>
  );
}
