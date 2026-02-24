import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAddCategory, useUpdateCategory } from '../../hooks/useQueries';
import type { ProductCategory } from '../../backend';

interface CategoryFormProps {
  category?: ProductCategory;
  onSuccess: () => void;
}

export default function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');

  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();

  const isEditing = !!category;
  const isPending = addCategory.isPending || updateCategory.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing) {
      await updateCategory.mutateAsync({ id: category.id, name, description });
    } else {
      await addCategory.mutateAsync({ name, description });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
          className="w-full px-3 py-2 rounded-sm border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold/30 font-rajdhani transition-colors"
        />
      </div>
      <div>
        <label className="font-rajdhani text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Category description"
          rows={3}
          className="w-full px-3 py-2 rounded-sm border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold/30 font-rajdhani transition-colors resize-none"
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditing ? 'Update Category' : 'Add Category'
          )}
        </button>
      </div>
    </form>
  );
}
