import { PaymentMethod } from '../../backend';
import { SiPaypal } from 'react-icons/si';
import { Bitcoin, CreditCard, Gift } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const METHODS = [
  {
    id: PaymentMethod.paypal,
    label: 'PayPal',
    description: 'Pay securely with your PayPal account',
    icon: SiPaypal,
    color: 'oklch(0.65 0.18 240)',
  },
  {
    id: PaymentMethod.cryptocurrency,
    label: 'Cryptocurrency',
    description: 'Pay with BTC, ETH, or other crypto',
    icon: Bitcoin,
    color: 'oklch(0.72 0.22 50)',
  },
  {
    id: PaymentMethod.ukGiftCard,
    label: 'UK Gift Card',
    description: 'Redeem a UK gift card code',
    icon: Gift,
    color: 'oklch(0.65 0.25 195)',
  },
  {
    id: PaymentMethod.payIn3Installments,
    label: 'Pay in 3',
    description: 'Split into 3 interest-free payments',
    icon: CreditCard,
    color: 'oklch(0.65 0.28 330)',
  },
];

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {METHODS.map(({ id, label, description, icon: Icon, color }) => {
        const isSelected = selected === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex items-center gap-4 p-4 rounded-lg text-left transition-all duration-200 w-full"
            style={{
              background: isSelected ? `${color.replace(')', ' / 0.1)')}` : 'oklch(0.15 0.01 260)',
              border: `1px solid ${isSelected ? color : 'oklch(0.25 0.015 260)'}`,
              boxShadow: isSelected ? `0 0 15px ${color.replace(')', ' / 0.2)')}` : 'none',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isSelected ? `${color.replace(')', ' / 0.2)')}` : 'oklch(0.2 0.01 260)',
              }}
            >
              <Icon size={20} style={{ color: isSelected ? color : 'oklch(0.55 0.02 260)' }} />
            </div>
            <div className="flex-1">
              <p
                className="font-heading font-bold text-sm"
                style={{ color: isSelected ? color : 'oklch(0.85 0.01 260)' }}
              >
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(0.5 0.02 260)' }}>
                {description}
              </p>
            </div>
            <div
              className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-200"
              style={{
                borderColor: isSelected ? color : 'oklch(0.35 0.015 260)',
                background: isSelected ? color : 'transparent',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
