import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { useGetAllCategories, useDeleteCategory } from '../../hooks/useQueries';
import { ProductCategory } from '../../backend';
import CategoryForm from './CategoryForm';
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

export default function CategoryManager() {
  const { data: categories = [], isLoading } = useGetAllCategories();
  const deleteCategory = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);

  const handleEdit = (cat: ProductCategory) => {
    setEditTarget(cat);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete category');
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
          Categories ({categories.length})
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
          Add Category
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: 'oklch(0.72 0.22 35)' }} />
        </div>
      ) : categories.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'oklch(0.13 0.008 260)', border: '1px solid oklch(0.22 0.012 260)' }}
        >
          <Tag size={40} style={{ color: 'oklch(0.25 0.015 260)' }} />
          <p className="font-heading text-lg mt-3" style={{ color: 'oklch(0.35 0.015 260)' }}>
            No categories yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.3 0.015 260)' }}>
            Add your first category to get started
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid oklch(0.22 0.012 260)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: 'oklch(0.15 0.01 260)', borderBottom: '1px solid oklch(0.22 0.012 260)' }}>
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.02 260)' }}>
                  ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.02 260)' }}>
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest hidden md:table-cell" style={{ color: 'oklch(0.5 0.02 260)' }}>
                  Description
                </th>
                <th className="text-right px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.02 260)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr
                  key={cat.id.toString()}
                  style={{
                    background: i % 2 === 0 ? 'oklch(0.13 0.008 260)' : 'oklch(0.12 0.006 260)',
                    borderBottom: '1px solid oklch(0.18 0.01 260)',
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="font-gaming text-xs" style={{ color: 'oklch(0.65 0.25 195)' }}>
                      #{cat.id.toString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-heading font-semibold text-sm" style={{ color: 'oklch(0.85 0.01 260)' }}>
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs line-clamp-1" style={{ color: 'oklch(0.5 0.02 260)' }}>
                      {cat.description || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: 'oklch(0.65 0.25 195)' }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
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
          style={{
            background: 'oklch(0.13 0.008 260)',
            border: '1px solid oklch(0.72 0.22 35 / 0.4)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-xl" style={{ color: 'oklch(0.95 0.01 260)' }}>
              {editTarget ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            existing={editTarget}
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
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'oklch(0.55 0.02 260)' }}>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
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
              disabled={deleteCategory.isPending}
              style={{
                background: 'oklch(0.6 0.22 25)',
                color: 'white',
              }}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
