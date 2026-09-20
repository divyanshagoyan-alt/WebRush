import csv
import os
from collections import Counter
from datetime import datetime

print("=== DATASET ANALYSIS ===\n")

# --- Spotify ---
print("--- SPOTIFY ---")
spotify_rows = []
with open('spotify_history.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        spotify_rows.append(row)

print(f"Records: {len(spotify_rows)}")
print(f"Columns: {list(spotify_rows[0].keys())}")
dates = [r['ts'] for r in spotify_rows if r.get('ts')]
if dates:
    dates_sorted = sorted(dates)
    print(f"Date range: {dates_sorted[0]} to {dates_sorted[-1]}")

platforms = Counter(r.get('platform','') for r in spotify_rows)
print(f"Platforms: {dict(platforms.most_common(5))}")

artists = Counter(r.get('artist_name','') for r in spotify_rows)
print(f"Top 10 artists: {artists.most_common(10)}")

albums = Counter(r.get('album_name','') for r in spotify_rows)
print(f"Top 5 albums: {albums.most_common(5)}")

skipped = sum(1 for r in spotify_rows if r.get('skipped','').upper() == 'TRUE')
print(f"Skipped tracks: {skipped}")

shuffle = sum(1 for r in spotify_rows if r.get('shuffle','').upper() == 'TRUE')
print(f"Shuffle plays: {shuffle}")

ms_vals = []
for r in spotify_rows:
    try:
        ms_vals.append(float(r.get('ms_played', 0)))
    except:
        pass
if ms_vals:
    total_ms = sum(ms_vals)
    total_hours = total_ms / 3600000
    print(f"Total listening time: {total_hours:.1f} hours")

print()

# --- Household Transactions ---
print("--- HOUSEHOLD TRANSACTIONS ---")
household_rows = []
with open('Daily Household Transactions.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        household_rows.append(row)

print(f"Records: {len(household_rows)}")
print(f"Columns: {list(household_rows[0].keys())}")
cats = Counter(r.get('Category','') for r in household_rows)
print(f"Top categories: {cats.most_common(10)}")
income_expense = Counter(r.get('Income/Expense','') for r in household_rows)
print(f"Transaction types: {dict(income_expense)}")
modes = Counter(r.get('Mode','') for r in household_rows)
print(f"Payment modes: {dict(modes.most_common(5))}")

amounts = []
for r in household_rows:
    try:
        amounts.append(float(r.get('Amount', 0)))
    except:
        pass
if amounts:
    print(f"Amount range: {min(amounts):.2f} to {max(amounts):.2f}")
    print(f"Total expense records: {sum(1 for r in household_rows if r.get('Income/Expense') == 'Expense')}")
    print(f"Total income records: {sum(1 for r in household_rows if r.get('Income/Expense') == 'Income')}")

dates_h = [r.get('Date','') for r in household_rows if r.get('Date')]
if dates_h:
    print(f"Date samples: {dates_h[:3]}")

print()

# --- India Transactions ---
print("--- INDIA TRANSACTIONS (augmented) ---")
india_rows = []
with open('Augmented_IndiaTransactMultiFacet2024.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        india_rows.append(row)

print(f"Records: {len(india_rows)}")
print(f"Columns: {list(india_rows[0].keys())}")
india_cats = Counter(r.get('category','') for r in india_rows)
print(f"Top categories: {india_cats.most_common(10)}")
fraud = sum(1 for r in india_rows if r.get('is_fraud','').strip() == '1.0')
print(f"Fraud transactions: {fraud}")

print("\n=== ANALYSIS COMPLETE ===")
