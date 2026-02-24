import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Tag, Package, Loader2 } from 'lucide-react';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import CategoryManager from '../components/admin/CategoryManager';
import ProductManager from '../components/admin/ProductManager';

export default function AdminPanelPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (!identity) {
    return <AccessDeniedScreen />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin" style={{ color: 'oklch(0.72 0.22 35)' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'oklch(0.72 0.22 35 / 0.2)', border: '1px solid oklch(0.72 0.22 35 / 0.4)' }}
        >
          <Shield size={20} style={{ color: 'oklch(0.72 0.22 35)' }} />
        </div>
        <div>
          <h1 className="font-gaming text-2xl" style={{ color: 'oklch(0.95 0.01 260)' }}>
            Admin Panel
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.5 0.02 260)' }}>
            Manage your store categories and products
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories">
        <TabsList
          className="mb-6 p-1 rounded-lg"
          style={{ background: 'oklch(0.15 0.01 260)', border: '1px solid oklch(0.22 0.012 260)' }}
        >
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 font-heading font-semibold tracking-wide data-[state=active]:text-background"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            <Tag size={14} />
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center gap-2 font-heading font-semibold tracking-wide data-[state=active]:text-background"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            <Package size={14} />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="products">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
