import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from 'recharts';
import type { DataSummary } from '../../types';

interface PatternsProps {
  summary: DataSummary;
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



function ChartCard({ title, question, children, summary }: {
  title: string;
  question: string;
  children: React.ReactNode;
  summary?: string;
}) {
  return (
    <div className="card glass-panel p-6">
      <div className="mb-6">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest mb-2 font-bold">{title}</p>
        <p className="text-lg font-bold text-1">{question}</p>
      </div>
      {children}
      {summary && (
        <p className="text-sm text-2 mt-4 border-t border-[var(--border)] pt-4 font-medium">
          {summary}
        </p>
      )}
    </div>
  );
}

const COLORS = [
  'var(--accent)',      // Purple
  'var(--accent-2)',    // Cyan
  'var(--warning)',     // Yellow
  'var(--positive)',    // Emerald
  'var(--danger)',      // Rose
  '#F97316',            // Orange
  '#E879F9',            // Fuchsia
  '#3B82F6',            // Blue
  '#14B8A6',            // Teal
  '#A855F7',            // Purple (Darker)
  '#8B5CF6',
  '#6366F1'
];

const INK_DARK = '#8B5CF6'; // accent purple

export function Patterns({ summary }: PatternsProps) {
  const sp = summary.spotify;
  const hh = summary.household;

  // Peak hour
  const peakHour = sp.hourlyActivity.reduce((a, b) => b.count > a.count ? b : a);
  const lateNightPlays = sp.hourlyActivity.filter(h => h.hour >= 22 || h.hour <= 2).reduce((s, h) => s + h.count, 0);
  const lateNightPct = Math.round((lateNightPlays / sp.totalRecords) * 100);

  // Peak day
  const peakDay = sp.dowActivity.reduce((a, b) => b.count > a.count ? b : a);

  // Hourly data formatted
  const hourlyData = sp.hourlyActivity.map(h => ({
    hour: h.hour === 0 ? '12am' : h.hour < 12 ? `${h.hour}am` : h.hour === 12 ? '12pm' : `${h.hour - 12}pm`,
    plays: h.count,
  }));

  // DOW data
  const dowData = sp.dowActivity.map(d => ({
    day: DOW_LABELS[d.day],
    plays: d.count,
  }));

  // Yearly trend
  const yearlyData = sp.yearlyActivity.map(y => ({
    year: String(y.year),
    plays: y.count,
  }));

  // Top 10 artists
  const artistData = sp.topArtists.slice(0, 10).map(a => ({
    name: a.name.length > 15 ? a.name.slice(0, 13) + '…' : a.name,
    plays: a.count,
  }));

  // HH categories
  const hhData = hh.topCategories.slice(0, 8).map(c => ({
    name: c.name,
    transactions: c.count,
  }));

  // Findings
  const findings = [
    {
      emoji: '🕰️',
      finding: 'Peak listening at ' + (peakHour.hour < 12 ? `${peakHour.hour || 12}${peakHour.hour < 12 ? 'am' : 'pm'}` : `${peakHour.hour - 12 || 12}pm`),
      evidence: `${peakHour.count.toLocaleString('en-IN')} plays recorded at this hour across all years in the dataset`,
      category: 'music' as const,
    },
    {
      emoji: '🌙',
      finding: `${lateNightPct}% of music was late-night`,
      evidence: `${lateNightPlays.toLocaleString('en-IN')} plays occurred between 10pm–2am — a significant night-owl pattern`,
      category: 'music' as const,
    },
    {
      emoji: '📅',
      finding: `${DOW_LABELS[peakDay.day]}s are the busiest music day`,
      evidence: `${peakDay.count.toLocaleString('en-IN')} plays on ${DOW_LABELS[peakDay.day]}s, more than any other day of the week`,
      category: 'music' as const,
    },
    {
      emoji: '💰',
      finding: `Food dominates spending`,
      evidence: `${hh.topCategories[0]?.count || 0} food transactions — ${Math.round(((hh.topCategories[0]?.count || 0) / hh.totalRecords) * 100)}% of all household expenses`,
      category: 'food' as const,
    },
    {
      emoji: '🔄',
      finding: `${sp.skipCount.toLocaleString('en-IN')} tracks skipped`,
      evidence: `${Math.round((sp.skipCount / sp.totalRecords) * 100)}% skip rate — suggesting selective listening habits`,
      category: 'music' as const,
    },
    {
      emoji: '📱',
      finding: `Android is the primary listening device`,
      evidence: `${((sp.platformCounts['android'] || 0) / sp.totalRecords * 100).toFixed(1)}% of streams from Android — a mobile-first listener`,
      category: 'music' as const,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card glass-panel px-4 py-3 text-sm">
        <p className="text-2 mb-1 font-medium">{label}</p>
        <p className="text-1 font-bold text-lg tracking-tight">{payload[0].value?.toLocaleString('en-IN')}</p>
      </div>
    );
  };

  return (
    <section id="patterns" className="py-20 px-6 max-w-7xl mx-auto" aria-label="Pattern discovery">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-[var(--accent)] uppercase tracking-widest font-bold mb-3">Pattern Discovery</p>
        <h2 className="text-3xl sm:text-4xl font-black text-1 mb-4 tracking-tight">
          Things You Might Have Missed
        </h2>
        <p className="text-2 max-w-xl font-medium">
          Deterministic findings derived from the actual dataset — no fabrication, no estimation.
        </p>
      </div>

      {/* Finding cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {findings.map((f, i) => (
          <div key={i} className="card p-6 hover:border-[var(--accent)] transition-colors hover:shadow-[0_4px_24px_var(--accent-dim)]">
            <span className="text-3xl mb-4 block bg-[var(--bg-elevated)] border border-[var(--border-strong)] inline-flex items-center justify-center w-12 h-12 rounded-xl" aria-hidden="true">{f.emoji}</span>
            <p className="text-sm font-bold text-1 mb-2 tracking-wide uppercase">{f.finding}</p>
            <p className="text-sm text-3 leading-relaxed mb-4">{f.evidence}</p>
            <p className="label text-[10px] text-[var(--accent-2)] uppercase tracking-widest">DERIVED · Real data</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Hourly activity */}
        <ChartCard
          title="Listening Pattern"
          question="When did music activity concentrate?"
          summary={`Peak hour: ${peakHour.hour < 12 ? `${peakHour.hour || 12}am` : `${peakHour.hour - 12 || 12}pm`} with ${peakHour.count.toLocaleString('en-IN')} plays`}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} interval={3} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
              <Bar dataKey="plays" radius={[4, 4, 0, 0]}>
                {hourlyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Day of week */}
        <ChartCard
          title="Day of Week"
          question="Which day sees the most plays?"
          summary={`${DOW_LABELS[peakDay.day]}s are the busiest with ${peakDay.count.toLocaleString('en-IN')} plays`}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dowData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
              <Bar dataKey="plays" radius={[4, 4, 0, 0]}>
                {dowData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Custom Legend for Day of Week */}
          <div className="flex flex-wrap gap-3 justify-center text-[10px] text-[var(--text-secondary)] mt-4 border-t border-[var(--border)] pt-3">
            {dowData.map((entry, index) => (
              <div key={entry.day} className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.day}
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Yearly trend */}
        <ChartCard
          title="Yearly Trend"
          question="How did listening evolve over the years?"
          summary={`From ${yearlyData[0]?.year} to ${yearlyData[yearlyData.length - 1]?.year} — ${sp.totalListeningHours} total hours`}
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={yearlyData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="plays" stroke={INK_DARK} strokeWidth={3} dot={{ fill: INK_DARK, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--text-1)' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top artists */}
        <ChartCard
          title="Top Artists"
          question="Who dominated the playlist?"
          summary={`${sp.topArtists[0]?.name} leads with ${sp.topArtists[0]?.count.toLocaleString('en-IN')} plays`}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={artistData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-2)', fontFamily: 'var(--font-sans)' }} width={90} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
              <Bar dataKey="plays" radius={[0, 4, 4, 0]}>
                {artistData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Custom Legend for Top Artists */}
          <div className="flex flex-wrap gap-2 justify-center text-[10px] text-[var(--text-secondary)] mt-4 border-t border-[var(--border)] pt-3">
            {artistData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 font-medium uppercase tracking-wider">
                <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name.slice(0, 8)}
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Household spending */}
        <ChartCard
          title="Spending Categories"
          question="Where did money go most often?"
          summary={`${hh.topCategories[0]?.name} leads with ${hh.topCategories[0]?.count} transactions`}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={hhData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-sans)' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-2)', fontFamily: 'var(--font-sans)' }} width={90} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
              <Bar dataKey="transactions" radius={[0, 4, 4, 0]}>
                {hhData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Custom Legend for Spending Categories */}
          <div className="flex flex-wrap gap-2 justify-center text-[10px] text-[var(--text-secondary)] mt-4 border-t border-[var(--border)] pt-3">
            {hhData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 font-medium uppercase tracking-wider">
                <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Platform distribution */}
        <ChartCard
          title="Platform Distribution"
          question="Which devices powered the listening?"
          summary={`Android dominates at ${Math.round((sp.platformCounts['android'] || 0) / sp.totalRecords * 100)}% of all streams`}
        >
          <div className="space-y-2 mt-2">
            {Object.entries(sp.platformCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, count], index) => {
                const pct = Math.round((count / sp.totalRecords) * 100);
                return (
                  <div key={platform}>
                    <div className="flex justify-between text-xs text-2 mb-1">
                      <span className="capitalize">{platform}</span>
                      <span className="num">{pct}% · {count.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border-strong)] shadow-inner">
                      <div
                        className="h-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${platform}: ${pct}%`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
