# Gemini Deep Research Prompt for Indie Sync Blueprint

Use this prompt with **Google Gemini's Deep Research** mode. It will research current sync licensing trends, then output structured JSON you can paste directly into `data/sync-data.json`.

---

## STEP 1: The Research Prompt

Copy and paste this into Gemini Deep Research:

```
You are a music industry research analyst specializing in sync licensing (the placement of songs in commercials, TV shows, films, video games, and influencer content).

I need you to conduct deep research on the current state of sync music trends. For each category below, identify the top brands/shows/platforms that actively license indie and emerging artist music, and analyze their "sonic identity" — what kinds of music they consistently use.

### Categories to Research:
1. **Commercials (Ads)** — Major brands (tech, automotive, food/bev, fashion, etc.)
2. **TV & Movies** — Shows and networks known for music-forward placements
3. **Video Games** — Games with notable licensed soundtracks
4. **Trailers** — Film trailer music trends (blockbuster vs indie/A24)
5. **Influencer/Creator Content** — YouTube, TikTok, Instagram creator music patterns

### For Each Category, Provide:
- A 1-2 sentence "insight" summarizing what defines this category's sync needs
- 3-5 brands/shows/platforms within the category

### For Each Brand/Show/Platform, Provide:
- Name
- Short industry tag (e.g., "Tech / Lifestyle", "Network Drama")
- 2-3 sentence description of their sonic identity — what sound are they looking for?
- A "Sonic Fingerprint" rating (0-100 scale) for these 5 axes:
  1. **Energy** — BPM, intensity, loudness of typical placements
  2. **Emotion** — Sentimentality, vulnerability of typical placements
  3. **Uniqueness** — How sonically adventurous vs mainstream
  4. **Catchiness** — Hook strength, singability
  5. **Lyrical Depth** — How important lyrics are to the placement
- Top 3 genres they gravitate toward
- 3-8 example songs that have been placed (or represent the sonic target), each with:
  - Song title
  - Artist name
  - A 2-4 word "vibe" descriptor (e.g., "Minimal, Piano, Bass" or "Aggressive, Driving")

### Sources to Prioritize:
- TuneFind.com (TV/film/game placements)
- iSpot.tv (commercial music tracking)
- Musicbed, Artlist, Marmoset (licensing company catalogs)
- Billboard, Music Business Worldwide, Synchtank articles
- Spotify "Songs from [Show/Brand]" playlists
- Actual recent sync placements (2024-2026)

### Output Format:
Return your findings as valid JSON matching this exact structure. Do NOT wrap it in markdown code fences. Provide ONLY the raw JSON:

{
  "_meta": {
    "version": "2.0.0",
    "lastUpdated": "YYYY-MM-DD",
    "source": "Gemini Deep Research",
    "fingerprintAxes": ["Energy", "Emotion", "Uniqueness", "Catchiness", "Lyrical Depth"],
    "fingerprintScale": { "min": 0, "max": 100 }
  },
  "categories": {
    "Ads": {
      "label": "Commercials",
      "insight": "...",
      "brands": [
        {
          "name": "Brand Name",
          "tag": "Industry / Sub-category",
          "desc": "2-3 sentences on sonic identity.",
          "fingerprint": [energy, emotion, uniqueness, catchiness, lyrics],
          "genres": ["Genre 1", "Genre 2", "Genre 3"],
          "songs": [
            { "title": "Song", "artist": "Artist", "vibe": "2-4 word descriptor" }
          ]
        }
      ]
    },
    "TV": { "label": "TV & Movies", ... },
    "Games": { "label": "Video Games", ... },
    "Trailers": { "label": "Trailers", ... },
    "Influencer": { "label": "Influencers", ... }
  }
}

Important rules:
- Category keys must be: Ads, TV, Games, Trailers, Influencer (exactly these, they map to UI tabs)
- fingerprint must be exactly 5 numbers, 0-100
- genres must be exactly 3 strings
- Each brand should have 3-8 songs
- vibe should be 2-4 words max, comma-separated descriptors
- Use REAL songs that have actually been placed or closely match the brand's sonic identity
- lastUpdated should be today's date in YYYY-MM-DD format
```

---

## STEP 2: Validate & Deploy

After Gemini returns the JSON:

1. **Validate the JSON** — Paste it into [jsonlint.com](https://jsonlint.com/) to catch syntax errors
2. **Replace** the contents of `data/sync-data.json` with the validated JSON
3. **Commit & push** to GitHub — the site updates automatically via GitHub Pages
4. **Verify** by loading your site and clicking through each category/brand

---

## STEP 3: Partial Updates

If you only want to update a single category or add a new brand, use this shorter prompt:

```
I'm updating my sync music research database. Research the following and return ONLY the JSON for this specific category/brand.

[Describe what you want — e.g., "Add 3 new automotive brands to the Ads category" or "Update the TV category with 2026 shows"]

Return the data in this exact format per brand:
{
  "name": "Brand Name",
  "tag": "Industry / Sub-category",
  "desc": "2-3 sentences.",
  "fingerprint": [energy, emotion, uniqueness, catchiness, lyrics],
  "genres": ["Genre 1", "Genre 2", "Genre 3"],
  "songs": [
    { "title": "Song", "artist": "Artist", "vibe": "2-4 words" }
  ]
}

Rules: fingerprint = 5 numbers 0-100, genres = exactly 3, songs = 3-8 entries, vibe = 2-4 word descriptor. Use real placed songs from 2024-2026.
```

Then manually insert the returned brand object(s) into the appropriate category's `brands` array in `data/sync-data.json`.

---

## Tips for Best Results

- **Be specific** — "Research automotive brands that licensed indie music in 2025-2026" gets better results than "research car ads"
- **Cross-reference** — Gemini might hallucinate song placements. Spot-check a few on TuneFind or iSpot.tv
- **Iterate** — Run the full prompt quarterly to keep your data fresh
- **Add new categories** — Just add a new key to `categories` in the JSON (e.g., `"Podcasts"`) and the app auto-generates the UI tab
