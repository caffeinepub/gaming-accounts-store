import React, { useState } from 'react';
import { Shield, Package, Tag, ShoppingBag, Users } from 'lucide-react';
import AdminAccessControl from '../components/AdminAccessControl';
import CategoryManager from '../components/admin/CategoryManager';
import ProductManager from '../components/admin/ProductManager';
import OrderManager from '../components/admin/OrderManager';
import AdminWhitelistManager from '../components/admin/AdminWhitelistManager';

type AdminTab = 'categories' | 'products' | 'orders' | 'whitelist';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'categories', label: 'Categories', icon: <Tag className="w-4 h-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'whitelist', label: 'Admins', icon: <Users className="w-4 h-4" /> },
];

function AdminContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-sunset-orange to-sunset-pink flex items-center justify-center sunset-glow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-black text-foreground">Admin Panel</h1>
            <p className="font-rajdhani text-sm text-muted-foreground">Manage your Game Vault store</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-rajdhani font-semibold text-sm tracking-wider uppercase transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-sunset-gold text-sunset-gold'
                  : 'border-transparent text-muted-foreground hover:text-sunset-gold/70 hover:border-sunset-gold/30'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'whitelist' && <AdminWhitelistManager />}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  return (
    <AdminAccessControl>
      <AdminContent />
    </AdminAccessControl>
  );
}
