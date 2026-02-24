import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useGetAvailableProducts, useDeleteProduct, useGetAllCategories } from '../../hooks/useQueries';
import type { Product } from '../../backend';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ProductForm from './ProductForm';

export default function ProductManager() {
  const { data: products, isLoading, error } = useGetAvailableProducts();
  const { data: categories } = useGetAllCategories();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const categoryMap = new Map(categories?.map((c) => [c.id.toString(), c.name]) ?? []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sunset-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-sm border border-destructive/30 bg-destructive/10">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <p className="font-rajdhani text-sm text-destructive">Failed to load products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron text-base font-bold text-foreground">Products</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-semibold text-sm hover:opacity-90 transition-all sunset-glow-sm">
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-foreground">Add Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {!products || products.length === 0 ? (
        <div className="text-center py-10">
          <p className="font-rajdhani text-muted-foreground">No products yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider">Game</th>
                <th className="text-left px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider hidden sm:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr key={product.id.toString()} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                  <td className="px-4 py-3">
                    <p className="font-rajdhani font-semibold text-foreground">{product.gameName}</p>
                    <p className="font-rajdhani text-xs text-muted-foreground">{product.title}</p>
                  </td>
                  <td className="px-4 py-3 font-rajdhani text-sm text-muted-foreground hidden md:table-cell">
                    {categoryMap.get(product.categoryId.toString()) ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-orbitron text-sm font-bold text-sunset-gold hidden sm:table-cell">
                    £{(Number(product.price) / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-rajdhani font-semibold ${
                      product.available
                        ? 'bg-success/10 text-success border border-success/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-success' : 'bg-muted-foreground'}`} />
                      {product.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <Dialog open={editDialogOpen && editingProduct?.id === product.id} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingProduct(null); }}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => { setEditingProduct(product); setEditDialogOpen(true); }}
                            className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-orbitron text-foreground">Edit Product</DialogTitle>
                          </DialogHeader>
                          {editingProduct && (
                            <ProductForm product={editingProduct} onSuccess={() => { setEditDialogOpen(false); setEditingProduct(null); }} />
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-sm text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-orbitron text-foreground">Delete Product</AlertDialogTitle>
                            <AlertDialogDescription className="font-rajdhani text-muted-foreground">
                              Are you sure you want to delete "{product.gameName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-rajdhani border-border">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProduct.mutate(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-rajdhani"
                            >
                              {deleteProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
