import { lazy, Suspense } from 'react';
import type { DataSummary } from '../../types';

const ConnectionGraph = lazy(() =>
  import('../../components/graph/ConnectionGraph').then(m => ({ default: m.ConnectionGraph }))
);

interface ConnectionsProps {
  summary: DataSummary;
}

export function Connections({ summary }: ConnectionsProps) {
  const topArtists = summary.spotify.topArtists.slice(0, 10);
  const topCategories = summary.household.topCategories.slice(0, 5);

  return (
    <section id="connections" className="py-20 px-6 max-w-7xl mx-auto" aria-label="Connection graph">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold mb-3">Connection Engine</p>
        <h2 className="text-3xl sm:text-4xl font-black text-1 mb-4 tracking-tight">
          How Your Moments Connect
        </h2>
        <p className="text-2 max-w-2xl font-medium">
          Each node represents an artist or financial category from your actual dataset. Edges show relationships 
          detected by deterministic rules — same date, temporal proximity, frequency similarity.
        </p>
      </div>

      {/* Graph */}
      <div className="card glass-panel p-2 mb-6">
        <Suspense fallback={
          <div className="h-[480px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-3">Initializing connection graph…</p>
            </div>
          </div>
        }>
          <ConnectionGraph summary={summary} />
        </Suspense>
      </div>

      {/* Accessible text alternative */}
      <details className="card glass-panel p-6 hover:bg-[var(--bg-elevated)] transition-colors">
        <summary className="text-sm font-bold text-1 cursor-pointer transition-colors list-none flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">📋</span> Accessible Text Alternative (Screen Reader)
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-3 mb-2 font-bold">Top Artists (by play count)</h3>
            <div className="space-y-1">
              {topArtists.map((a, i) => (
                <p key={a.name} className="text-sm text-2">
                  {i + 1}. {a.name} — {a.count.toLocaleString('en-IN')} plays
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-3 mb-2 font-bold">Top Expense Categories</h3>
            <div className="space-y-1">
              {topCategories.map((c, i) => (
                <p key={c.name} className="text-sm text-2">
                  {i + 1}. {c.name} — {c.count.toLocaleString('en-IN')} transactions
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-3 mb-2 font-bold">Connection Rules Active</h3>
            <ul className="text-sm text-2 space-y-1 list-none pl-0">
              <li>- Same date co-occurrence (Spotify + Household records)</li>
              <li>- Temporal proximity (records within 30 minutes)</li>
              <li>- Artist repeat frequency within 7-day windows</li>
              <li>- Similar listening frequency between artists</li>
              <li>- Category cluster relationships</li>
            </ul>
          </div>
        </div>
      </details>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 text-sm text-2 font-medium">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent-dim)]" aria-hidden="true" />
          Artist node (size = play count)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--warning)] rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.2)]" aria-hidden="true" />
          Category node
        </span>
        <span className="flex items-center gap-2">
          <span className="w-8 h-[2px] bg-[var(--border-strong)]" aria-hidden="true" />
          Frequency connection
        </span>
      </div>
    </section>
  );
}
