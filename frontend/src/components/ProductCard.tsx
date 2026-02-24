import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, categoryName, onAddToCart, onViewDetails }: ProductCardProps) {
  const price = Number(product.price);

  return (
    <div
      className="group relative rounded-sm border border-border bg-card hover:border-sunset-gold/50 transition-all duration-300 hover:shadow-sunset cursor-pointer overflow-hidden"
      onClick={() => onViewDetails(product)}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-sunset-orange via-sunset-pink to-sunset-purple" />

      <div className="p-5">
        {/* Category badge */}
        {categoryName && (
          <div className="flex items-center gap-1 mb-3">
            <Tag className="w-3 h-3 text-sunset-gold" />
            <span className="text-xs font-rajdhani font-semibold text-sunset-gold uppercase tracking-wider">
              {categoryName}
            </span>
          </div>
        )}

        {/* Game name */}
        <h3 className="font-orbitron text-sm font-bold text-foreground mb-1 group-hover:text-sunset-gold transition-colors line-clamp-1">
          {product.gameName}
        </h3>

        {/* Title */}
        <p className="font-rajdhani text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.title}
        </p>

        {/* Description */}
        <p className="font-rajdhani text-muted-foreground/70 text-xs mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-orbitron text-lg font-bold text-sunset-gold">
              £{(price / 100).toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white text-xs font-rajdhani font-semibold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
