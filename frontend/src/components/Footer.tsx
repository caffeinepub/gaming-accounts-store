import React from 'react';
import { Heart, Store } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'game-vault');

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-sunset-orange to-sunset-pink flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-orbitron font-bold game-vault-gradient">
                Game Vault
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-rajdhani leading-relaxed">
              Your premier destination for digital game accounts. Secure, instant, and reliable.
            </p>
          </div>

          {/* Store Links */}
          <div className="space-y-3">
            <h4 className="font-orbitron text-sm font-semibold text-sunset-gold uppercase tracking-wider">
              Store
            </h4>
            <ul className="space-y-2">
              {['Browse Games', 'New Arrivals', 'Best Sellers', 'Special Offers'].map((link) => (
                <li key={link}>
                  <span className="text-muted-foreground hover:text-sunset-gold text-sm font-rajdhani cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-orbitron text-sm font-semibold text-sunset-gold uppercase tracking-wider">
              Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {['PayPal', 'Crypto', 'Gift Card', 'Pay in 3'].map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 rounded-sm border border-border bg-muted text-muted-foreground text-xs font-rajdhani font-semibold tracking-wide"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-rajdhani">
            © {year} Game Vault. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs font-rajdhani flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-sunset-pink fill-sunset-pink" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sunset-gold hover:text-sunset-orange transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
