import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Gamepad2, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import CartDrawer from './CartDrawer';

export default function Navigation() {
  const { items } = useCart();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <>
      <nav
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'oklch(0.1 0.005 260 / 0.95)',
          borderColor: 'oklch(0.25 0.015 260)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand name with gradient */}
            <Link to="/" className="flex items-center gap-2 group">
              <span
                className="brand-gradient-text font-gaming text-xl font-bold tracking-wider"
              >
                Game Vault
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-heading font-semibold tracking-wide uppercase transition-colors hover:text-primary"
                style={{ color: 'oklch(0.7 0.02 260)' }}
                activeProps={{ style: { color: 'oklch(0.72 0.22 35)' } }}
              >
                Store
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-sm font-heading font-semibold tracking-wide uppercase transition-colors"
                  style={{ color: 'oklch(0.65 0.25 195)' }}
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
                style={{ color: 'oklch(0.7 0.02 260)' }}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{
                      background: 'oklch(0.72 0.22 35)',
                      color: 'oklch(0.08 0.005 260)',
                      fontFamily: 'Orbitron, monospace',
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth button */}
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded text-sm font-heading font-bold tracking-wide uppercase transition-all duration-200 disabled:opacity-50"
                style={
                  isAuthenticated
                    ? {
                        background: 'oklch(0.18 0.01 260)',
                        color: 'oklch(0.7 0.02 260)',
                        border: '1px solid oklch(0.25 0.015 260)',
                      }
                    : {
                        background: 'oklch(0.72 0.22 35)',
                        color: 'oklch(0.08 0.005 260)',
                        boxShadow: '0 0 15px oklch(0.72 0.22 35 / 0.4)',
                      }
                }
              >
                <Gamepad2 size={14} />
                {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
              </button>

              {/* Mobile menu */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ color: 'oklch(0.7 0.02 260)' }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 py-4 flex flex-col gap-3"
            style={{
              background: 'oklch(0.12 0.008 260)',
              borderColor: 'oklch(0.25 0.015 260)',
            }}
          >
            <Link
              to="/"
              className="text-sm font-heading font-semibold tracking-wide uppercase py-2"
              style={{ color: 'oklch(0.7 0.02 260)' }}
              onClick={() => setMobileOpen(false)}
            >
              Store
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-sm font-heading font-semibold tracking-wide uppercase py-2"
                style={{ color: 'oklch(0.65 0.25 195)' }}
                onClick={() => setMobileOpen(false)}
              >
                <Shield size={14} />
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => { handleAuth(); setMobileOpen(false); }}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-heading font-bold tracking-wide uppercase w-full justify-center"
              style={{
                background: isAuthenticated ? 'oklch(0.18 0.01 260)' : 'oklch(0.72 0.22 35)',
                color: isAuthenticated ? 'oklch(0.7 0.02 260)' : 'oklch(0.08 0.005 260)',
                border: isAuthenticated ? '1px solid oklch(0.25 0.015 260)' : 'none',
              }}
            >
              <Gamepad2 size={14} />
              {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate({ to: '/checkout' }); }} />
    </>
  );
}
