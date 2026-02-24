import { Outlet } from '@tanstack/react-router';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'oklch(0.1 0.005 260)' }}>
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
