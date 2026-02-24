import React from 'react';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import type { Product } from '../backend';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (productId: bigint) => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onCheckout }: CartDrawerProps) {
  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sunset-gold" />
            <h2 className="font-orbitron text-base font-bold text-foreground">Cart</h2>
            {cartItems.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-sunset-orange text-white text-xs font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-pink hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-rajdhani text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id.toString()}
                className="flex items-start gap-3 p-3 rounded-sm border border-border bg-background hover:border-sunset-gold/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-orbitron text-xs font-bold text-foreground truncate">
                    {item.product.gameName}
                  </p>
                  <p className="font-rajdhani text-xs text-muted-foreground truncate mt-0.5">
                    {item.product.title}
                  </p>
                  <p className="font-orbitron text-sm font-bold text-sunset-gold mt-1">
                    £{(Number(item.product.price) / 100).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-pink hover:bg-muted transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-rajdhani font-semibold text-muted-foreground">Total</span>
              <span className="font-orbitron font-bold text-sunset-gold text-lg">
                £{(total / 100).toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow"
            >
              Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
