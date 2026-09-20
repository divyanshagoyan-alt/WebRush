# Your Life, In Receipts 🧾

> **Every moment leaves a trace.**

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## Overview

**Your Life, In Receipts** transforms raw digital activity records into an interactive story experience. Instead of presenting disconnected records as a conventional timeline, the experience allows users to explore the dataset, discover deterministic relationships, identify recurring patterns, and navigate connected moments through an interactive visual interface.

---

## Hackathon

**WebRush — 6-Hour Frontend Hackathon**

## Challenge

Your Life, In Receipts

## Creator

**Divyansh Agarwal**

## Institution

**LNCT Group of Colleges**

---

## Dataset Source

> **IMPORTANT: This application uses only the supplied uploaded datasets. No data is fabricated.**

| Dataset | Records | Period | Use |
|---|---|---|---|
| `spotify_history.csv` | 149,860 | Jul 2013 – Dec 2024 | Primary (music moments) |
| `Daily Household Transactions.csv` | 2,461 | 2018 – 2020 | Secondary (financial receipts) |
| `Augmented_IndiaTransactMultiFacet2024.csv` | — | — | Excluded (synthetic ML dataset) |

All insights are either **DATA** (directly from dataset), **DERIVED** (calculated), or **INTERPRETATION** (human-readable explanation).

---

## Features

- **Cover Screen** — Hero with animated data constellation, real stats
- **Story Overview** — 6 key derived signal cards
- **Receipt Explorer** — Unified search + filter across 152k records
- **Connection Graph** — D3 canvas force graph with hover/drag/zoom
- **Pattern Discovery** — 6 findings + 6 charts
- **Interactive Timeline** — Dual-lane (Music + Finance), zoomable year→month
- **Final Reflection** — Dynamically generated story summary

---

## Data Architecture

```
scripts/preprocess.mjs    → public/data/*.json   (build-time)
src/data/normalizers.ts   → Receipt[]            (runtime)
src/hooks/useData.ts      → progressive loading
src/hooks/useFilters.ts   → client-side search
```

---

## Accessibility

- Semantic HTML, ARIA landmarks, labels, live regions
- Keyboard navigation + Escape to close all dialogs
- Skip-to-content link
- prefers-reduced-motion support
- Canvas graphs have text alternatives
- Sufficient color contrast (WCAG AA)

---

## Performance

- Build-time CSV preprocessing → compact JSON chunks (no 21MB runtime parse)
- Progressive chunk loading with non-blocking progress indicator
- useDeferredValue for search on 150k records
- D3 graph on Canvas (not SVG)
- Code-split D3, Recharts, React into separate bundles
- Vercel cache headers: 1-year max-age for data and assets

---

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · Lucide React · Recharts · D3

---

## Local Development

1. **Place the Data Files:**
   The build scripts expect the source CSV files to be located in the **parent directory** of this project (one level above the `life-in-receipts` folder). Ensure you have:
   - `../spotify_history.csv`
   - `../Daily Household Transactions.csv`

2. **Install and Run:**
   ```bash
   npm install
   npm run dev      # preprocesses CSVs then starts dev server
   npm run build    # preprocesses + TypeScript + bundle
   npm run preview  # preview production build
   ```

## Deployment (Vercel)

Push to GitHub → import in Vercel. The `vercel.json` configures:
- Build command: `node scripts/preprocess.mjs && tsc -b && vite build`
- SPA rewrites (all routes → index.html)
- Aggressive caching for data files

> **Note**: Commit the pre-generated `public/data/*.json` files for zero-cost Vercel builds. Or ensure the CSV files are available in the parent directory at build time.

---

## Dataset Integrity Statement

This application **does not fabricate** any records, relationships, statistics, or insights. All values shown in the UI are either directly from dataset fields or deterministically calculated from actual records. The `Augmented_IndiaTransactMultiFacet2024.csv` was excluded as it is a synthetic fraud-detection dataset.

---

*WebRush — 6-Hour Frontend Hackathon · Divyansh Agarwal · LNCT Group of Colleges*
