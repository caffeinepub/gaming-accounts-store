import React, { useState, useMemo } from 'react';
import { Search, Package, Loader2, AlertCircle } from 'lucide-react';
import { useGetAvailableProducts, useGetAllCategories } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import type { Product } from '../backend';

interface StorefrontPageProps {
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export default function StorefrontPage({ onAddToCart, onViewProduct }: StorefrontPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading: productsLoading, error: productsError } = useGetAvailableProducts();
  const { data: categories } = useGetAllCategories();

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((cat) => map.set(cat.id.toString(), cat.name));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.gameName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-dusk-bg via-background to-dusk-mid opacity-80" />
        <div className="absolute inset-0 bg-[url('/assets/generated/nyc-sunset-skyline.dim_2048x512.png')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black mb-4">
            <span className="game-vault-gradient">Game Vault</span>
          </h1>
          <p className="font-rajdhani text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Premium digital game accounts. Instant delivery. Secure transactions.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-card/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold/30 font-rajdhani transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sunset-gold" />
          </div>
        ) : productsError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="font-rajdhani text-muted-foreground">Failed to load products. Please try again.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package className="w-12 h-12 text-muted-foreground/30" />
            <p className="font-orbitron text-sm text-muted-foreground">
              {searchQuery ? 'No products match your search' : 'No products available'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-orbitron text-lg font-bold text-foreground">
                {searchQuery ? `Results for "${searchQuery}"` : 'Available Games'}
              </h2>
              <span className="font-rajdhani text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  categoryName={categoryMap.get(product.categoryId.toString())}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewProduct}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
