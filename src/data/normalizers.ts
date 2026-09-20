import type { Receipt, ReceiptCategory, RawSpotifyRecord, RawHouseholdRecord } from '../types';

function sanitize(str: string): string {
  return str.replace(/[<>"'`]/g, '').trim();
}

function categoryFromHousehold(cat: string): ReceiptCategory {
  const c = cat.toLowerCase();
  if (c === 'food') return 'food';
  if (c === 'transportation') return 'transport';
  if (c === 'health') return 'health';
  if (c === 'household') return 'household';
  if (c === 'subscription') return 'subscription';
  if (c === 'entertainment' || c === 'culture') return 'entertainment';
  if (c.includes('investment') || c.includes('fund') || c.includes('share') || c.includes('equity') || c.includes('ppf') || c.includes('mutual')) return 'investment';
  if (c === 'family') return 'family';
  if (c === 'apparel') return 'apparel';
  if (c === 'income' || c === 'salary' || c === 'dividend') return 'income';
  return 'other';
}

export function normalizeSpotifyRecord(raw: RawSpotifyRecord, idx: number): Receipt {
  return {
    id: raw.id || `sp_${idx}`,
    timestamp: raw.ts,
    category: 'music',
    title: sanitize(raw.trackName || 'Unknown Track'),
    subtitle: sanitize(raw.artistName || ''),
    metadata: {
      artist: sanitize(raw.artistName || ''),
      album: sanitize(raw.albumName || ''),
      platform: sanitize(raw.platform || ''),
      msPlayed: raw.msPlayed,
      minutesPlayed: Math.round(raw.msPlayed / 60000 * 10) / 10,
      reasonStart: raw.reasonStart,
      reasonEnd: raw.reasonEnd,
      shuffle: raw.shuffle,
      skipped: raw.skipped,
      uri: raw.uri,
    },
    source: 'spotify',
    sourceId: raw.id,
    original: raw,
  };
}

export function normalizeHouseholdRecord(raw: RawHouseholdRecord, idx: number): Receipt {
  const type = raw.type;
  const cat = type === 'Income' ? 'income' : categoryFromHousehold(raw.category);
  const title = sanitize(raw.note || raw.subcategory || raw.category || 'Transaction');
  const subtitle = sanitize(raw.category + (raw.subcategory ? ` › ${raw.subcategory}` : ''));

  // Normalize date to ISO format
  let ts = raw.date;
  const dateParts = raw.date.split(' ')[0].split('/');
  if (dateParts.length === 3) {
    const [d, m, y] = dateParts;
    const time = raw.date.includes(' ') ? raw.date.split(' ')[1] : '12:00:00';
    ts = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}`;
  }

  return {
    id: raw.id || `hh_${idx}`,
    timestamp: ts,
    category: cat,
    title,
    subtitle,
    metadata: {
      mode: sanitize(raw.mode || ''),
      category: sanitize(raw.category || ''),
      subcategory: sanitize(raw.subcategory || ''),
      note: sanitize(raw.note || ''),
      type: raw.type,
      currency: raw.currency || 'INR',
    },
    source: 'household',
    sourceId: raw.id,
    amount: raw.amount,
    currency: raw.currency || 'INR',
    original: raw,
  };
}
