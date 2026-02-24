import React from 'react';
import type { ProductCategory } from '../backend';

interface CategoryCardProps {
  category: ProductCategory;
  isSelected: boolean;
  onSelect: (category: ProductCategory) => void;
}

export default function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  return (
    <button
      onClick={() => onSelect(category)}
      className={`px-4 py-2 rounded-sm border font-rajdhani font-semibold text-sm tracking-wider uppercase transition-all ${
        isSelected
          ? 'border-sunset-gold bg-sunset-gold/10 text-sunset-gold sunset-glow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-sunset-gold/50 hover:text-sunset-gold hover:bg-muted'
      }`}
    >
      {category.name}
    </button>
  );
}
