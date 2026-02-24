import React from 'react';
import { CreditCard, Bitcoin, Gift, Calendar } from 'lucide-react';
import { PaymentMethod } from '../../backend';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const methods = [
  {
    id: PaymentMethod.paypal,
    label: 'PayPal',
    description: 'Pay securely with PayPal',
    icon: CreditCard,
    color: 'text-sunset-gold',
  },
  {
    id: PaymentMethod.cryptocurrency,
    label: 'Cryptocurrency',
    description: 'BTC, ETH and more',
    icon: Bitcoin,
    color: 'text-sunset-orange',
  },
  {
    id: PaymentMethod.ukGiftCard,
    label: 'UK Gift Card',
    description: 'Redeem a gift card code',
    icon: Gift,
    color: 'text-sunset-pink',
  },
  {
    id: PaymentMethod.payIn3Installments,
    label: 'Pay in 3',
    description: 'Split into 3 payments',
    icon: Calendar,
    color: 'text-sunset-purple',
  },
];

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`flex items-start gap-3 p-4 rounded-sm border text-left transition-all ${
              isSelected
                ? 'border-sunset-gold bg-sunset-gold/10 sunset-glow-sm'
                : 'border-border bg-card hover:border-sunset-gold/40 hover:bg-muted'
            }`}
          >
            <div className={`mt-0.5 ${method.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-orbitron text-sm font-bold ${isSelected ? 'text-sunset-gold' : 'text-foreground'}`}>
                {method.label}
              </p>
              <p className="font-rajdhani text-xs text-muted-foreground mt-0.5">
                {method.description}
              </p>
            </div>
            {isSelected && (
              <div className="ml-auto w-4 h-4 rounded-full border-2 border-sunset-gold bg-sunset-gold/30 flex-shrink-0 mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
