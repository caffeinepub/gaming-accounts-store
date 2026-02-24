import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Product, ProductCategory } from '../../backend';
import { useAddProduct, useEditProduct } from '../../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ProductFormProps {
  existing: Product | null;
  categories: ProductCategory[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ existing, categories, onSuccess, onCancel }: ProductFormProps) {
  const [gameName, setGameName] = useState(existing?.gameName ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId.toString() ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [accountDetails, setAccountDetails] = useState(existing?.accountDetails ?? '');
  const [priceStr, setPriceStr] = useState(existing ? (Number(existing.price) / 100).toFixed(2) : '');
  const [available, setAvailable] = useState(existing?.available ?? true);

  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const isPending = addProduct.isPending || editProduct.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim() || !categoryId || !title.trim() || !priceStr) return;
    const price = BigInt(Math.round(parseFloat(priceStr) * 100));
    try {
      if (existing) {
        await editProduct.mutateAsync({
          id: existing.id,
          gameName: gameName.trim(),
          categoryId: BigInt(categoryId),
          title: title.trim(),
          description: description.trim(),
          accountDetails: accountDetails.trim(),
          price,
          available,
        });
        toast.success(`Product "${title.trim()}" updated`);
      } else {
        await addProduct.mutateAsync({
          gameName: gameName.trim(),
          categoryId: BigInt(categoryId),
          title: title.trim(),
          description: description.trim(),
          accountDetails: accountDetails.trim(),
          price,
          available,
        });
        toast.success(`Product "${title.trim()}" created`);
      }
      onSuccess();
    } catch {
      toast.error('Failed to save product. Please try again.');
    }
  };

  const inputStyle = {
    background: 'oklch(0.18 0.01 260)',
    border: '1px solid oklch(0.3 0.015 260)',
    color: 'oklch(0.9 0.01 260)',
  };

  const labelStyle = { color: 'oklch(0.65 0.02 260)' };

  const isValid = gameName.trim() && categoryId && title.trim() && priceStr && parseFloat(priceStr) > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-game" className="font-heading font-semibold text-sm" style={labelStyle}>
            Game Name *
          </Label>
          <Input
            id="p-game"
            value={gameName}
            onChange={e => setGameName(e.target.value)}
            placeholder="e.g. Car Parking Multiplayer"
            required
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-category" className="font-heading font-semibold text-sm" style={labelStyle}>
            Category *
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="p-category" style={inputStyle}>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent style={{ background: 'oklch(0.15 0.01 260)', border: '1px solid oklch(0.25 0.015 260)' }}>
              {categories.map(c => (
                <SelectItem
                  key={c.id.toString()}
                  value={c.id.toString()}
                  style={{ color: 'oklch(0.85 0.01 260)' }}
                >
                  {c.name}
                </SelectItem>
              ))}
              {categories.length === 0 && (
                <SelectItem value="none" disabled style={{ color: 'oklch(0.45 0.02 260)' }}>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-title" className="font-heading font-semibold text-sm" style={labelStyle}>
          Listing Title *
        </Label>
        <Input
          id="p-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Level 50 Account - Rare Cars Included"
          required
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-desc" className="font-heading font-semibold text-sm" style={labelStyle}>
          Description
        </Label>
        <Textarea
          id="p-desc"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what's included in this account..."
          rows={3}
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-details" className="font-heading font-semibold text-sm" style={labelStyle}>
          Account Details
        </Label>
        <Textarea
          id="p-details"
          value={accountDetails}
          onChange={e => setAccountDetails(e.target.value)}
          placeholder="Level: 50&#10;Cars: 25 rare vehicles&#10;Gold: 500,000&#10;Rank: Pro"
          rows={4}
          className="font-mono text-xs"
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-price" className="font-heading font-semibold text-sm" style={labelStyle}>
            Price (£) *
          </Label>
          <Input
            id="p-price"
            type="number"
            min="0.01"
            step="0.01"
            value={priceStr}
            onChange={e => setPriceStr(e.target.value)}
            placeholder="9.99"
            required
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="font-heading font-semibold text-sm" style={labelStyle}>
            Available for Sale
          </Label>
          <div className="flex items-center gap-3 h-10">
            <Switch
              checked={available}
              onCheckedChange={setAvailable}
            />
            <span className="text-sm" style={{ color: available ? 'oklch(0.5 0.18 145)' : 'oklch(0.5 0.02 260)' }}>
              {available ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
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
          disabled={!isValid || isPending}
          className="flex-1 py-2.5 rounded font-heading font-bold tracking-wide uppercase text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{
            background: 'oklch(0.72 0.22 35)',
            color: 'oklch(0.08 0.005 260)',
            boxShadow: isValid && !isPending ? '0 0 15px oklch(0.72 0.22 35 / 0.3)' : 'none',
          }}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {isPending ? 'Saving...' : existing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
