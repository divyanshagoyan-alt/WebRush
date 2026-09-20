export interface RawSpotifyRecord {
  id: string;
  ts: string;
  platform: string;
  msPlayed: number;
  trackName: string;
  artistName: string;
  albumName: string;
  reasonStart: string;
  reasonEnd: string;
  shuffle: boolean;
  skipped: boolean;
  uri: string;
}

export interface RawHouseholdRecord {
  id: string;
  date: string;
  mode: string;
  category: string;
  subcategory: string;
  note: string;
  amount: number;
  type: string;
  currency: string;
}

export type ReceiptCategory =
  | 'music'
  | 'food'
  | 'transport'
  | 'health'
  | 'household'
  | 'subscription'
  | 'entertainment'
  | 'investment'
  | 'family'
  | 'apparel'
  | 'income'
  | 'other';

export interface Receipt {
  id: string;
  timestamp: string;     // ISO or parseable string
  category: ReceiptCategory;
  title: string;
  subtitle?: string;
  metadata: Record<string, string | number | boolean>;
  source: 'spotify' | 'household';
  sourceId: string;
  amount?: number;
  currency?: string;
  original: RawSpotifyRecord | RawHouseholdRecord;
}

export interface InsightSignal {
  id: string;
  label: string;
  value: string;
  explanation: string;
  dataBasis: string;
  category: ReceiptCategory;
}

export interface Pattern {
  id: string;
  finding: string;
  evidence: string;
  recordIds: string[];
  vizType: 'bar' | 'heatmap' | 'line' | 'number' | 'list';
  vizData: unknown;
}

export interface Chapter {
  id: string;
  title: string;
  period: string;
  start: string;
  end: string;
  recordCount: number;
  dominantCategory: ReceiptCategory;
  majorEntities: string[];
  explanation: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  ruleId: string;
  ruleName: string;
  explanation: string;
  strength: number; // 0-1
}

export interface DataSummary {
  spotify: SpotifySummary;
  household: HouseholdSummary;
  generated: string;
  datasetSource: string;
}

export interface SpotifySummary {
  totalRecords: number;
  dateStart: string;
  dateEnd: string;
  totalListeningMs: number;
  totalListeningHours: number;
  skipCount: number;
  shuffleCount: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  topArtists: { name: string; count: number }[];
  topAlbums: { name: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
  dowActivity: { day: number; count: number }[];
  yearlyActivity: { year: number; count: number }[];
  platformCounts: Record<string, number>;
}

export interface HouseholdSummary {
  totalRecords: number;
  totalExpenses: number;
  totalIncome: number;
  topCategories: { name: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  expenseCount: number;
  incomeCount: number;
}
