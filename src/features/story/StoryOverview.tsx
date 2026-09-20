import type { DataSummary } from '../../types';
import { Music, Clock, Zap, Smartphone, DollarSign, SkipForward, Database } from 'lucide-react';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

interface StoryOverviewProps {
  summary: DataSummary;
}

function formatHours(h: number): string {
  if (h >= 24) return `${Math.round(h / 24)} days`;
  return `${h}h`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function StoryOverview({ summary }: StoryOverviewProps) {
  const sp = summary.spotify;
  const hh = summary.household;

  // Derived signals
  const topArtist = sp.topArtists[0];
  const peakHour = sp.hourlyActivity.reduce((a, b) => b.count > a.count ? b : a, { hour: 0, count: 0 });
  const peakHourLabel = peakHour.hour === 0 ? 'midnight' : peakHour.hour < 12 ? `${peakHour.hour}am` : peakHour.hour === 12 ? 'noon' : `${peakHour.hour - 12}pm`;
  const topPlatform = Object.entries(sp.platformCounts).sort((a, b) => b[1] - a[1])[0];
  const topPlatformPct = Math.round((topPlatform[1] / sp.totalRecords) * 100);
  const topHhCat = hh.topCategories[0];
  const topHhCatPct = Math.round((topHhCat.count / hh.totalRecords) * 100);
  const skipRate = Math.round((sp.skipCount / sp.totalRecords) * 100);

  const startYear = new Date(sp.dateStart).getFullYear();
  const endYear = new Date(sp.dateEnd).getFullYear();

  const signals = [
    {
      icon: <Music size={20} />,
      value: <AnimatedCounter value={sp.totalRecords} />,
      label: 'Music Moments',
      explanation: `${formatHours(sp.totalListeningHours)} of listening between ${startYear}–${endYear}`,
    },
    {
      icon: <Zap size={20} />,
      value: topArtist?.name || '—',
      label: 'Most Played Artist',
      explanation: `${formatNumber(topArtist?.count || 0)} plays · ${Math.round(((topArtist?.count || 0) / sp.totalRecords) * 100)}% of all streams`,
    },
    {
      icon: <Clock size={20} />,
      value: peakHourLabel,
      label: 'Peak Listening Hour',
      explanation: `${formatNumber(peakHour.count)} plays recorded at this hour across all years`,
    },
    {
      icon: <Smartphone size={20} />,
      value: topPlatform[0],
      label: 'Primary Platform',
      explanation: `${topPlatformPct}% of all streams came from this device`,
    },
    {
      icon: <DollarSign size={20} />,
      value: topHhCat?.name || '—',
      label: 'Top Spending Category',
      explanation: `${formatNumber(topHhCat?.count || 0)} transactions · ${topHhCatPct}% of all expenses`,
    },
    {
      icon: <SkipForward size={20} />,
      value: `${skipRate}%`,
      label: 'Skip Rate',
      explanation: `${formatNumber(sp.skipCount)} tracks skipped out of ${formatNumber(sp.totalRecords)} total`,
    },
  ];

  return (
    <section id="story" className="py-20 px-6 max-w-7xl mx-auto" aria-label="Story overview">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold mb-3">The Story So Far</p>
        <h2 className="text-3xl sm:text-4xl font-black text-1 mb-4 tracking-tight">
          Key Signals From Your Data
        </h2>
        <p className="text-2 max-w-xl font-medium">
          Every number below is derived directly from your dataset — no fabrication, no estimation.
        </p>
      </div>

      {/* Signal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map(s => (
          <div
            key={s.label}
            className="card p-6 border-t-2 border-t-[var(--accent)] hover:-translate-y-1 transition-transform bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-surface)]"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 bg-[var(--accent-dim)] text-[var(--accent)] shadow-[0_0_12px_var(--accent-dim)]">
              {s.icon}
            </div>
            <p className="text-3xl font-black num mb-2 text-1 break-all tracking-tight">{s.value}</p>
            <p className="text-sm font-bold text-2 mb-2">{s.label}</p>
            <p className="text-sm text-3 leading-relaxed">{s.explanation}</p>
            <p className="label mt-4 text-[10px] text-[var(--accent-2)]">DERIVED · Real data</p>
          </div>
        ))}
      </div>

      {/* Dataset note */}
      <div className="mt-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] flex items-start gap-4">
        <div className="bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-strong)]">
          <Database size={16} className="text-3" />
        </div>
        <div>
          <p className="text-xs font-bold text-1 mb-1 tracking-wide">Dataset Sources</p>
          <p className="text-xs text-3 leading-relaxed">
            <strong className="text-2 font-medium">spotify_history.csv</strong> — {formatNumber(sp.totalRecords)} records,{' '}
            {new Date(sp.dateStart).toLocaleDateString()} – {new Date(sp.dateEnd).toLocaleDateString()}
            {' '}·{' '}
            <strong className="text-2 font-medium">Daily Household Transactions.csv</strong> — {formatNumber(hh.totalRecords)} records
          </p>
        </div>
      </div>
    </section>
  );
}
