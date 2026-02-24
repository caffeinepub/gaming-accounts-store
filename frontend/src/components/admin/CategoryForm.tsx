import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductCategory } from '../../backend';
import { useAddCategory, useEditCategory } from '../../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CategoryFormProps {
  existing: ProductCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ existing, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const addCategory = useAddCategory();
  const editCategory = useEditCategory();

  const isPending = addCategory.isPending || editCategory.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (existing) {
        await editCategory.mutateAsync({ id: existing.id, name: name.trim(), description: description.trim() });
        toast.success(`Category "${name.trim()}" updated`);
      } else {
        await addCategory.mutateAsync({ name: name.trim(), description: description.trim() });
        toast.success(`Category "${name.trim()}" created`);
      }
      onSuccess();
    } catch {
      toast.error('Failed to save category. Please try again.');
    }
  };

  const inputStyle = {
    background: 'oklch(0.18 0.01 260)',
    border: '1px solid oklch(0.3 0.015 260)',
    color: 'oklch(0.9 0.01 260)',
  };

  const labelStyle = { color: 'oklch(0.65 0.02 260)' };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-name" className="font-heading font-semibold text-sm" style={labelStyle}>
          Category Name *
        </Label>
        <Input
          id="cat-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Car Parking Multiplayer"
          required
          style={inputStyle}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-desc" className="font-heading font-semibold text-sm" style={labelStyle}>
          Description
        </Label>
        <Textarea
          id="cat-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief description of this category..."
          rows={3}
          style={inputStyle}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-2.5 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'oklch(0.18 0.01 260)',
            color: 'oklch(0.7 0.02 260)',
            border: '1px solid oklch(0.25 0.015 260)',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isPending}
          className="flex-1 py-2.5 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: name.trim() && !isPending ? '0 0 15px oklch(0.72 0.22 35 / 0.3)' : 'none',
          }}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {isPending ? 'Saving...' : existing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
