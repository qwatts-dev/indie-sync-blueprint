# Indie Sync Blueprint

A data-driven sync licensing research dashboard. Visualizes sonic fingerprints, genres, and reference tracks across brands and media categories — powered by a JSON data file you can update with AI research.

**Live:** Hosted on GitHub Pages (zero build tools, zero frameworks, zero dependencies beyond CDN).

---

## Architecture

```
indie-sync-blueprint/
├── index.html              ← Clean HTML shell (structure only)
├── css/
│   └── styles.css          ← All styles (theme tokens, components, responsive)
├── js/
│   └── app.js              ← App logic (data loading, rendering, charts, interactions)
├── data/
│   ├── sync-data.json      ← THE DATABASE — all categories, brands, songs, fingerprints
│   ├── template.json       ← Empty template for adding new entries
│   └── SCHEMA.md           ← Field-by-field documentation of the JSON structure
├── images/
│   ├── 338-sync-long-light.svg
│   └── 338-sync-long-dark.svg
├── GEMINI_PROMPT.md         ← Ready-to-use prompt for Gemini Deep Research
├── CNAME                    ← Custom domain config
└── README.md                ← You are here
```

### How It Works

1. `index.html` loads → pulls in `css/styles.css` + `js/app.js`
2. `app.js` fetches `data/sync-data.json` at runtime
3. Category tabs, brand lists, song cards, and charts are all **generated dynamically** from the JSON
4. Adding a new category to the JSON = automatic new tab in the UI (no code changes)

---

## Updating the Data

### Option A: Full Refresh with Gemini
1. Open [GEMINI_PROMPT.md](GEMINI_PROMPT.md)
2. Copy the research prompt into Gemini's Deep Research mode
3. Validate the returned JSON at [jsonlint.com](https://jsonlint.com/)
4. Replace the contents of `data/sync-data.json`
5. Commit & push — site updates automatically

### Option B: Manual Edits
1. Open `data/sync-data.json`
2. Add/edit brands or songs following the structure in `data/SCHEMA.md`
3. Use `data/template.json` as a starting point for new entries
4. Commit & push

### Option C: Partial Update with Gemini
1. Use the "Partial Updates" prompt from `GEMINI_PROMPT.md`
2. Insert the returned brand/category JSON into the appropriate spot in `sync-data.json`
3. Commit & push

---

## Local Development

```bash
# Any static server works. Examples:
npx serve .
# or
python3 -m http.server 8000
```

> **Note:** You need a local server (not `file://`) because `app.js` uses `fetch()` to load the JSON data.

---

## Tech Stack

| Layer       | Tool                 | Why                                               |
|-------------|----------------------|---------------------------------------------------|
| Markup      | HTML5                | Static, GitHub Pages compatible                   |
| Styling     | Tailwind CSS (CDN)   | Utility-first, no build step                      |
| Custom CSS  | `css/styles.css`     | Theme tokens, glassmorphism, responsive overrides |
| Charts      | Chart.js (CDN)       | Radar + bar charts, zero config                   |
| Data        | JSON file            | Git-trackable, AI-populatable, human-readable     |
| Hosting     | GitHub Pages         | Push to deploy, free                              |
| AI Pipeline | Gemini Deep Research | Structured research → JSON output                 |
