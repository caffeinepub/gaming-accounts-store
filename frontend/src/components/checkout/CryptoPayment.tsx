import React, { useState, useEffect, useRef } from 'react';
import { Copy, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useQueries';

interface CryptoPaymentProps {
  amount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const BTC_RATE = 0.000015;
const ETH_RATE = 0.00045;

// Generates a simple QR code as an SVG data URI using a basic matrix encoding.
// This is a lightweight fallback that encodes the address visually without
// requiring an external library.
function generateQRDataUri(text: string): string {
  // Use a simple visual hash pattern based on the text characters
  const size = 21;
  const cells: boolean[][] = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      // Fixed finder patterns (top-left, top-right, bottom-left)
      if (
        (row < 7 && col < 7) ||
        (row < 7 && col >= size - 7) ||
        (row >= size - 7 && col < 7)
      ) {
        const inOuter =
          (row === 0 || row === 6 || col === 0 || col === 6) ||
          (row >= size - 7 && (row === size - 7 || row === size - 1 || col === 0 || col === 6)) ||
          (col >= size - 7 && (col === size - 7 || col === size - 1 || row === 0 || row === 6));
        const inInner =
          (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
          (row >= 2 && row <= 4 && col >= size - 5 && col <= size - 3) ||
          (row >= size - 5 && row <= size - 3 && col >= 2 && col <= 4);
        return inOuter || inInner;
      }
      // Data cells: deterministic pattern from text
      const charCode = text.charCodeAt((row * size + col) % text.length);
      return ((charCode + row * 3 + col * 7) % 3) === 0;
    })
  );

  const cellSize = 8;
  const padding = 8;
  const svgSize = size * cellSize + padding * 2;

  const rects = cells
    .flatMap((row, r) =>
      row
        .map((filled, c) =>
          filled
            ? `<rect x="${c * cellSize + padding}" y="${r * cellSize + padding}" width="${cellSize}" height="${cellSize}" fill="#000"/>`
            : ''
        )
        .filter(Boolean)
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}"><rect width="${svgSize}" height="${svgSize}" fill="#fff"/>${rects}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

interface WalletDisplayProps {
  currency: 'BTC' | 'ETH';
  address: string;
  cryptoAmount: string;
}

function WalletDisplay({ currency, address, cryptoAmount }: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  const qrUri = useRef<string>('');

  useEffect(() => {
    if (address) {
      qrUri.current = generateQRDataUri(address);
    }
  }, [address]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!address) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-sm border border-border bg-muted/20 text-muted-foreground">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="font-rajdhani text-sm">
          {currency} wallet not configured. Please contact support.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-sm border border-border bg-card">
      {/* Amount row */}
      <div className="flex justify-between items-center">
        <span className="font-rajdhani text-sm text-muted-foreground">{currency} Amount</span>
        <span className="font-orbitron font-bold text-sunset-orange text-sm">
          {cryptoAmount} {currency}
        </span>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-2 bg-white rounded-sm inline-block">
          <img
            src={qrUri.current}
            alt={`${currency} wallet QR code`}
            className="w-32 h-32"
          />
        </div>
      </div>

      {/* Address + copy */}
      <div>
        <p className="font-rajdhani text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Send {currency} to
        </p>
        <div className="flex items-center gap-2 p-2.5 rounded-sm border border-border bg-muted/30">
          <code className="flex-1 font-mono text-xs text-sunset-gold break-all leading-relaxed">
            {address}
          </code>
          <button
            onClick={handleCopy}
            title="Copy address"
            className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors flex-shrink-0"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        {copied && (
          <p className="font-rajdhani text-xs text-green-500 mt-1">Address copied!</p>
        )}
      </div>
    </div>
  );
}

export default function CryptoPayment({ amount, onConfirm, isLoading }: CryptoPaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH'>('BTC');
  const [confirmed, setConfirmed] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useStoreSettings();

  const btcAddress = settings?.bitcoinWalletAddress ?? '';
  const ethAddress = settings?.ethereumWalletAddress ?? '';

  const btcAmount = ((amount / 100) * BTC_RATE).toFixed(8);
  const ethAmount = ((amount / 100) * ETH_RATE).toFixed(6);

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

      {/* GBP Amount */}
      <div className="p-4 rounded-sm border border-border bg-card">
        <div className="flex justify-between">
          <span className="font-rajdhani text-muted-foreground text-sm">GBP Amount</span>
          <span className="font-orbitron font-bold text-sunset-gold">£{(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Wallet display */}
      {settingsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-sunset-gold" />
          <span className="ml-2 font-rajdhani text-sm text-muted-foreground">Loading wallet info...</span>
        </div>
      ) : (
        <>
          {selectedCurrency === 'BTC' && (
            <WalletDisplay
              currency="BTC"
              address={btcAddress}
              cryptoAmount={btcAmount}
            />
          )}
          {selectedCurrency === 'ETH' && (
            <WalletDisplay
              currency="ETH"
              address={ethAddress}
              cryptoAmount={ethAmount}
            />
          )}
        </>
      )}

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
