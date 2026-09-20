import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DataSummary, Receipt, RawSpotifyRecord, RawHouseholdRecord } from '../types';
import { normalizeSpotifyRecord, normalizeHouseholdRecord } from '../data/normalizers';

export type LoadStatus = 'idle' | 'loading' | 'done' | 'error';

interface DataState {
  summary: DataSummary | null;
  householdReceipts: Receipt[];
  spotifyReceipts: Receipt[];
  loadedChunks: number;
  totalChunks: number;
  status: LoadStatus;
  error: string | null;
}

const BASE = import.meta.env.BASE_URL || '/';

export function useData() {
  const [state, setState] = useState<DataState>({
    summary: null,
    householdReceipts: [],
    spotifyReceipts: [],
    loadedChunks: 0,
    totalChunks: 0,
    status: 'idle',
    error: null,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, status: 'loading' }));
    try {
      // Load summary first
      const summaryRes = await fetch(`${BASE}data/summary.json`);
      if (!summaryRes.ok) throw new Error('Failed to load summary');
      const summary: DataSummary = await summaryRes.json();

      // Load household data
      const hhRes = await fetch(`${BASE}data/household.json`);
      if (!hhRes.ok) throw new Error('Failed to load household data');
      const hhRaw: RawHouseholdRecord[] = await hhRes.json();
      const householdReceipts = hhRaw.map((r, i) => normalizeHouseholdRecord(r, i));

      // Load spotify index
      const idxRes = await fetch(`${BASE}data/spotify_index.json`);
      if (!idxRes.ok) throw new Error('Failed to load spotify index');
      const { totalChunks } = await idxRes.json();

      setState(s => ({
        ...s,
        summary,
        householdReceipts,
        totalChunks,
        status: 'loading',
      }));

      // Load spotify chunks progressively
      const allSpotify: Receipt[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkRes = await fetch(`${BASE}data/spotify_${i}.json`);
        if (!chunkRes.ok) continue;
        const chunk: RawSpotifyRecord[] = await chunkRes.json();
        const normalized = chunk.map((r, idx) => normalizeSpotifyRecord(r, i * 5000 + idx));
        allSpotify.push(...normalized);
        setState(s => ({
          ...s,
          spotifyReceipts: [...s.spotifyReceipts, ...normalized],
          loadedChunks: i + 1,
        }));
      }

      setState(s => ({ ...s, status: 'done' }));
    } catch (e) {
      setState(s => ({
        ...s,
        status: 'error',
        error: e instanceof Error ? e.message : 'Unknown error',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allReceipts = useMemo(() => {
    const combined = [...state.householdReceipts, ...state.spotifyReceipts];
    combined.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return combined;
  }, [state.householdReceipts, state.spotifyReceipts]);

  const progress = state.totalChunks > 0
    ? Math.round((state.loadedChunks / state.totalChunks) * 100)
    : 0;

  return {
    summary: state.summary,
    householdReceipts: state.householdReceipts,
    spotifyReceipts: state.spotifyReceipts,
    allReceipts,
    status: state.status,
    error: state.error,
    progress,
    reload: load,
  };
}
