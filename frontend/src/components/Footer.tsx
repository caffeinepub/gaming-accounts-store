import { Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'gamevault-store');

  return (
    <footer
      className="border-t mt-auto"
      style={{
        background: 'oklch(0.1 0.005 260)',
        borderColor: 'oklch(0.2 0.01 260)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="brand-gradient-text font-gaming text-lg font-bold tracking-wider">
                Game Vault
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.45 0.02 260)' }}>
              Premium gaming accounts marketplace. Buy verified accounts for your favorite games.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: 'oklch(0.65 0.02 260)' }}>
              Store
            </h4>
            <ul className="flex flex-col gap-2">
              {['Browse Accounts', 'Car Parking Multiplayer', 'New Arrivals'].map(link => (
                <li key={link}>
                  <a href="/" className="text-xs transition-colors hover:text-primary" style={{ color: 'oklch(0.45 0.02 260)' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment methods */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-3 uppercase tracking-wide" style={{ color: 'oklch(0.65 0.02 260)' }}>
              Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {['PayPal', 'Crypto', 'Gift Card', 'Pay in 3'].map(method => (
                <span
                  key={method}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: 'oklch(0.18 0.01 260)',
                    color: 'oklch(0.55 0.02 260)',
                    border: '1px solid oklch(0.22 0.012 260)',
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'oklch(0.18 0.01 260)' }}
        >
          <p className="text-xs" style={{ color: 'oklch(0.35 0.015 260)' }}>
            © {year} Game Vault. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: 'oklch(0.35 0.015 260)' }}>
            Built with{' '}
            <Heart size={12} fill="oklch(0.72 0.22 35)" style={{ color: 'oklch(0.72 0.22 35)' }} />
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary"
              style={{ color: 'oklch(0.72 0.22 35)' }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
