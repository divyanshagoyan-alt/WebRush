import type { DataSummary } from '../../types';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

interface FinalReflectionProps {
  summary: DataSummary;
}

export function FinalReflection({ summary }: FinalReflectionProps) {
  const sp = summary.spotify;
  const hh = summary.household;
  const startDate = new Date(sp.dateStart);
  const endDate = new Date(sp.dateEnd);

  const topArtist = sp.topArtists[0];
  const topCat = hh.topCategories[0];
  const peakYear = sp.yearlyActivity.reduce((a, b) => b.count > a.count ? b : a);

  return (
    <section id="reflection" className="py-24 px-6" aria-label="Final reflection">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold mb-8">Final Reflection</p>

        <blockquote className="text-2xl sm:text-3xl font-light text-2 leading-relaxed mb-4 italic tracking-wide">
          "Every receipt is small on its own."
        </blockquote>
        <blockquote className="text-2xl sm:text-4xl font-black text-1 leading-relaxed mb-12 tracking-tight">
          "But together, they reveal a pattern."
        </blockquote>

        {/* Dynamic summary */}
        <div className="card glass-panel p-8 text-left mb-8 shadow-2xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)]">
          <p className="text-xs text-[var(--accent)] uppercase tracking-widest mb-4 font-bold">Your Story, In Data</p>
          <p className="text-base text-2 leading-loose font-medium">
            Across{' '}
            <strong className="text-1">
              <AnimatedCounter value={sp.totalRecords + hh.totalRecords} /> recorded moments
            </strong>{' '}
            between{' '}
            <strong className="text-1">
              {startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </strong>{' '}
            and{' '}
            <strong className="text-1">
              {endDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </strong>,{' '}
            <strong className="text-1">Music</strong> was the most frequent activity with{' '}
            <strong className="text-1"><AnimatedCounter value={sp.totalRecords} /> Spotify streams</strong>.{' '}
            The strongest musical presence belongs to{' '}
            <strong className="text-1">{topArtist?.name}</strong> with{' '}
            <AnimatedCounter value={topArtist?.count || 0} /> plays.{' '}
            {topCat && (
              <>
                On the financial side,{' '}
                <strong className="text-1">{topCat.name}</strong> dominated with{' '}
                <AnimatedCounter value={topCat.count} /> transactions.{' '}
              </>
            )}
            The highest-activity year was{' '}
            <strong className="text-1">{peakYear.year}</strong> with{' '}
            <AnimatedCounter value={peakYear.count} /> recorded musical moments.
          </p>
        </div>

        <p className="text-xs text-3 mb-12 font-bold uppercase tracking-widest">
          All statements above are derived from the actual uploaded dataset. No fabrication.
        </p>

        {/* Credits */}
        <div className="border-t border-[var(--border)] pt-12">
          <p className="text-3xl mb-4" aria-hidden="true">🧾</p>
          <h2 className="text-xl font-black text-1 mb-2 tracking-tighter">YOUR LIFE, IN RECEIPTS</h2>
          <p className="text-sm text-[var(--accent-2)] mb-6 font-medium">Every moment leaves a trace.</p>

          <div className="space-y-2 text-sm text-2">
            <p>Submitted &amp; Created by <strong className="text-1">Divyansh Agarwal</strong></p>
            <p><strong className="text-1">LNCT Group of Colleges</strong></p>
            <p className="text-xs text-[var(--accent)] mt-2 font-bold tracking-widest uppercase">WebRush — 6-Hour Hackathon</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-[10px] text-3 uppercase font-bold tracking-widest">
            <span>React 18</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>Vite</span>
            <span>·</span>
            <span>Tailwind CSS</span>
            <span>·</span>
            <span>Recharts</span>
            <span>·</span>
            <span>D3</span>
            <span>·</span>
            <span>Frontend only</span>
          </div>

          <p className="mt-8 text-[10px] text-2 font-bold uppercase border border-[var(--border-strong)] inline-block px-4 py-2 rounded-xl bg-[var(--bg-surface)] shadow-inner tracking-widest">
            DATASET SOURCE: spotify_history.csv + Daily Household Transactions.csv
          </p>
        </div>
      </div>
    </section>
  );
}
