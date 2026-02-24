import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Zap, Shield, Clock, Star } from 'lucide-react';
import { useGetProductById, useGetCategoryById } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/layout/product/$productId' });
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: product, isLoading } = useGetProductById(BigInt(productId));
  const { data: category } = useGetCategoryById(product?.categoryId ?? BigInt(0));

  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product);
    navigate({ to: '/checkout' });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" style={{ background: 'oklch(0.18 0.01 260)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-xl" style={{ background: 'oklch(0.18 0.01 260)' }} />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" style={{ background: 'oklch(0.18 0.01 260)' }} />
            <Skeleton className="h-4 w-full" style={{ background: 'oklch(0.18 0.01 260)' }} />
            <Skeleton className="h-4 w-2/3" style={{ background: 'oklch(0.18 0.01 260)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p style={{ color: 'oklch(0.55 0.02 260)' }}>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 mb-6 text-sm transition-colors hover:text-primary"
        style={{ color: 'oklch(0.55 0.02 260)' }}
      >
        <ArrowLeft size={14} />
        Back to Store
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Visual */}
        <div>
          <div
            className="rounded-xl overflow-hidden h-64 flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, oklch(0.13 0.008 260), oklch(0.18 0.04 35))',
              border: '1px solid oklch(0.25 0.015 260)',
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(circle at 50% 50%, oklch(0.72 0.22 35), transparent 70%)',
              }}
            />
            <span className="text-8xl relative z-10">🎮</span>
            {product.available ? (
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-gaming flex items-center gap-1"
                style={{ background: 'oklch(0.5 0.18 145 / 0.9)', color: 'white' }}
              >
                <Star size={10} fill="currentColor" />
                In Stock
              </div>
            ) : (
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-gaming"
                style={{ background: 'oklch(0.6 0.22 25 / 0.9)', color: 'white' }}
              >
                Sold Out
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: Shield, label: 'Verified Account' },
              { icon: Clock, label: 'Instant Delivery' },
              { icon: Star, label: 'Premium Quality' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-3 rounded-lg text-center"
                style={{ background: 'oklch(0.13 0.008 260)', border: '1px solid oklch(0.22 0.012 260)' }}
              >
                <Icon size={16} style={{ color: 'oklch(0.65 0.25 195)' }} />
                <span className="text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-4">
          {category && (
            <span className="font-gaming text-xs tracking-wider uppercase" style={{ color: 'oklch(0.65 0.25 195)' }}>
              {category.name}
            </span>
          )}
          <h1 className="font-heading text-2xl font-bold leading-tight" style={{ color: 'oklch(0.95 0.01 260)' }}>
            {product.title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.6 0.02 260)' }}>
            {product.description}
          </p>

          {/* Account details */}
          <div
            className="rounded-lg p-4"
            style={{
              background: 'oklch(0.08 0.005 260)',
              border: '1px solid oklch(0.65 0.25 195 / 0.3)',
            }}
          >
            <p className="font-gaming text-xs mb-2 uppercase tracking-wider" style={{ color: 'oklch(0.65 0.25 195)' }}>
              Account Details
            </p>
            <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap" style={{ color: 'oklch(0.75 0.02 260)' }}>
              {product.accountDetails}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="font-gaming text-3xl"
              style={{ color: 'oklch(0.72 0.22 35)', textShadow: '0 0 20px oklch(0.72 0.22 35 / 0.5)' }}
            >
              {formatPrice(product.price)}
            </span>
            <Badge variant="outline" className="text-xs" style={{ borderColor: 'oklch(0.3 0.015 260)', color: 'oklch(0.55 0.02 260)' }}>
              {product.gameName}
            </Badge>
          </div>

          {/* Auth warning */}
          {!isAuthenticated && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: 'oklch(0.72 0.22 35 / 0.1)',
                border: '1px solid oklch(0.72 0.22 35 / 0.3)',
                color: 'oklch(0.72 0.22 35)',
              }}
            >
              Please login to purchase this account
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBuyNow}
              disabled={!product.available || !isAuthenticated}
              className="w-full py-3.5 rounded-lg font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'oklch(0.72 0.22 35)',
                color: 'oklch(0.08 0.005 260)',
                boxShadow: product.available && isAuthenticated ? '0 0 25px oklch(0.72 0.22 35 / 0.5)' : 'none',
              }}
            >
              <Zap size={16} />
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.available || !isAuthenticated}
              className="w-full py-3.5 rounded-lg font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'oklch(0.18 0.01 260)',
                color: 'oklch(0.72 0.22 35)',
                border: '1px solid oklch(0.72 0.22 35 / 0.5)',
              }}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
