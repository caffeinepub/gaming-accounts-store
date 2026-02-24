import { ShoppingCart, Zap, Star } from 'lucide-react';
import { Product } from '../backend';
import { useCart } from '../hooks/useCart';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.title} added to cart!`, {
      description: formatPrice(product.price),
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    navigate({ to: '/checkout' });
  };

  return (
    <div
      className="card-gaming rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => navigate({ to: '/product/$productId', params: { productId: product.id.toString() } })}
    >
      {/* Card header */}
      <div
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.15 0.02 260), oklch(0.18 0.04 35))',
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, oklch(0.72 0.22 35), transparent 70%)',
          }}
        />
        <span className="text-5xl relative z-10">🎮</span>
        {!product.available && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-gaming"
            style={{ background: 'oklch(0.6 0.22 25 / 0.9)', color: 'white' }}
          >
            Sold Out
          </div>
        )}
        {product.available && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-gaming flex items-center gap-1"
            style={{ background: 'oklch(0.5 0.18 145 / 0.9)', color: 'white' }}
          >
            <Star size={10} fill="currentColor" />
            Available
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {categoryName && (
          <span
            className="text-xs font-gaming tracking-wider uppercase mb-1 block"
            style={{ color: 'oklch(0.65 0.25 195)' }}
          >
            {categoryName}
          </span>
        )}
        <h3
          className="font-heading font-bold text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2"
          style={{ color: 'oklch(0.9 0.01 260)' }}
        >
          {product.title}
        </h3>
        <p
          className="text-xs mb-3 line-clamp-2"
          style={{ color: 'oklch(0.55 0.02 260)' }}
        >
          {product.description}
        </p>

        {/* Account details preview */}
        <div
          className="text-xs px-2 py-1.5 rounded mb-3 font-mono"
          style={{
            background: 'oklch(0.08 0.005 260)',
            color: 'oklch(0.65 0.25 195)',
            border: '1px solid oklch(0.2 0.01 260)',
          }}
        >
          {product.accountDetails.length > 60
            ? product.accountDetails.substring(0, 60) + '...'
            : product.accountDetails}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-gaming text-xl"
            style={{ color: 'oklch(0.72 0.22 35)', textShadow: '0 0 10px oklch(0.72 0.22 35 / 0.5)' }}
          >
            {formatPrice(product.price)}
          </span>
          <span className="text-xs" style={{ color: 'oklch(0.45 0.02 260)' }}>
            {product.gameName}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-heading font-bold tracking-wide uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'oklch(0.18 0.01 260)',
              color: 'oklch(0.72 0.22 35)',
              border: '1px solid oklch(0.72 0.22 35 / 0.4)',
            }}
          >
            <ShoppingCart size={12} />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!product.available}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-heading font-bold tracking-wide uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'oklch(0.72 0.22 35)',
              color: 'oklch(0.08 0.005 260)',
            }}
          >
            <Zap size={12} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
