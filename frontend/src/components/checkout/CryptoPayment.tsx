import { useState } from 'react';
import { Bitcoin, Copy, Check, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CryptoPaymentProps {
  total: bigint;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const MOCK_WALLET = '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf Na';
const BTC_RATE = 0.000015;
const ETH_RATE = 0.00025;

export default function CryptoPayment({ total, onConfirm, onBack, isLoading }: CryptoPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH'>('BTC');

  const gbpAmount = Number(total) / 100;
  const cryptoAmount = selectedCrypto === 'BTC'
    ? (gbpAmount * BTC_RATE).toFixed(8)
    : (gbpAmount * ETH_RATE).toFixed(6);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_WALLET).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Crypto selector */}
      <div className="flex gap-2">
        {(['BTC', 'ETH'] as const).map(c => (
          <button
            key={c}
            onClick={() => setSelectedCrypto(c)}
            className="flex-1 py-2 rounded-lg font-gaming text-sm transition-all duration-200"
            style={{
              background: selectedCrypto === c ? 'oklch(0.72 0.22 50 / 0.2)' : 'oklch(0.15 0.01 260)',
              border: `1px solid ${selectedCrypto === c ? 'oklch(0.72 0.22 50)' : 'oklch(0.25 0.015 260)'}`,
              color: selectedCrypto === c ? 'oklch(0.72 0.22 50)' : 'oklch(0.55 0.02 260)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Payment details */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{
          background: 'oklch(0.08 0.005 260)',
          border: '1px solid oklch(0.72 0.22 50 / 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <Bitcoin size={28} style={{ color: 'oklch(0.72 0.22 50)' }} />
          <div>
            <p className="font-heading font-bold" style={{ color: 'oklch(0.9 0.01 260)' }}>
              Send {selectedCrypto}
            </p>
            <p className="text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>
              Send exactly the amount below to the wallet address
            </p>
          </div>
        </div>

        {/* Amount */}
        <div
          className="p-3 rounded-lg text-center"
          style={{
            background: 'oklch(0.72 0.22 50 / 0.1)',
            border: '1px solid oklch(0.72 0.22 50 / 0.3)',
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'oklch(0.55 0.02 260)' }}>Amount to send</p>
          <p className="font-gaming text-xl" style={{ color: 'oklch(0.72 0.22 50)' }}>
            {cryptoAmount} {selectedCrypto}
          </p>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.02 260)' }}>
            ≈ £{(Number(total) / 100).toFixed(2)} GBP
          </p>
        </div>

        {/* Wallet address */}
        <div>
          <p className="text-xs mb-1.5 font-heading font-semibold uppercase tracking-wide" style={{ color: 'oklch(0.55 0.02 260)' }}>
            Wallet Address
          </p>
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{
              background: 'oklch(0.12 0.008 260)',
              border: '1px solid oklch(0.25 0.015 260)',
            }}
          >
            <code className="flex-1 text-xs break-all" style={{ color: 'oklch(0.65 0.25 195)' }}>
              {MOCK_WALLET}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 rounded transition-colors"
              style={{ color: copied ? 'oklch(0.5 0.18 145)' : 'oklch(0.55 0.02 260)' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* QR placeholder */}
        <div
          className="w-32 h-32 mx-auto rounded-lg flex items-center justify-center"
          style={{
            background: 'oklch(0.18 0.01 260)',
            border: '1px solid oklch(0.25 0.015 260)',
          }}
        >
          <div className="grid grid-cols-5 gap-0.5 p-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{
                  background: Math.random() > 0.5 ? 'oklch(0.9 0.01 260)' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-center" style={{ color: 'oklch(0.4 0.02 260)' }}>
          Scan QR code with your crypto wallet
        </p>
      </div>

      {/* Confirmation checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="crypto-confirm"
          checked={confirmed}
          onCheckedChange={v => setConfirmed(!!v)}
          className="mt-0.5"
        />
        <Label htmlFor="crypto-confirm" className="text-sm cursor-pointer" style={{ color: 'oklch(0.6 0.02 260)' }}>
          I have sent the exact amount of {cryptoAmount} {selectedCrypto} to the wallet address above
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
          disabled={!confirmed || isLoading}
          className="flex-1 py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: confirmed && !isLoading ? '0 0 20px oklch(0.72 0.22 35 / 0.4)' : 'none',
          }}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
