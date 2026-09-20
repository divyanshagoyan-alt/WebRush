import { useState, useCallback, useMemo } from 'react';
import { useDeferredValue } from 'react';
import type { Receipt, ReceiptCategory } from '../types';

export interface FilterState {
  query: string;
  category: ReceiptCategory | 'all';
  source: 'all' | 'spotify' | 'household';
  dateStart: string;
  dateEnd: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

const DEFAULT_FILTERS: FilterState = {
  query: '',
  category: 'all',
  source: 'all',
  dateStart: '',
  dateEnd: '',
  sortBy: 'date_desc',
};

export function useFilters(receipts: Receipt[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const deferredQuery = useDeferredValue(filters.query);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(f => ({ ...f, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const filtered = useMemo(() => {
    let result = receipts;

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(r => r.category === filters.category);
    }

    // Source filter
    if (filters.source !== 'all') {
      result = result.filter(r => r.source === filters.source);
    }

    // Date range
    if (filters.dateStart) {
      result = result.filter(r => r.timestamp >= filters.dateStart);
    }
    if (filters.dateEnd) {
      result = result.filter(r => r.timestamp <= filters.dateEnd + 'z');
    }

    // Text search (deferred)
    const q = deferredQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(r => {
        const searchable = [
          r.title,
          r.subtitle || '',
          r.category,
          String(r.metadata.artist || ''),
          String(r.metadata.album || ''),
          String(r.metadata.note || ''),
          String(r.metadata.subcategory || ''),
        ].join(' ').toLowerCase();
        return searchable.includes(q);
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_asc': return a.timestamp.localeCompare(b.timestamp);
        case 'date_desc': return b.timestamp.localeCompare(a.timestamp);
        case 'amount_desc': return (b.amount || 0) - (a.amount || 0);
        case 'amount_asc': return (a.amount || 0) - (b.amount || 0);
        default: return b.timestamp.localeCompare(a.timestamp);
      }
    });

    return result;
  }, [receipts, filters.category, filters.source, filters.dateStart, filters.dateEnd, filters.sortBy, deferredQuery]);

  const hasActiveFilters = filters.category !== 'all'
    || filters.source !== 'all'
    || filters.dateStart !== ''
    || filters.dateEnd !== ''
    || filters.query !== '';

  return {
    filters,
    filtered,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
}
