import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import LoadingScreen3D from './components/LoadingScreen3D';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import StorefrontPage from './pages/StorefrontPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminPanelPage from './pages/AdminPanelPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SubscriptionCheckoutPage from './pages/SubscriptionCheckoutPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetProductById, useGetAllCategories } from './hooks/useQueries';
import type { Product, ProductCategory, SubscriptionTier } from './backend';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

type Route =
  | '/'
  | '/product'
  | '/checkout'
  | '/order-confirmation'
  | '/admin'
  | '/subscriptions'
  | '/subscription-checkout';

interface CartItem {
  product: Product;
  quantity: number;
}

interface SubscriptionCheckoutState {
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'yearly';
  price: number;
}

// Wrapper to load product + category for ProductDetailPage
function ProductDetailWrapper({
  productId,
  onAddToCart,
  onBack,
}: {
  productId: bigint | undefined;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
}) {
  // useGetProductById now accepts bigint | null | undefined — pass null when undefined
  const { data: product, isLoading } = useGetProductById(productId ?? null);
  const { data: categories } = useGetAllCategories();

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sunset-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const category: ProductCategory | undefined = categories?.find(
    (c) => c.id === product.categoryId
  );

  return (
    <ProductDetailPage
      product={product}
      category={category}
      onAddToCart={onAddToCart}
      onBack={onBack}
    />
  );
}

function AppContent() {
  const [showLoading, setShowLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<Route>('/');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [subscriptionCheckoutState, setSubscriptionCheckoutState] =
    useState<SubscriptionCheckoutState | null>(null);

  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      const [path, ...queryParts] = hash.split('?');
      const params: Record<string, string> = {};
      if (queryParts.length > 0) {
        const searchParams = new URLSearchParams(queryParts.join('?'));
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      }
      setCurrentRoute(path as Route);
      setRouteParams(params);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string, params?: Record<string, string>) => {
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      window.location.hash = `${path}?${searchParams.toString()}`;
    } else {
      window.location.hash = path;
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        toast.info(`${product.gameName} is already in your cart`);
        return prev;
      }
      toast.success(`${product.gameName} added to cart!`);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: bigint) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  if (showLoading) {
    return <LoadingScreen3D onComplete={() => setShowLoading(false)} />;
  }

  const handleSubscribe = (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly', price: number) => {
    setSubscriptionCheckoutState({ tier, billingCycle, price });
    navigate('/subscription-checkout');
  };

  const renderPage = () => {
    if (currentRoute === '/admin') {
      return <AdminPanelPage />;
    }

    if (currentRoute === '/subscriptions') {
      return (
        <SubscriptionsPage
          onSubscribe={handleSubscribe}
        />
      );
    }

    if (currentRoute === '/subscription-checkout') {
      if (!subscriptionCheckoutState) {
        navigate('/subscriptions');
        return null;
      }
      return (
        <SubscriptionCheckoutPage
          tier={subscriptionCheckoutState.tier}
          billingCycle={subscriptionCheckoutState.billingCycle}
          price={subscriptionCheckoutState.price}
          onBack={() => navigate('/subscriptions')}
          onComplete={() => {
            setSubscriptionCheckoutState(null);
            navigate('/');
          }}
        />
      );
    }

    if (currentRoute === '/checkout') {
      return (
        <CheckoutPage
          cartItems={cart}
          onOrderComplete={(orderId) => {
            clearCart();
            navigate('/order-confirmation', { orderId: orderId.toString() });
          }}
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentRoute === '/order-confirmation') {
      const orderId = routeParams.orderId ? BigInt(routeParams.orderId) : undefined;
      if (!orderId) {
        navigate('/');
        return null;
      }
      return (
        <OrderConfirmationPage
          orderId={orderId}
          onContinueShopping={() => navigate('/')}
        />
      );
    }

    if (currentRoute === '/product') {
      const productId = routeParams.id ? BigInt(routeParams.id) : undefined;
      return (
        <ProductDetailWrapper
          productId={productId}
          onAddToCart={addToCart}
          onBack={() => navigate('/')}
        />
      );
    }

    // Default: storefront
    return (
      <StorefrontPage
        onAddToCart={addToCart}
        onViewProduct={(product) => navigate('/product', { id: product.id.toString() })}
      />
    );
  };

  // Determine current page label for nav highlighting
  const currentPageLabel = (() => {
    if (currentRoute === '/') return 'storefront';
    if (currentRoute === '/subscriptions' || currentRoute === '/subscription-checkout') return 'subscriptions';
    return currentRoute.replace('/', '');
  })();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation
        cartItemCount={cart.length}
        onCartClick={() => setCartOpen(true)}
        onNavigate={(page) => {
          if (page === 'storefront') navigate('/');
          else if (page === 'admin') navigate('/admin');
          else if (page === 'subscriptions') navigate('/subscriptions');
        }}
        currentPage={currentPageLabel}
      />

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          navigate('/checkout');
        }}
      />

      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
