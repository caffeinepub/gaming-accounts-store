import { Tag, ChevronRight } from 'lucide-react';
import { ProductCategory } from '../backend';

interface CategoryCardProps {
  category: ProductCategory;
  productCount?: number;
  isSelected?: boolean;
  onClick: () => void;
}

export default function CategoryCard({ category, productCount, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg transition-all duration-200 group"
      style={{
        background: isSelected ? 'oklch(0.72 0.22 35 / 0.15)' : 'oklch(0.13 0.008 260)',
        border: `1px solid ${isSelected ? 'oklch(0.72 0.22 35)' : 'oklch(0.22 0.012 260)'}`,
        boxShadow: isSelected ? '0 0 15px oklch(0.72 0.22 35 / 0.2)' : 'none',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{
              background: isSelected ? 'oklch(0.72 0.22 35 / 0.3)' : 'oklch(0.18 0.01 260)',
            }}
          >
            <Tag size={14} style={{ color: isSelected ? 'oklch(0.72 0.22 35)' : 'oklch(0.55 0.02 260)' }} />
          </div>
          <div>
            <p
              className="font-heading font-bold text-sm"
              style={{ color: isSelected ? 'oklch(0.72 0.22 35)' : 'oklch(0.85 0.01 260)' }}
            >
              {category.name}
            </p>
            {productCount !== undefined && (
              <p className="text-xs" style={{ color: 'oklch(0.45 0.02 260)' }}>
                {productCount} account{productCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <ChevronRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
          style={{ color: isSelected ? 'oklch(0.72 0.22 35)' : 'oklch(0.35 0.015 260)' }}
        />
      </div>
      {category.description && (
        <p className="text-xs mt-2 line-clamp-2" style={{ color: 'oklch(0.45 0.02 260)' }}>
          {category.description}
        </p>
      )}
    </button>
  );
}
