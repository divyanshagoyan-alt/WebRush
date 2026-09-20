import type { ReceiptCategory } from '../../types';
import {
  Music, UtensilsCrossed, Train, Heart, Home,
  Tv, Film, TrendingUp, Users, Shirt,
  ArrowDownRight, LayoutGrid,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CatConfig {
  label: string;
  Icon: LucideIcon;
  cls: string;
}

const CATEGORY_CONFIG: Record<ReceiptCategory, CatConfig> = {
  music:         { label: 'Music',         Icon: Music,           cls: 'cat-music' },
  food:          { label: 'Food',          Icon: UtensilsCrossed, cls: 'cat-food' },
  transport:     { label: 'Transport',     Icon: Train,           cls: 'cat-transport' },
  health:        { label: 'Health',        Icon: Heart,           cls: 'cat-health' },
  household:     { label: 'Household',     Icon: Home,            cls: 'cat-household' },
  subscription:  { label: 'Subscription',  Icon: Tv,              cls: 'cat-subscription' },
  entertainment: { label: 'Entertainment', Icon: Film,            cls: 'cat-entertainment' },
  investment:    { label: 'Investment',    Icon: TrendingUp,      cls: 'cat-investment' },
  family:        { label: 'Family',        Icon: Users,           cls: 'cat-family' },
  apparel:       { label: 'Apparel',       Icon: Shirt,           cls: 'cat-apparel' },
  income:        { label: 'Income',        Icon: ArrowDownRight,  cls: 'cat-income' },
  other:         { label: 'Other',         Icon: LayoutGrid,      cls: 'cat-other' },
};

interface CategoryBadgeProps {
  category: ReceiptCategory;
  count?: number;
  onClick?: (category: ReceiptCategory) => void;
  isSelected?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, count, onClick, isSelected, className = '' }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  const Icon = config.Icon;

  const baseStyle = "inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-mono uppercase tracking-wider border-2 border-dashed transition-all duration-200 whitespace-nowrap";
  const unselectedStyle = "border-gray-300 text-gray-500 hover:border-gray-800 hover:text-gray-900";
  const selectedStyle = "border-gray-900 text-gray-900 bg-gray-100 font-bold shadow-inner";

  return (
    <button
      onClick={() => onClick?.(category)}
      disabled={!onClick}
      className={`${baseStyle} ${isSelected ? selectedStyle : unselectedStyle} ${!onClick ? 'cursor-default' : 'cursor-pointer'} ${className}`}
      aria-pressed={isSelected}
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" aria-hidden="true" />
      <span>{config.label}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs border border-dotted border-current opacity-80">
          {count.toLocaleString('en-IN')}
        </span>
      )}
    </button>
  );
}

export function getCategoryColor(cat: ReceiptCategory): string {
  const map: Record<ReceiptCategory, string> = {
    music: '#8B5CF6',
    food: '#FBBF24',
    transport: '#22D3EE',
    health: '#34D399',
    household: '#9AA3B2',
    subscription: '#FB7185',
    entertainment: '#F97316',
    investment: '#3B82F6',
    family: '#A78BFA',
    apparel: '#E879F9',
    income: '#34D399',
    other: '#6B7280',
  };
  return map[cat] || '#6B7280';
}

export { CATEGORY_CONFIG };
