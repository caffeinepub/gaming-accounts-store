import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useGetAllCategories, useDeleteCategory } from '../../hooks/useQueries';
import type { ProductCategory } from '../../backend';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import CategoryForm from './CategoryForm';

export default function CategoryManager() {
  const { data: categories, isLoading, error } = useGetAllCategories();
  const deleteCategory = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
        <p className="font-rajdhani text-sm text-destructive">Failed to load categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron text-base font-bold text-foreground">Categories</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-semibold text-sm hover:opacity-90 transition-all sunset-glow-sm">
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-foreground">Add Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {!categories || categories.length === 0 ? (
        <div className="text-center py-10">
          <p className="font-rajdhani text-muted-foreground">No categories yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="text-right px-4 py-3 font-orbitron text-xs font-bold text-sunset-gold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id.toString()} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                  <td className="px-4 py-3 font-rajdhani font-semibold text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 font-rajdhani text-sm text-muted-foreground hidden sm:table-cell">{cat.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <Dialog open={editDialogOpen && editingCategory?.id === cat.id} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingCategory(null); }}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => { setEditingCategory(cat); setEditDialogOpen(true); }}
                            className="p-1.5 rounded-sm text-muted-foreground hover:text-sunset-gold hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader>
                            <DialogTitle className="font-orbitron text-foreground">Edit Category</DialogTitle>
                          </DialogHeader>
                          {editingCategory && (
                            <CategoryForm category={editingCategory} onSuccess={() => { setEditDialogOpen(false); setEditingCategory(null); }} />
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
                            <AlertDialogTitle className="font-orbitron text-foreground">Delete Category</AlertDialogTitle>
                            <AlertDialogDescription className="font-rajdhani text-muted-foreground">
                              Are you sure you want to delete "{cat.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-rajdhani border-border">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCategory.mutate(cat.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-rajdhani"
                            >
                              {deleteCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
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
