import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { Receipt } from '../../types';
import { CategoryBadge, CATEGORY_CONFIG } from '../ui/CategoryBadge';
import { Music, TrendingUp, Repeat, Barcode } from 'lucide-react';

interface ReceiptCardProps {
  receipt: Receipt;
  onClick: (r: Receipt) => void;
  highlight?: string;
}

function formatDate(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts.split('T')[0];
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return ts.split('T')[0] || ts;
  }
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[var(--accent)] text-white px-1 rounded">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center text-[11px] font-mono leading-relaxed">
      <span className="text-[var(--text-3)] font-medium uppercase">{label}</span>
      <span className="text-[var(--text-1)] font-bold text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

export const ReceiptCard = memo(function ReceiptCard({ receipt: r, onClick, highlight = '' }: ReceiptCardProps) {
  const isSpotify = r.source === 'spotify';
  const isIncome = r.category === 'income' || r.metadata.type === 'Income';
  const isTransfer = r.metadata.type === 'Transfer-Out';

  return (
    <motion.article
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative p-4 transition-all duration-300 flex flex-col h-full cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] hover:bg-[var(--bg-muted)]"
      onClick={() => onClick(r)}
      onKeyDown={e => e.key === 'Enter' && onClick(r)}
      tabIndex={0}
      role="button"
      aria-label={`Receipt: ${r.title}`}
      aria-keyshortcuts="Enter"
    >
      {/* Brand Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-3)]">
          {isSpotify ? 'SPOTIFY · STREAM' : 'HOUSEHOLD · TRX'}
        </span>
        <div className="text-[var(--text-4)]">
          {(() => {
            if (isSpotify) return <Music size={14} />;
            if (isIncome) return <TrendingUp size={14} />;
            if (isTransfer) return <Repeat size={14} />;
            const Icon = CATEGORY_CONFIG[r.category]?.Icon || CATEGORY_CONFIG.other.Icon;
            return <Icon size={14} />;
          })()}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-[var(--text-1)] leading-tight mb-1.5 font-sans break-words">
          {highlightText(r.title, highlight)}
        </h3>
        {r.subtitle && (
          <p className="text-sm text-[var(--text-2)] font-medium font-sans break-words">
            {highlightText(r.subtitle, highlight)}
          </p>
        )}
      </div>

      <div className="border-b-2 border-dashed border-[var(--border)] w-full mb-4" />

      {/* Details List */}
      <div className="flex-1 space-y-1.5 mb-5">
        {isSpotify ? (
          <>
            <DetailRow label="DURATION" value={`${Math.round(Number(r.metadata.msPlayed) / 60000)} MIN`} />
            <DetailRow label="SKIPPED" value={r.metadata.skipped ? 'YES' : 'NO'} />
            <DetailRow label="SHUFFLE" value={r.metadata.shuffle ? 'ON' : 'OFF'} />
            {r.metadata.reasonStart && <DetailRow label="START" value={String(r.metadata.reasonStart).toUpperCase()} />}
            {r.metadata.reasonEnd && <DetailRow label="END" value={String(r.metadata.reasonEnd).toUpperCase()} />}
          </>
        ) : (
          <>
            <DetailRow label="TYPE" value={String(r.metadata.type || 'EXPENSE').toUpperCase()} />
            {r.metadata.account && <DetailRow label="ACCOUNT" value={String(r.metadata.account).toUpperCase()} />}
            {r.metadata.category && <DetailRow label="SUB-CAT" value={String(r.metadata.category).toUpperCase()} />}
            {r.metadata.note && <DetailRow label="NOTE" value={String(r.metadata.note)} />}
          </>
        )}
      </div>

      <div className="border-b-2 border-dashed border-[var(--border)] w-full mb-4" />

      {/* Footer: Amount & Category */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider mb-1">Total Amount</p>
          <p className={`text-2xl font-black font-mono tracking-tighter ${isIncome ? 'text-[var(--positive)]' : 'text-[var(--text-1)]'}`}>
            {r.amount != null ? `${isIncome ? '+' : isTransfer ? '' : '-'}₹${r.amount.toLocaleString('en-IN')}` : '₹0.00'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 pb-1">
          <CategoryBadge category={r.category} size="sm" />
        </div>
      </div>

      {/* Date & Fake Barcode */}
      <div className="mt-auto flex justify-between items-end text-[10px] text-[var(--text-3)] font-mono font-medium">
        <div className="flex flex-col gap-0.5">
          <span>{formatDate(r.timestamp)}</span>
          <span>{formatTime(r.timestamp)}</span>
        </div>
        <div className="flex flex-col items-end opacity-30 group-hover:opacity-60 transition-opacity">
          <Barcode size={24} className="mb-0.5" strokeWidth={1} />
          <span>ID: {r.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </motion.article>
  );
});
