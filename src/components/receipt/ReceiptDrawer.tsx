import { Drawer } from '../ui/Drawer';
import { CategoryBadge } from '../ui/CategoryBadge';
import type { Receipt } from '../../types';
import { Clock, Music } from 'lucide-react';

interface ReceiptDrawerProps {
  receipt: Receipt | null;
  onClose: () => void;
  relatedReceipts?: Receipt[];
  onRelatedClick?: (r: Receipt) => void;
}

function formatDateTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch { return ts; }
}

function FieldRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value == null || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-[var(--border)]">
      <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-sm text-[var(--text-primary)] text-right break-all">{display}</span>
    </div>
  );
}

function msToMinSec(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s}s`;
}

export function ReceiptDrawer({ receipt: r, onClose, relatedReceipts = [], onRelatedClick }: ReceiptDrawerProps) {
  if (!r) return <Drawer open={false} onClose={onClose}>{null}</Drawer>;

  const isSpotify = r.source === 'spotify';
  const isIncome = r.category === 'income' || r.metadata.type === 'Income';
  const isTransfer = r.metadata.type === 'Transfer-Out';

  return (
    <Drawer open={!!r} onClose={onClose} title="Receipt Detail">
      <div className="px-6 py-5 space-y-6">
        {/* Hero */}
        <div className="space-y-2">
          <CategoryBadge category={r.category} />
          <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{r.title}</h1>
          {r.subtitle && <p className="text-sm text-[var(--text-secondary)]">{r.subtitle}</p>}
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Clock size={12} />
            {formatDateTime(r.timestamp)}
          </div>
        </div>

        {/* Amount (household) */}
        {r.amount != null && (
          <div className={`rounded-xl p-4 border ${
            isIncome ? 'border-[var(--positive)] bg-[var(--positive-dim)]' :
            isTransfer ? 'border-[var(--warning)] bg-[var(--warning-dim)]' :
            'border-[var(--danger)] bg-[var(--danger-dim)]'
          }`}>
            <p className="text-xs text-[var(--text-secondary)] mb-1">
              {isIncome ? 'Income' : isTransfer ? 'Transfer Out' : 'Expense'}
            </p>
            <p className={`text-3xl font-bold num-display ${
              isIncome ? 'text-[var(--positive)]' : isTransfer ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
            }`}>
              ₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{r.currency || 'INR'}</p>
          </div>
        )}

        {/* Spotify play info */}
        {isSpotify && r.metadata.msPlayed != null && (
          <div className="rounded-xl p-4 border border-[var(--accent-purple)] bg-[var(--accent-purple-dim)]">
            <div className="flex items-center gap-2 mb-2">
              <Music size={14} className="text-[var(--accent-purple)]" />
              <span className="text-xs text-[var(--accent-purple)] font-semibold uppercase tracking-wide">Play Record</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] num-display">
              {msToMinSec(Number(r.metadata.msPlayed))}
            </p>
            <div className="flex gap-3 mt-2">
              {r.metadata.skipped && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--warning-dim)] text-[var(--warning)]">Skipped</span>
              )}
              {r.metadata.shuffle && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)]">Shuffle</span>
              )}
              {r.metadata.reasonEnd && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-tertiary)]">
                  ended: {String(r.metadata.reasonEnd)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Fields */}
        <section aria-label="Record details">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Details</h3>
          <div>
            {isSpotify ? (
              <>
                <FieldRow label="Track" value={r.title} />
                <FieldRow label="Artist" value={String(r.metadata.artist || '')} />
                <FieldRow label="Album" value={String(r.metadata.album || '')} />
                <FieldRow label="Platform" value={String(r.metadata.platform || '')} />
                <FieldRow label="Duration played" value={msToMinSec(Number(r.metadata.msPlayed || 0))} />
                <FieldRow label="Shuffle" value={Boolean(r.metadata.shuffle)} />
                <FieldRow label="Skipped" value={Boolean(r.metadata.skipped)} />
                <FieldRow label="Reason started" value={String(r.metadata.reasonStart || '')} />
                <FieldRow label="Reason ended" value={String(r.metadata.reasonEnd || '')} />
              </>
            ) : (
              <>
                <FieldRow label="Category" value={String(r.metadata.category || '')} />
                <FieldRow label="Subcategory" value={String(r.metadata.subcategory || '')} />
                <FieldRow label="Note" value={String(r.metadata.note || '')} />
                <FieldRow label="Payment mode" value={String(r.metadata.mode || '')} />
                <FieldRow label="Transaction type" value={String(r.metadata.type || '')} />
                <FieldRow label="Currency" value={String(r.metadata.currency || 'INR')} />
              </>
            )}
          </div>
        </section>

        {/* Raw data (collapsed) */}
        <section aria-label="Raw data">
          <details className="group">
            <summary className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest cursor-pointer hover:text-[var(--text-secondary)] transition-colors list-none flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Raw Record
            </summary>
            <pre className="mt-3 text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-primary)] rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(r.original, null, 2)}
            </pre>
          </details>
        </section>

        {/* Related records */}
        {relatedReceipts.length > 0 && (
          <section aria-label="Connected moments">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
              Connected Moments
              <span className="text-[var(--text-tertiary)] font-normal">({relatedReceipts.length})</span>
            </h3>
            <div className="space-y-2">
              {relatedReceipts.slice(0, 5).map(rel => (
                <button
                  key={rel.id}
                  onClick={() => onRelatedClick?.(rel)}
                  className="w-full text-left card glass-panel p-4 hover:border-[var(--accent)] hover:shadow-[0_4px_12px_var(--accent-dim)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={rel.category} size="sm" />
                    <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate transition-colors">
                      {rel.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                    Same date · {rel.source === 'spotify' ? '🎵 Music' : '💰 Finance'}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Record ID */}
        <p className="text-[10px] text-[var(--text-tertiary)] font-mono border-t border-[var(--border)] pt-4">
          SOURCE: {r.source.toUpperCase()} · ID: {r.sourceId}
        </p>
      </div>
    </Drawer>
  );
}
