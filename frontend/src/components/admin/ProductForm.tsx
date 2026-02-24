import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import type { Product } from '../../backend';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [gameName, setGameName] = useState(product?.gameName ?? '');
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [accountDetails, setAccountDetails] = useState(product?.accountDetails ?? '');
  const [price, setPrice] = useState(product ? (Number(product.price) / 100).toFixed(2) : '');
  const [available, setAvailable] = useState(product?.available ?? true);

  const isEditing = !!product;
  const isPending = addProduct.isPending || updateProduct.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceInPence = Math.round(parseFloat(price) * 100);

    if (isEditing) {
      await updateProduct.mutateAsync({
        id: product.id,
        gameName,
        title,
        description,
        accountDetails,
        price: BigInt(priceInPence),
        available,
      });
    } else {
      await addProduct.mutateAsync({
        gameName,
        title,
        description,
        accountDetails,
        price: BigInt(priceInPence),
        available,
      });
    }
    onSuccess();
  };

  const inputClass = "w-full px-3 py-2 rounded-sm border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold/30 font-rajdhani transition-colors text-sm";
  const labelClass = "font-rajdhani text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className={labelClass}>Game Name *</label>
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder="e.g. Fortnite"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Level 100 Account"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the account..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Account Details</label>
        <textarea
          value={accountDetails}
          onChange={(e) => setAccountDetails(e.target.value)}
          placeholder="Login credentials, notes..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Price (£) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            className={inputClass}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="accent-sunset-gold w-4 h-4"
            />
            <span className="font-rajdhani font-semibold text-sm text-foreground">Available for purchase</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !gameName.trim() || !title.trim() || !price}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-gradient-to-r from-sunset-orange to-sunset-pink text-white font-rajdhani font-bold tracking-wider uppercase hover:opacity-90 transition-all sunset-glow-sm disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          isEditing ? 'Update Product' : 'Add Product'
        )}
      </button>
    </form>
  );
}
