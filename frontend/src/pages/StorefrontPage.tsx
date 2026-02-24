import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Gamepad2, TrendingUp, Package } from 'lucide-react';
import { useGetAllCategories, useGetAvailableProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function StorefrontPage() {
  const { data: categories = [], isLoading: catLoading } = useGetAllCategories();
  const { data: products = [], isLoading: prodLoading } = useGetAvailableProducts();
  const [selectedCategory, setSelectedCategory] = useState<bigint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id.toString(), c.name));
    return map;
  }, [categories]);

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach(p => {
      const key = p.categoryId.toString();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== null) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.gameName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-asc') result.sort((a, b) => Number(a.price - b.price));
    if (sortBy === 'price-desc') result.sort((a, b) => Number(b.price - a.price));
    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const isLoading = catLoading || prodLoading;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: 'linear-gradient(135deg, oklch(0.1 0.005 260) 0%, oklch(0.15 0.03 35) 50%, oklch(0.1 0.005 260) 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, oklch(0.72 0.22 35), transparent 50%), radial-gradient(circle at 80% 50%, oklch(0.65 0.25 195), transparent 50%)',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 size={16} style={{ color: 'oklch(0.72 0.22 35)' }} />
            <span className="font-gaming text-xs tracking-widest uppercase" style={{ color: 'oklch(0.72 0.22 35)' }}>
              Premium Gaming Accounts
            </span>
          </div>
          <h1
            className="font-gaming text-3xl sm:text-5xl font-bold mb-4 leading-tight"
            style={{
              color: 'oklch(0.95 0.01 260)',
              textShadow: '0 0 40px oklch(0.72 0.22 35 / 0.3)',
            }}
          >
            Level Up Your Game
          </h1>
          <p className="text-base max-w-xl mx-auto mb-8" style={{ color: 'oklch(0.6 0.02 260)' }}>
            Buy verified, high-level gaming accounts. Instant delivery, secure transactions.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: Package, label: 'Accounts', value: products.length.toString() },
              { icon: TrendingUp, label: 'Categories', value: categories.length.toString() },
              { icon: Gamepad2, label: 'Games', value: [...new Set(products.map(p => p.gameName))].length.toString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} style={{ color: 'oklch(0.65 0.25 195)' }} />
                <span className="font-gaming text-lg" style={{ color: 'oklch(0.72 0.22 35)' }}>{value}</span>
                <span className="text-xs" style={{ color: 'oklch(0.45 0.02 260)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="font-heading font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'oklch(0.55 0.02 260)' }}>
                Categories
              </h2>
              {catLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" style={{ background: 'oklch(0.18 0.01 260)' }} />)}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-full text-left p-4 rounded-lg transition-all duration-200"
                    style={{
                      background: selectedCategory === null ? 'oklch(0.72 0.22 35 / 0.15)' : 'oklch(0.13 0.008 260)',
                      border: `1px solid ${selectedCategory === null ? 'oklch(0.72 0.22 35)' : 'oklch(0.22 0.012 260)'}`,
                    }}
                  >
                    <span className="font-heading font-bold text-sm" style={{ color: selectedCategory === null ? 'oklch(0.72 0.22 35)' : 'oklch(0.85 0.01 260)' }}>
                      All Games
                    </span>
                    <span className="block text-xs mt-0.5" style={{ color: 'oklch(0.45 0.02 260)' }}>
                      {products.length} accounts
                    </span>
                  </button>
                  {categories.map(cat => (
                    <CategoryCard
                      key={cat.id.toString()}
                      category={cat}
                      productCount={productCountByCategory.get(cat.id.toString()) || 0}
                      isSelected={selectedCategory === cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    />
                  ))}
                  {categories.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: 'oklch(0.35 0.015 260)' }}>
                      No categories yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.45 0.02 260)' }} />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: 'oklch(0.15 0.01 260)',
                    border: '1px solid oklch(0.25 0.015 260)',
                    color: 'oklch(0.9 0.01 260)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'oklch(0.72 0.22 35)')}
                  onBlur={e => (e.target.style.borderColor = 'oklch(0.25 0.015 260)')}
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} style={{ color: 'oklch(0.45 0.02 260)' }} />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: 'oklch(0.15 0.01 260)',
                    border: '1px solid oklch(0.25 0.015 260)',
                    color: 'oklch(0.9 0.01 260)',
                  }}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: 'oklch(0.45 0.02 260)' }}>
                {isLoading ? 'Loading...' : `${filteredProducts.length} account${filteredProducts.length !== 1 ? 's' : ''} found`}
              </p>
              {selectedCategory !== null && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ color: 'oklch(0.72 0.22 35)', background: 'oklch(0.72 0.22 35 / 0.1)' }}
                >
                  Clear filter ×
                </button>
              )}
            </div>

            {/* Product grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-72 rounded-lg" style={{ background: 'oklch(0.15 0.01 260)' }} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Gamepad2 size={48} style={{ color: 'oklch(0.25 0.015 260)' }} />
                <p className="font-heading text-xl" style={{ color: 'oklch(0.35 0.015 260)' }}>
                  No accounts found
                </p>
                <p className="text-sm text-center" style={{ color: 'oklch(0.3 0.015 260)' }}>
                  {searchQuery ? 'Try a different search term' : 'Check back soon for new listings'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id.toString()}
                    product={product}
                    categoryName={categoryMap.get(product.categoryId.toString())}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
