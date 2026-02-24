import React, { useState } from 'react';
import AdminAccessControl from '../components/AdminAccessControl';
import ProductManager from '../components/admin/ProductManager';
import OrderManager from '../components/admin/OrderManager';
import PaymentsManager from '../components/admin/PaymentsManager';
import AdminWhitelistManager from '../components/admin/AdminWhitelistManager';
import SubscriptionManager from '../components/admin/SubscriptionManager';
import StoreSettingsManager from '../components/admin/StoreSettingsManager';
import { Package, ShoppingCart, CreditCard, Users, Crown, Settings } from 'lucide-react';

type Tab = 'products' | 'orders' | 'payments' | 'admins' | 'subscriptions' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'admins', label: 'Admins', icon: <Users className="w-4 h-4" /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <Crown className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

function AdminPanelContent() {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <div className="min-h-screen bg-dusk-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-sunset-gold tracking-wider mb-1">
            ADMIN PANEL
          </h1>
          <p className="font-rajdhani text-muted-foreground">
            Game Vault Control Center
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-sunset-orange/20 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-sunset-orange/20 border border-sunset-orange/50 text-sunset-orange'
                  : 'text-foreground/60 hover:text-foreground/90 hover:bg-dusk-mid/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'payments' && <PaymentsManager />}
          {activeTab === 'admins' && <AdminWhitelistManager />}
          {activeTab === 'subscriptions' && <SubscriptionManager />}
          {activeTab === 'settings' && <StoreSettingsManager />}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  return (
    <AdminAccessControl>
      <AdminPanelContent />
    </AdminAccessControl>
  );
}
