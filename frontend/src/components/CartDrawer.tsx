import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, totalPrice } = useCart();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
        style={{
          background: 'oklch(0.12 0.008 260)',
          borderColor: 'oklch(0.25 0.015 260)',
        }}
      >
        <SheetHeader className="px-6 py-4 border-b" style={{ borderColor: 'oklch(0.25 0.015 260)' }}>
          <SheetTitle className="font-heading text-xl tracking-wide flex items-center gap-2" style={{ color: 'oklch(0.95 0.01 260)' }}>
            <ShoppingBag size={20} style={{ color: 'oklch(0.72 0.22 35)' }} />
            Your Cart
            {items.length > 0 && (
              <span
                className="ml-auto text-sm font-gaming px-2 py-0.5 rounded"
                style={{ background: 'oklch(0.72 0.22 35 / 0.2)', color: 'oklch(0.72 0.22 35)' }}
              >
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-gaming px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <ShoppingBag size={40} style={{ color: 'oklch(0.35 0.015 260)' }} />
              <p className="font-heading text-lg" style={{ color: 'oklch(0.45 0.02 260)' }}>
                Your cart is empty
              </p>
              <p className="text-sm text-center" style={{ color: 'oklch(0.35 0.015 260)' }}>
                Browse the store and add gaming accounts
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id.toString()}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: 'oklch(0.15 0.01 260)', border: '1px solid oklch(0.22 0.012 260)' }}
                >
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: 'oklch(0.72 0.22 35 / 0.15)' }}
                  >
                    <span className="text-lg">🎮</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm truncate" style={{ color: 'oklch(0.9 0.01 260)' }}>
                      {product.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.02 260)' }}>
                      {product.gameName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs" style={{ color: 'oklch(0.55 0.02 260)' }}>
                        Qty: {quantity}
                      </span>
                      <span className="font-gaming text-sm" style={{ color: 'oklch(0.72 0.22 35)' }}>
                        {formatPrice(product.price * BigInt(quantity))}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1.5 rounded transition-colors hover:bg-red-500/20"
                    style={{ color: 'oklch(0.55 0.02 260)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t" style={{ borderColor: 'oklch(0.25 0.015 260)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading font-semibold" style={{ color: 'oklch(0.7 0.02 260)' }}>
                Total
              </span>
              <span className="font-gaming text-xl" style={{ color: 'oklch(0.72 0.22 35)' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            {!isAuthenticated && (
              <p className="text-xs mb-3 text-center" style={{ color: 'oklch(0.55 0.02 260)' }}>
                Please login to proceed to checkout
              </p>
            )}
            <button
              onClick={onCheckout}
              disabled={!isAuthenticated}
              className="w-full py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'oklch(0.72 0.22 35)',
                color: 'oklch(0.08 0.005 260)',
                boxShadow: isAuthenticated ? '0 0 20px oklch(0.72 0.22 35 / 0.4)' : 'none',
              }}
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
