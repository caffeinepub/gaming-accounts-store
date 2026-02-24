import React, { useState, useEffect } from 'react';
import { Save, Loader2, Bitcoin, Wallet, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import {
  useStoreSettings,
  useUpdatePaypalWalletAddress,
  useUpdateBitcoinWalletAddress,
  useUpdateEthereumWalletAddress,
} from '../../hooks/useQueries';

interface WalletFieldProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  accentClass: string;
}

function WalletField({
  label,
  icon,
  placeholder,
  value,
  onChange,
  onSave,
  isSaving,
  accentClass,
}: WalletFieldProps) {
  return (
    <div className="p-5 rounded-sm border border-border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <span className={accentClass}>{icon}</span>
        <h3 className="font-orbitron text-sm font-bold text-foreground">{label}</h3>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-sm border border-border bg-background text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold transition-colors"
        />
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm font-rajdhani font-bold text-sm uppercase tracking-wider text-white transition-all disabled:opacity-50 ${accentClass.includes('orange') ? 'bg-sunset-orange hover:bg-sunset-orange/80' : accentClass.includes('gold') ? 'bg-sunset-gold hover:bg-sunset-gold/80' : 'bg-sunset-pink hover:bg-sunset-pink/80'}`}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save
        </button>
      </div>
    </div>
  );
}

export default function StoreSettingsManager() {
  const { data: settings, isLoading } = useStoreSettings();

  const [paypalAddress, setPaypalAddress] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [ethereumAddress, setEthereumAddress] = useState('');

  const updatePaypal = useUpdatePaypalWalletAddress();
  const updateBitcoin = useUpdateBitcoinWalletAddress();
  const updateEthereum = useUpdateEthereumWalletAddress();

  // Pre-populate fields when settings load
  useEffect(() => {
    if (settings) {
      setPaypalAddress(settings.paypalWalletAddress);
      setBitcoinAddress(settings.bitcoinWalletAddress);
      setEthereumAddress(settings.ethereumWalletAddress);
    }
  }, [settings]);

  const handleSavePaypal = async () => {
    try {
      await updatePaypal.mutateAsync(paypalAddress);
      toast.success('PayPal wallet address saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save PayPal address');
    }
  };

  const handleSaveBitcoin = async () => {
    try {
      await updateBitcoin.mutateAsync(bitcoinAddress);
      toast.success('Bitcoin wallet address saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Bitcoin address');
    }
  };

  const handleSaveEthereum = async () => {
    try {
      await updateEthereum.mutateAsync(ethereumAddress);
      toast.success('Ethereum wallet address saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Ethereum address');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-sunset-gold" />
        <span className="ml-2 font-rajdhani text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-orbitron text-lg font-black text-foreground mb-1">Store Settings</h2>
        <p className="font-rajdhani text-sm text-muted-foreground">
          Configure payment wallet addresses. These are shown to customers during checkout.
        </p>
      </div>

      <div className="space-y-4">
        <WalletField
          label="PayPal Wallet Address"
          icon={<CreditCard className="w-4 h-4" />}
          placeholder="paypal@example.com or PayPal.me/username"
          value={paypalAddress}
          onChange={setPaypalAddress}
          onSave={handleSavePaypal}
          isSaving={updatePaypal.isPending}
          accentClass="text-sunset-gold"
        />

        <WalletField
          label="Bitcoin (BTC) Wallet Address"
          icon={<Bitcoin className="w-4 h-4" />}
          placeholder="bc1q... or 1A1z... or 3J98..."
          value={bitcoinAddress}
          onChange={setBitcoinAddress}
          onSave={handleSaveBitcoin}
          isSaving={updateBitcoin.isPending}
          accentClass="text-sunset-orange"
        />

        <WalletField
          label="Ethereum (ETH) Wallet Address"
          icon={<Wallet className="w-4 h-4" />}
          placeholder="0x..."
          value={ethereumAddress}
          onChange={setEthereumAddress}
          onSave={handleSaveEthereum}
          isSaving={updateEthereum.isPending}
          accentClass="text-sunset-pink"
        />
      </div>

      <div className="p-4 rounded-sm border border-sunset-gold/20 bg-sunset-gold/5">
        <p className="font-rajdhani text-xs text-muted-foreground">
          <span className="text-sunset-gold font-semibold">Note:</span> Bitcoin and Ethereum addresses will be displayed as QR codes and copyable text to customers during the crypto checkout step. PayPal address is shown during PayPal checkout.
        </p>
      </div>
    </div>
  );
}
