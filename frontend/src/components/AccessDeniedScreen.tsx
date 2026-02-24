import { Link } from '@tanstack/react-router';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function AccessDeniedScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'oklch(0.6 0.22 25 / 0.15)', border: '1px solid oklch(0.6 0.22 25 / 0.4)' }}
      >
        <ShieldX size={36} style={{ color: 'oklch(0.6 0.22 25)' }} />
      </div>
      <h1 className="font-gaming text-2xl mb-2" style={{ color: 'oklch(0.6 0.22 25)' }}>
        Access Denied
      </h1>
      <p className="text-center mb-8 max-w-sm" style={{ color: 'oklch(0.55 0.02 260)' }}>
        You don't have permission to access this area. Admin privileges are required.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200"
        style={{
          background: 'oklch(0.72 0.22 35)',
          color: 'oklch(0.08 0.005 260)',
          boxShadow: '0 0 20px oklch(0.72 0.22 35 / 0.4)',
        }}
      >
        <ArrowLeft size={14} />
        Back to Store
      </Link>
    </div>
  );
}
