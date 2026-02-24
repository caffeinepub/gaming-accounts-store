import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Shield, Store, Crown } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface NavigationProps {
  cartItemCount: number;
  onCartClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navigation({ cartItemCount, onCartClick, onNavigate, currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('storefront')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-sunset-orange to-sunset-pink flex items-center justify-center sunset-glow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-orbitron font-bold game-vault-gradient">
              Game Vault
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('storefront')}
              className={`font-rajdhani font-semibold text-sm tracking-wider uppercase transition-colors ${
                currentPage === 'storefront'
                  ? 'text-sunset-gold neon-text'
                  : 'text-muted-foreground hover:text-sunset-gold'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => onNavigate('subscriptions')}
              className={`font-rajdhani font-semibold text-sm tracking-wider uppercase transition-colors flex items-center gap-1 ${
                currentPage === 'subscriptions'
                  ? 'text-sunset-orange neon-text'
                  : 'text-muted-foreground hover:text-sunset-orange'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Subscriptions
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`font-rajdhani font-semibold text-sm tracking-wider uppercase transition-colors flex items-center gap-1 ${
                currentPage === 'admin'
                  ? 'text-sunset-pink neon-text-pink'
                  : 'text-muted-foreground hover:text-sunset-pink'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-md text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sunset-orange text-white text-xs font-bold flex items-center justify-center sunset-glow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth button */}
            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className={`px-4 py-1.5 rounded-sm font-rajdhani font-semibold text-sm tracking-wider uppercase transition-all ${
                isAuthenticated
                  ? 'border border-border text-muted-foreground hover:border-sunset-pink hover:text-sunset-pink'
                  : 'bg-gradient-to-r from-sunset-orange to-sunset-pink text-white hover:opacity-90 sunset-glow-sm'
              } disabled:opacity-50`}
            >
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            <button
              onClick={() => { onNavigate('storefront'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-sm font-rajdhani font-semibold text-sm tracking-wider uppercase transition-colors ${
                currentPage === 'storefront'
                  ? 'text-sunset-gold bg-muted'
                  : 'text-muted-foreground hover:text-sunset-gold hover:bg-muted'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => { onNavigate('subscriptions'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-sm font-rajdhani font-semibold text-sm tracking-wider uppercase transition-colors flex items-center gap-1 ${
                currentPage === 'subscriptions'
                  ? 'text-sunset-orange bg-muted'
                  : 'text-muted-foreground hover:text-sunset-orange hover:bg-muted'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Subscriptions
            </button>
            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-sm font-rajdhani font-semibold text-sm tracking-wider uppercase transition-colors flex items-center gap-1 ${
                currentPage === 'admin'
                  ? 'text-sunset-pink bg-muted'
                  : 'text-muted-foreground hover:text-sunset-pink hover:bg-muted'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
