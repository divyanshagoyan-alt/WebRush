import { useState, useMemo } from 'react';
import type { DataSummary } from '../../types';

interface TimelineProps {
  summary: DataSummary;
}

type ZoomLevel = 'decade' | 'year' | 'month';

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export function Timeline({ summary }: TimelineProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const sp = summary.spotify;
  const hh = summary.household;

  // Build year-level data
  const yearData = useMemo(() => {
    return sp.yearlyActivity.map(y => {
      const hhYear = hh.monthlyActivity
        .filter(m => m.month.startsWith(String(y.year)))
        .reduce((s, m) => s + m.count, 0);
      return { year: y.year, spotifyCount: y.count, hhCount: hhYear };
    });
  }, [sp.yearlyActivity, hh.monthlyActivity]);

  // Build month-level data for selected year
  const monthData = useMemo(() => {
    if (!selectedYear) return [];
    const spMonths = sp.monthlyActivity.filter(m => m.month.startsWith(String(selectedYear)));
    const hhMonths = hh.monthlyActivity.filter(m => m.month.startsWith(String(selectedYear)));
    const allMonths = new Set([...spMonths.map(m => m.month), ...hhMonths.map(m => m.month)]);
    return Array.from(allMonths).sort().map(month => ({
      month,
      spotifyCount: spMonths.find(m => m.month === month)?.count || 0,
      hhCount: hhMonths.find(m => m.month === month)?.count || 0,
    }));
  }, [selectedYear, sp.monthlyActivity, hh.monthlyActivity]);

  const maxSpotify = Math.max(...yearData.map(y => y.spotifyCount));
  const maxHH = Math.max(...yearData.map(y => y.hhCount), 1);

  // Story chapters
  const chapters = [
    { year: 2013, title: 'The Beginning', desc: 'First Spotify streams recorded' },
    { year: 2015, title: 'The Growth', desc: 'Listening activity accelerates' },
    { year: 2018, title: 'The Financial Era', desc: 'Household tracking begins' },
    { year: 2021, title: 'The Shift', desc: 'Platform patterns change' },
    { year: 2024, title: 'The Present', desc: 'Final recorded moments' },
  ];

  return (
    <section id="timeline" className="py-20 px-6 max-w-7xl mx-auto" aria-label="Interactive timeline">
      <div className="mb-10">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold mb-3">Timeline</p>
        <h2 className="text-3xl sm:text-4xl font-black text-1 mb-4 tracking-tight">
          The Journey Over Time
        </h2>
        <p className="text-2 max-w-xl font-medium">
          Eleven years of digital moments. Click a year to drill down. Music on top, finances below.
        </p>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-3 font-medium uppercase tracking-widest">Zoom:</span>
        {(['decade', 'year', 'month'] as ZoomLevel[]).map(z => (
          <button
            key={z}
            onClick={() => { setZoom(z); if (z !== 'month') setSelectedYear(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-colors border ${
              zoom === z ? 'bg-[var(--accent)] text-[#FFF] border-[var(--accent)] shadow-[0_0_12px_var(--accent-dim)]' : 'bg-[var(--bg-surface)] text-2 border-[var(--border)] hover:border-[var(--border-strong)]'
            }`}
            aria-pressed={zoom === z}
          >
            {z}
          </button>
        ))}
        {selectedYear && (
          <button
            onClick={() => { setSelectedYear(null); setZoom('year'); }}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase text-2 border border-[var(--border)] hover:text-1 transition-colors bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]"
          >
            ← Back to all years
          </button>
        )}
      </div>

      {/* Chapter markers */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 -mx-1 px-1 scrollbar-hide">
        {chapters.filter(c => yearData.some(y => y.year >= c.year)).map(c => (
          <button
            key={c.year}
            onClick={() => { setSelectedYear(c.year); setZoom('month'); }}
            className="flex-shrink-0 text-left px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition-all shadow-inner"
          >
            <p className="text-[10px] text-[var(--accent)] font-bold mb-1">{c.year}</p>
            <p className="text-sm font-black text-1 uppercase tracking-tight mb-1">{c.title}</p>
            <p className="text-xs text-2">{c.desc}</p>
          </button>
        ))}
      </div>

      {/* Year-level timeline */}
      {!selectedYear && (
        <div className="card glass-panel p-6 overflow-x-auto">
          <div className="flex items-end gap-1" style={{ minWidth: yearData.length * 52 }}>
            {yearData.map(y => {
              const spH = Math.max(4, (y.spotifyCount / maxSpotify) * 140);
              const hhH = Math.max(2, (y.hhCount / maxHH) * 60);
              return (
                <div key={y.year} className="flex flex-col items-center gap-1 flex-shrink-0 group" style={{ width: 48 }}>
                  {/* Spotify bar */}
                  <div className="w-full flex flex-col items-center gap-1">
                    <span className="text-[10px] text-3 num font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {y.spotifyCount > 999 ? `${(y.spotifyCount / 1000).toFixed(1)}k` : y.spotifyCount}
                    </span>
                    <button
                      className="w-full rounded-t-sm hover:opacity-100 transition-opacity shadow-[0_0_8px_var(--accent-dim)]"
                      style={{ height: spH, background: 'var(--accent)', opacity: 0.9 }}
                      onClick={() => { setSelectedYear(y.year); setZoom('month'); }}
                      aria-label={`${y.year}: ${y.spotifyCount.toLocaleString()} Spotify plays. Click to drill down.`}
                      title={`${y.year}: ${y.spotifyCount.toLocaleString('en-IN')} Spotify plays`}
                    />
                  </div>

                  {/* Year label */}
                  <span className="text-[11px] text-1 font-bold num my-1">{y.year}</span>

                  {/* HH bar */}
                  {y.hhCount > 0 && (
                    <div
                      className="w-full rounded-b-sm shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                      style={{ height: hhH, background: 'var(--warning)', opacity: 0.8 }}
                      aria-label={`${y.year}: ${y.hhCount} household transactions`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex gap-6 text-xs text-2 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--accent)] rounded-sm" />
              Spotify plays (top)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--warning)] rounded-sm" />
              Household transactions (bottom)
            </span>
            <span className="text-3 ml-auto">Click a bar to drill into months</span>
          </div>
        </div>
      )}

      {/* Month-level timeline */}
      {selectedYear && monthData.length > 0 && (
        <div className="card glass-panel p-6 overflow-x-auto">
          <h3 className="text-sm font-bold text-1 mb-6 uppercase tracking-widest">{selectedYear} — Month by Month</h3>
          <div className="flex items-end gap-1" style={{ minWidth: monthData.length * 60 }}>
            {monthData.map(m => {
              const maxSp = Math.max(...monthData.map(x => x.spotifyCount), 1);
              const maxHh = Math.max(...monthData.map(x => x.hhCount), 1);
              const spH = Math.max(4, (m.spotifyCount / maxSp) * 120);
              const hhH = Math.max(2, (m.hhCount / maxHh) * 50);
              return (
                <div key={m.month} className="flex flex-col items-center gap-1 flex-shrink-0 group" style={{ width: 56 }}>
                  <span className="text-[10px] text-3 num font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.spotifyCount > 999 ? `${(m.spotifyCount / 1000).toFixed(1)}k` : m.spotifyCount}
                  </span>
                  <div
                    className="w-full rounded-t-sm shadow-[0_0_8px_var(--accent-dim)]"
                    style={{ height: spH, background: 'var(--accent)', opacity: 0.9 }}
                    role="img"
                    aria-label={`${formatMonthLabel(m.month)}: ${m.spotifyCount} Spotify plays`}
                  />
                  <span className="text-[10px] text-2 font-bold uppercase my-1">{formatMonthLabel(m.month).split(' ')[0]}</span>
                  {m.hhCount > 0 && (
                    <div
                      className="w-full rounded-b-sm shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                      style={{ height: hhH, background: 'var(--warning)', opacity: 0.8 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
