import { useState, useMemo, useCallback } from 'react';
import {
  Search, X, SlidersHorizontal, ChevronDown,
  LayoutGrid, Music, UtensilsCrossed, Train, Heart, Home,
  Tv, Film, TrendingUp, Users, ArrowDownRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Receipt, ReceiptCategory } from '../../types';
import { useFilters } from '../../hooks/useFilters';
import { ReceiptCard } from '../../components/receipt/ReceiptCard';
import { ReceiptDrawer } from '../../components/receipt/ReceiptDrawer';
import { Stagger, StaggerItem } from '../../components/ui/Stagger';

interface ExplorerProps {
  receipts: Receipt[];
  isLoading?: boolean;
  progress?: number;
}

const CATEGORIES: { value: ReceiptCategory | 'all'; label: string; Icon: LucideIcon }[] = [
  { value: 'all', label: 'All', Icon: LayoutGrid },
  { value: 'music', label: 'Music', Icon: Music },
  { value: 'food', label: 'Food', Icon: UtensilsCrossed },
  { value: 'transport', label: 'Transport', Icon: Train },
  { value: 'health', label: 'Health', Icon: Heart },
  { value: 'household', label: 'Household', Icon: Home },
  { value: 'subscription', label: 'Subscriptions', Icon: Tv },
  { value: 'entertainment', label: 'Entertainment', Icon: Film },
  { value: 'investment', label: 'Investment', Icon: TrendingUp },
  { value: 'family', label: 'Family', Icon: Users },
  { value: 'income', label: 'Income', Icon: ArrowDownRight },
];

const PAGE_SIZE = 50;

export function Explorer({ receipts, isLoading, progress }: ExplorerProps) {
  const { filters, filtered, updateFilter, resetFilters, hasActiveFilters } = useFilters(receipts);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const pageReceipts = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = pageReceipts.length < filtered.length;

  const handleSelect = useCallback((r: Receipt) => setSelected(r), []);
  const handleClose = useCallback(() => setSelected(null), []);

  // Find related records (same date, same artist, etc.)
  const relatedReceipts = useMemo(() => {
    if (!selected) return [];
    const selectedDate = selected.timestamp.slice(0, 10);
    return receipts.filter(r =>
      r.id !== selected.id &&
      r.timestamp.slice(0, 10) === selectedDate
    ).slice(0, 10);
  }, [selected, receipts]);

  const handleFilterCategoryClick = useCallback((cat: ReceiptCategory | 'all') => {
    updateFilter('category', cat);
    setPage(1);
  }, [updateFilter]);

  return (
    <section id="explorer" className="py-20 px-6 max-w-7xl mx-auto" aria-label="Receipt explorer">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold mb-3">Explorer</p>
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[var(--text-1)] mb-4 tracking-tight">
          Browse Every Moment
        </h2>
        <p className="text-[var(--text-2)] text-lg sm:text-xl font-medium max-w-2xl">
          Search, filter, and inspect every receipt in your digital life archive.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)] pb-4 pt-6 mb-8 -mx-6 px-6 sm:-mx-8 sm:px-8">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" aria-hidden="true" />
            <input
              type="search"
              value={filters.query}
              onChange={e => { updateFilter('query', e.target.value); setPage(1); }}
              placeholder="Search tracks, artists, notes…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)]/50 backdrop-blur-sm border border-[var(--border)] text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all shadow-sm"
              aria-label="Search receipts"
            />
          </div>

          {/* Sort */}
          <div className="relative w-full sm:w-auto">
            <select
              value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value as typeof filters.sortBy)}
              className="w-full sm:w-auto appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-[var(--bg-surface)]/50 backdrop-blur-sm border border-[var(--border)] text-sm text-[var(--text-2)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] cursor-pointer transition-all shadow-sm"
              aria-label="Sort receipts"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
              <option value="amount_asc">Lowest amount</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-sm font-medium flex justify-center items-center gap-2 transition-all shadow-sm ${
              showFilters || hasActiveFilters
                ? 'border-[var(--accent)] text-[var(--text-1)] bg-[var(--accent-dim)]'
                : 'border-[var(--border)] text-[var(--text-2)] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)] hover:text-[var(--text-1)]'
            }`}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            )}
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={() => { resetFilters(); setPage(1); }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-surface)] transition-all flex justify-center items-center gap-1 bg-[var(--bg-surface)]/50 shadow-sm"
              aria-label="Clear all filters"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" role="group" aria-label="Category filters">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => handleFilterCategoryClick(c.value)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 text-xs font-mono uppercase tracking-wider border-2 border-dashed transition-all duration-200 ${
                filters.category === c.value
                  ? 'border-[var(--text-1)] text-[var(--text-1)] bg-[var(--bg-muted)] font-bold shadow-inner'
                  : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--text-1)] hover:text-[var(--text-1)] bg-transparent'
              }`}
              aria-pressed={filters.category === c.value}
            >
              <c.Icon size={14} aria-hidden="true" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Source filter */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <span className="text-xs text-[var(--text-3)] uppercase tracking-widest font-bold">Source</span>
            <div className="flex bg-[var(--bg-surface)]/50 backdrop-blur-sm p-1 rounded-lg border border-[var(--border)] shadow-sm">
              {(['all', 'spotify', 'household'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { updateFilter('source', s); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    filters.source === s
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-1)] shadow-sm border border-[var(--border-strong)]'
                      : 'text-[var(--text-2)] hover:text-[var(--text-1)] border border-transparent'
                  }`}
                  aria-pressed={filters.source === s}
                >
                  {s === 'all' ? 'All Sources' : s === 'spotify' ? '🎵 Spotify' : '💰 Household'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-secondary)]" aria-live="polite" aria-atomic="true">
          {filtered.length === 0 ? 'No moments found' : (
            <>{filtered.length.toLocaleString('en-IN')} <span className="text-[var(--text-tertiary)]">matching receipts</span></>
          )}
        </p>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-3 font-medium">
            <div className="w-16 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            Loading… {progress}%
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 card glass-panel">
          <p className="text-4xl mb-6" aria-hidden="true">🔍</p>
          <p className="text-1 text-lg font-bold mb-2">No moments found</p>
          <p className="text-sm text-2 mb-6 max-w-md mx-auto">Try widening your date range or clearing the filters to discover more records.</p>
          <button onClick={() => { resetFilters(); setPage(1); }} className="text-sm text-[var(--accent)] hover:underline font-medium">
            Clear all filters
          </button>
        </div>
      )}

      {/* Receipt List View */}
      <div className="max-w-2xl mx-auto relative mt-8 mb-20 drop-shadow-2xl">
        {/* Top jagged edge */}
        <div className="h-4 w-full bg-[var(--bg-surface)] bg-repeat-x receipt-edge-top"></div>

        <Stagger className="bg-[var(--bg-surface)] px-6 pb-6 pt-2 flex flex-col" role="list" aria-label="Receipt items">
          {pageReceipts.map((r, index) => (
            <StaggerItem key={r.id} className="flex flex-col">
              <ReceiptCard receipt={r} onClick={handleSelect} highlight={filters.query} />
              {index !== pageReceipts.length - 1 && (
                <div className="w-full border-b-2 border-dashed border-[var(--border)] my-2" />
              )}
            </StaggerItem>
          ))}
        </Stagger>

        {/* Bottom jagged edge */}
        <div className="h-4 w-full bg-[var(--bg-surface)] bg-repeat-x absolute -bottom-4 left-0 right-0 receipt-edge-bottom"></div>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
          >
            Load more ({(filtered.length - pageReceipts.length).toLocaleString()} remaining)
          </button>
        </div>
      )}

      {/* Detail drawer */}
      <ReceiptDrawer
        receipt={selected}
        onClose={handleClose}
        relatedReceipts={relatedReceipts}
        onRelatedClick={handleSelect}
      />
    </section>
  );
}
