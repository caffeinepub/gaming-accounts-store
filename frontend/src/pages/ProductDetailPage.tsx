import React from 'react';
import { ArrowLeft, ShoppingCart, Tag, Package } from 'lucide-react';
import type { Product, ProductCategory } from '../backend';

interface ProductDetailPageProps {
  product: Product;
  category?: ProductCategory;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
}

export default function ProductDetailPage({ product, category, onAddToCart, onBack }: ProductDetailPageProps) {
  const price = Number(product.price);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-sunset-gold transition-colors mb-6 font-rajdhani font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header card */}
            <div className="rounded-sm border border-border bg-card overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-sunset-orange via-sunset-pink to-sunset-purple" />
              <div className="p-6">
                {category && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Tag className="w-3.5 h-3.5 text-sunset-gold" />
                    <span className="font-rajdhani text-xs font-semibold text-sunset-gold uppercase tracking-wider">
                      {category.name}
                    </span>
                  </div>
                )}
                <h1 className="font-orbitron text-2xl font-black text-foreground mb-2">
                  {product.gameName}
                </h1>
                <p className="font-rajdhani text-muted-foreground">
                  {product.title}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-sm border border-border bg-card p-6">
              <h2 className="font-orbitron text-sm font-bold text-sunset-gold uppercase tracking-wider mb-3">
                Description
              </h2>
              <p className="font-rajdhani text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* What's included */}
            <div className="rounded-sm border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-sunset-orange" />
                <h2 className="font-orbitron text-sm font-bold text-sunset-orange uppercase tracking-wider">
                  What's Included
                </h2>
              </div>
              <p className="font-rajdhani text-muted-foreground text-sm leading-relaxed">
                Full account access with credentials delivered instantly after purchase. Includes all items and progress as described.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-sm border border-border bg-card overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-sunset-gold to-sunset-orange" />
              <div className="p-6 space-y-5">
                {/* Price */}
                <div>
                  <p className="font-rajdhani text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                  <p className="font-orbitron text-3xl font-black text-sunset-gold">
                    £{(price / 100).toFixed(2)}
                  </p>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${product.available ? 'bg-success' : 'bg-destructive'}`} />
                  <span className="font-rajdhani text-sm font-semibold text-muted-foreground">
                    {product.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Add to cart */}
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!product.available}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>

                {/* Info */}
                <div className="space-y-2 pt-2 border-t border-border">
                  {['Instant delivery', 'Secure transaction', '24/7 support'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sunset-gold" />
                      <span className="font-rajdhani text-xs text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
