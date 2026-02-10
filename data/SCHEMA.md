# Sync Data Schema Reference

## File: `data/sync-data.json`

This is the single source of truth for all data rendered in the Indie Sync Blueprint dashboard. To update the app, you only edit this file (or replace it with Gemini output).

---

## Top-Level Structure

| Key          | Type   | Description                                  |
|--------------|--------|----------------------------------------------|
| `_meta`      | object | Version tracking & axis definitions          |
| `categories` | object | Keyed by category ID (e.g., `"Ads"`, `"TV"`) |

---

## `_meta`

| Field              | Type     | Example                                                              |
|--------------------|----------|----------------------------------------------------------------------|
| `version`          | string   | `"2.0.0"`                                                            |
| `lastUpdated`      | string   | `"2026-02-10"` (ISO date)                                            |
| `source`           | string   | `"Gemini Deep Research"`                                             |
| `fingerprintAxes`  | string[] | `["Energy", "Emotion", "Uniqueness", "Catchiness", "Lyrical Depth"]` |
| `fingerprintScale` | object   | `{ "min": 0, "max": 100 }`                                           |

---

## Category Object

Each key under `categories` (e.g., `"Ads"`, `"TV"`, `"Games"`) maps to:

| Field     | Type   | Description                                                         |
|-----------|--------|---------------------------------------------------------------------|
| `label`   | string | Human-readable tab name (e.g., `"Commercials"`, `"TV & Movies"`)    |
| `insight` | string | 1-2 sentence category-level insight shown in the purple sidebar box |
| `brands`  | array  | Array of Brand objects                                              |

**Rules:**
- Category keys must be single-word, PascalCase identifiers (used as HTML `id` attributes)
- Adding a new key here automatically creates a new tab in the UI

---

## Brand Object

| Field         | Type      | Description                                               | Example                                      |
|---------------|-----------|-----------------------------------------------------------|----------------------------------------------|
| `name`        | string    | Brand display name                                        | `"Apple"`                                    |
| `tag`         | string    | Short industry tag (ALL CAPS in UI)                       | `"Tech / Lifestyle"`                         |
| `desc`        | string    | 2-3 sentences on sonic identity                           | `"The 'Holy Grail' of sync..."`              |
| `fingerprint` | number[5] | Radar chart values, order matches `_meta.fingerprintAxes` | `[90, 40, 95, 80, 70]`                       |
| `genres`      | string[3] | Top 3 genres for this brand                               | `["Indie Pop", "Electronic", "Alt-Hip Hop"]` |
| `songs`       | array     | Array of 3-8 Song objects                                 | See below                                    |

**Fingerprint values** (0-100 scale):
1. **Energy** — BPM, intensity, how "loud" the vibe is
2. **Emotion** — Sentimentality, vulnerability, tear-jerker factor
3. **Uniqueness** — How sonically adventurous / non-mainstream
4. **Catchiness** — Hook strength, singability, instant memorability
5. **Lyrical Depth** — How important lyrics are to the placement

---

## Song Object

| Field    | Type   | Description               | Example                  |
|----------|--------|---------------------------|--------------------------|
| `title`  | string | Song title                | `"Down"`                 |
| `artist` | string | Artist name               | `"Marian Hill"`          |
| `vibe`   | string | 2-4 word sonic descriptor | `"Minimal, Piano, Bass"` |

**Notes:**
- Spotify and Apple Music search links are auto-generated from `title + artist`
- `vibe` appears as a badge on the song card — keep it short and descriptive

---

## Adding a New Category

1. Pick a key (e.g., `"Podcasts"`)
2. Add it to `categories` in `sync-data.json`
3. The app auto-generates the tab, brand list, and charts — no code changes needed

## Adding a New Brand

1. Find the category key in `sync-data.json`
2. Push a new brand object into that category's `brands` array
3. Include all required fields (name, tag, desc, fingerprint, genres, songs)

## Updating Songs

1. Find the brand → `songs` array
2. Add/remove/edit song objects
3. Each song only needs `title`, `artist`, and `vibe`

---

## Quick Validation Checklist

- [ ] `fingerprint` has exactly 5 numbers, each 0-100
- [ ] `genres` has exactly 3 strings
- [ ] Each brand has at least 3 songs
- [ ] `_meta.lastUpdated` is set to today's date
- [ ] JSON is valid (no trailing commas, proper quotes)
