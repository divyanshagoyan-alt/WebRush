// scripts/preprocess.mjs
// Run this at build time to convert CSVs → compact JSON for the app

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'public', 'data');

mkdirSync(DATA_DIR, { recursive: true });

console.log('🎵 Processing Spotify history...');
const spotifyRaw = readFileSync(join(ROOT, '..', 'spotify_history.csv'), 'utf-8');
const spotifyLines = spotifyRaw.split('\n');
const spotifyHeaders = spotifyLines[0].replace(/^\uFEFF/, '').split(',');
console.log(`  Found ${spotifyLines.length - 1} records`);

const spotifyRecords = [];
for (let i = 1; i < spotifyLines.length; i++) {
  const line = spotifyLines[i].trim();
  if (!line) continue;
  const cols = parseCSVLine(line);
  if (cols.length < spotifyHeaders.length) continue;
  const rec = {};
  spotifyHeaders.forEach((h, idx) => {
    rec[h.trim()] = cols[idx] ? cols[idx].trim() : '';
  });
  
  const ts = rec['ts'] || '';
  const msPlayed = parseInt(rec['ms_played']) || 0;
  if (!ts) continue;
  
  spotifyRecords.push({
    id: `sp_${i}`,
    ts,
    platform: sanitize(rec['platform']),
    msPlayed,
    trackName: sanitize(rec['track_name']),
    artistName: sanitize(rec['artist_name']),
    albumName: sanitize(rec['album_name']),
    reasonStart: sanitize(rec['reason_start']),
    reasonEnd: sanitize(rec['reason_end']),
    shuffle: rec['shuffle']?.toUpperCase() === 'TRUE',
    skipped: rec['skipped']?.toUpperCase() === 'TRUE',
    uri: sanitize(rec['spotify_track_uri'] || rec['\uFEFFspotify_track_uri'] || ''),
  });
}

// ---- Aggregate Analysis ----
const totalListeningMs = spotifyRecords.reduce((s, r) => s + r.msPlayed, 0);
const artistCounts = {};
const albumCounts = {};
const platformCounts = {};
const monthCounts = {};
const hourCounts = {};
const dayOfWeekCounts = {};
const yearCounts = {};

for (const r of spotifyRecords) {
  artistCounts[r.artistName] = (artistCounts[r.artistName] || 0) + 1;
  albumCounts[r.albumName] = (albumCounts[r.albumName] || 0) + 1;
  platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
  
  const d = new Date(r.ts);
  if (isNaN(d.getTime())) continue;
  
  const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  monthCounts[ym] = (monthCounts[ym] || 0) + 1;
  
  hourCounts[d.getHours()] = (hourCounts[d.getHours()] || 0) + 1;
  dayOfWeekCounts[d.getDay()] = (dayOfWeekCounts[d.getDay()] || 0) + 1;
  yearCounts[d.getFullYear()] = (yearCounts[d.getFullYear()] || 0) + 1;
}

const topArtists = Object.entries(artistCounts)
  .filter(([k]) => k)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .map(([name, count]) => ({ name, count }));

const topAlbums = Object.entries(albumCounts)
  .filter(([k]) => k)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .map(([name, count]) => ({ name, count }));

const monthlyActivity = Object.entries(monthCounts)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([month, count]) => ({ month, count }));

const hourlyActivity = Array.from({length: 24}, (_, h) => ({
  hour: h,
  count: hourCounts[h] || 0
}));

const dowActivity = Array.from({length: 7}, (_, d) => ({
  day: d,
  count: dayOfWeekCounts[d] || 0
}));

const yearlyActivity = Object.entries(yearCounts)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([year, count]) => ({ year: parseInt(year), count }));

const skipCount = spotifyRecords.filter(r => r.skipped).length;
const shuffleCount = spotifyRecords.filter(r => r.shuffle).length;
const dates = spotifyRecords.map(r => r.ts).filter(Boolean).sort();

// ---- Household Transactions ----
console.log('💰 Processing Household Transactions...');
const hhRaw = readFileSync(join(ROOT, '..', 'Daily Household Transactions.csv'), 'utf-8');
const hhLines = hhRaw.split('\n');
const hhHeaders = hhLines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());

const householdRecords = [];
for (let i = 1; i < hhLines.length; i++) {
  const line = hhLines[i].trim();
  if (!line) continue;
  const cols = parseCSVLine(line);
  const rec = {};
  hhHeaders.forEach((h, idx) => {
    rec[h] = cols[idx] ? cols[idx].trim() : '';
  });
  
  const dateStr = rec['Date'] || '';
  if (!dateStr) continue;
  
  const amount = parseFloat(rec['Amount']) || 0;
  
  householdRecords.push({
    id: `hh_${i}`,
    date: dateStr,
    mode: sanitize(rec['Mode']),
    category: sanitize(rec['Category']),
    subcategory: sanitize(rec['Subcategory']),
    note: sanitize(rec['Note']),
    amount,
    type: sanitize(rec['Income/Expense']),
    currency: sanitize(rec['Currency'] || 'INR'),
  });
}

// Household analysis
const hhCategoryCounts = {};
const hhMonthCounts = {};
const hhYearCounts = {};
let totalExpenses = 0;
let totalIncome = 0;

for (const r of householdRecords) {
  hhCategoryCounts[r.category] = (hhCategoryCounts[r.category] || 0) + 1;
  if (r.type === 'Expense') totalExpenses += r.amount;
  if (r.type === 'Income') totalIncome += r.amount;
  
  const parsedDate = parseDate(r.date);
  if (!parsedDate) continue;
  const ym = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth()+1).padStart(2,'0')}`;
  hhMonthCounts[ym] = (hhMonthCounts[ym] || 0) + 1;
  hhYearCounts[parsedDate.getFullYear()] = (hhYearCounts[parsedDate.getFullYear()] || 0) + 1;
}

const hhTopCategories = Object.entries(hhCategoryCounts)
  .filter(([k]) => k)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([name, count]) => ({ name, count }));

const hhMonthlyActivity = Object.entries(hhMonthCounts)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([month, count]) => ({ month, count }));

// ---- Write summary ----
const summary = {
  spotify: {
    totalRecords: spotifyRecords.length,
    dateStart: dates[0],
    dateEnd: dates[dates.length - 1],
    totalListeningMs,
    totalListeningHours: Math.round(totalListeningMs / 3600000 * 10) / 10,
    skipCount,
    shuffleCount,
    uniqueArtists: Object.keys(artistCounts).filter(Boolean).length,
    uniqueAlbums: Object.keys(albumCounts).filter(Boolean).length,
    topArtists,
    topAlbums,
    monthlyActivity,
    hourlyActivity,
    dowActivity,
    yearlyActivity,
    platformCounts,
  },
  household: {
    totalRecords: householdRecords.length,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    topCategories: hhTopCategories,
    monthlyActivity: hhMonthlyActivity,
    expenseCount: householdRecords.filter(r => r.type === 'Expense').length,
    incomeCount: householdRecords.filter(r => r.type === 'Income').length,
  },
  generated: new Date().toISOString(),
  datasetSource: 'SPOTIFY_HISTORY + DAILY_HOUSEHOLD_TRANSACTIONS',
};

writeFileSync(join(DATA_DIR, 'summary.json'), JSON.stringify(summary));
console.log('  ✓ summary.json written');

// Write spotify records in chunks for fast pagination
const CHUNK_SIZE = 5000;
const chunks = [];
for (let i = 0; i < spotifyRecords.length; i += CHUNK_SIZE) {
  chunks.push(spotifyRecords.slice(i, i + CHUNK_SIZE));
}
chunks.forEach((chunk, idx) => {
  writeFileSync(join(DATA_DIR, `spotify_${idx}.json`), JSON.stringify(chunk));
});
writeFileSync(join(DATA_DIR, 'spotify_index.json'), JSON.stringify({
  totalChunks: chunks.length,
  totalRecords: spotifyRecords.length,
  chunkSize: CHUNK_SIZE,
}));
console.log(`  ✓ ${chunks.length} spotify chunks written`);

writeFileSync(join(DATA_DIR, 'household.json'), JSON.stringify(householdRecords));
console.log('  ✓ household.json written');

console.log('\n✅ Preprocessing complete!');
console.log(`   Spotify: ${spotifyRecords.length} records`);
console.log(`   Household: ${householdRecords.length} records`);

// ---- Helpers ----
function sanitize(str) {
  if (!str) return '';
  return str.replace(/[<>"'`]/g, '');
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += line[i];
    }
  }
  result.push(cur);
  return result;
}

function parseDate(str) {
  if (!str) return null;
  try {
    // Try formats: DD/MM/YYYY, D/M/YYYY, DD/MM/YYYY HH:MM:SS
    const parts = str.split(' ')[0].split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
  } catch {}
  return null;
}
