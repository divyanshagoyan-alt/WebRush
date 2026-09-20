import { ChevronDown, Database } from 'lucide-react';
import type { DataSummary } from '../../types';
import { DataConstellation } from '../../components/graph/DataConstellation';

interface CoverProps {
  summary: DataSummary;
  onExplore: () => void;
  onViewDataset: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return n.toLocaleString('en-IN');
  return String(n);
}

export function Cover({ summary, onExplore, onViewDataset }: CoverProps) {
  const startDate = new Date(summary.spotify.dateStart);
  const endDate = new Date(summary.spotify.dateEnd);
  const years = endDate.getFullYear() - startDate.getFullYear();

  const stats = [
    { value: formatNumber(summary.spotify.totalRecords + summary.household.totalRecords), label: 'Total Moments' },
    { value: `${years}+`, label: 'Years of Story' },
    { value: formatNumber(Math.round(summary.spotify.totalListeningHours)), label: 'Hours of Music' },
    { value: formatNumber(summary.household.totalRecords), label: 'Financial Receipts' },
  ];

  return (
    <section
      id="cover"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Cover screen"
    >
      {/* Background constellation (will be updated for light mode) */}
      <DataConstellation summary={summary} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel mb-8 text-xs text-2 font-medium tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent)]" />
          WEBRUSH · 6-HOUR HACKATHON
        </div>

        {/* Headline */}
        <h1 className="text-6xl sm:text-8xl lg:text-[8rem] font-black tracking-tighter leading-none mb-10 flex flex-col items-start justify-center gap-2 sm:gap-4 max-w-fit mx-auto w-full">
          <span className="text-[var(--text-1)] drop-shadow-md">YOUR LIFE,</span>
          <div className="flex items-center justify-center gap-4 sm:gap-6 pl-12 sm:pl-32 lg:pl-48">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-1)] to-[var(--text-3)]">IN RECEIPTS.</span>
            <span className="text-[var(--text-1)] text-5xl sm:text-7xl lg:text-8xl animate-bounce" aria-hidden="true">🧾</span>
          </div>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--accent-2)] max-w-xl mx-auto leading-relaxed mb-4 font-medium tracking-wide">
          Every moment leaves a trace.
        </p>
        <p className="text-sm text-3 max-w-lg mx-auto mb-12">
          Turn scattered digital moments into a story — 
          {' '}<span className="text-2 font-medium">{formatNumber(summary.spotify.totalRecords).toLocaleString()}</span> Spotify plays + <span className="text-2 font-medium">{formatNumber(summary.household.totalRecords)}</span> financial transactions, 
          all from real data.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 max-w-2xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-black text-1 num">{s.value}</p>
              <p className="label mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onExplore} className="btn btn-primary px-8 py-3 text-sm">
            EXPLORE THE STORY →
          </button>
          <button onClick={onViewDataset} className="btn btn-ghost">
            <Database size={14} />
            View Dataset
          </button>
        </div>

        {/* Scroll cue */}
        <div className="mt-16 flex flex-col items-center gap-2 text-3">
          <ChevronDown size={16} className="animate-bounce" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-widest">Scroll to explore</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-10 left-0 right-0 text-center">
        <p className="label">
          Submitted &amp; Created by{' '}
          <span className="text-2 font-black">Divyansh Agarwal</span>
          {' '}·{' '}LNCT Group of Colleges
        </p>
      </footer>
    </section>
  );
}
