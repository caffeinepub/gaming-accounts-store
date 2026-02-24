import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import { useGetAvailableProducts, useDeleteProduct, useGetAllCategories } from '../../hooks/useQueries';
import { Product } from '../../backend';
import ProductForm from './ProductForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function ProductManager() {
  const { data: products = [], isLoading } = useGetAvailableProducts();
  const { data: categories = [] } = useGetAllCategories();
  const deleteProduct = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categoryMap = new Map(categories.map(c => [c.id.toString(), c.name]));
  const formatPrice = (price: bigint) => `£${(Number(price) / 100).toFixed(2)}`;

  const handleEdit = (p: Product) => {
    setEditTarget(p);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success(`Product "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'oklch(0.85 0.01 260)' }}>
          Products ({products.length})
        </h2>
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: '0 0 15px oklch(0.72 0.22 35 / 0.3)',
          }}
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'oklch(0.72 0.22 35)' }} />
        </div>
      ) : products.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'oklch(0.13 0.008 260)', border: '1px solid oklch(0.22 0.012 260)' }}
        >
          <Package size={40} style={{ color: 'oklch(0.25 0.015 260)' }} />
          <p className="font-heading text-lg mt-3" style={{ color: 'oklch(0.35 0.015 260)' }}>
            No products yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.3 0.015 260)' }}>
            Add your first product listing
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden overflow-x-auto"
          style={{ border: '1px solid oklch(0.22 0.012 260)' }}
        >
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ background: 'oklch(0.15 0.01 260)', borderBottom: '1px solid oklch(0.22 0.012 260)' }}>
                {['ID', 'Title', 'Game', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest"
                    style={{ color: 'oklch(0.5 0.02 260)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.id.toString()}
                  style={{
                    background: i % 2 === 0 ? 'oklch(0.13 0.008 260)' : 'oklch(0.12 0.006 260)',
                    borderBottom: '1px solid oklch(0.18 0.01 260)',
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="font-gaming text-xs" style={{ color: 'oklch(0.65 0.25 195)' }}>
                      #{p.id.toString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-heading font-semibold text-sm" style={{ color: 'oklch(0.85 0.01 260)' }}>
                      {p.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: 'oklch(0.6 0.02 260)' }}>
                      {p.gameName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: 'oklch(0.6 0.02 260)' }}>
                      {categoryMap.get(p.categoryId.toString()) ?? `#${p.categoryId}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-gaming text-sm" style={{ color: 'oklch(0.72 0.22 35)' }}>
                      {formatPrice(p.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-gaming"
                      style={{
                        background: p.available ? 'oklch(0.5 0.18 145 / 0.15)' : 'oklch(0.6 0.22 25 / 0.15)',
                        color: p.available ? 'oklch(0.5 0.18 145)' : 'oklch(0.6 0.22 25)',
                      }}
                    >
                      {p.available ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'oklch(0.65 0.25 195)' }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'oklch(0.6 0.22 25)' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={handleFormClose}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{
            background: 'oklch(0.13 0.008 260)',
            border: '1px solid oklch(0.72 0.22 35 / 0.4)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-xl" style={{ color: 'oklch(0.95 0.01 260)' }}>
              {editTarget ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            existing={editTarget}
            categories={categories}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent
          style={{
            background: 'oklch(0.13 0.008 260)',
            border: '1px solid oklch(0.6 0.22 25 / 0.4)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading" style={{ color: 'oklch(0.95 0.01 260)' }}>
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'oklch(0.55 0.02 260)' }}>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                background: 'oklch(0.18 0.01 260)',
                color: 'oklch(0.7 0.02 260)',
                border: '1px solid oklch(0.25 0.015 260)',
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              style={{ background: 'oklch(0.6 0.22 25)', color: 'white' }}
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
