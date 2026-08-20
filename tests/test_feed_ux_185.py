#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REGIONS = {
    "Global", "Europe", "Africa", "North America", "Latin America",
    "Asia", "Australia & NZ",
}
TOPICS = {
    "Labor Struggles", "Antifascism", "Antisexism", "Queer-Feminism",
    "Antiracism", "No Borders", "Anticapitalism", "Theory & Strategy",
    "Anticolonialism", "Anti-Imperialism", "Squatting & Housing",
    "Demonstrations", "Anti-Rep & Prisons", "Cyberactivism", "No War",
    "Animal Liberation", "Eco-Anarchism", "Indigenous Struggles",
    "Radical Health & Disability", "Libraries", "Movement News",
}

news = json.loads((ROOT / "news.json").read_text(encoding="utf-8"))
quick_feed = json.loads((ROOT / "news-feed.json").read_text(encoding="utf-8"))

assert news, "Das 30-Tage-Archiv darf nicht leer sein."
assert all(REGIONS.intersection(row.get("categories", [])) for row in news)
assert all(TOPICS.intersection(row.get("categories", [])) for row in news)

asia_rows = [
    row for row in quick_feed
    if "Asia" in row.get("categories", [])
]
asia_sources = [str(row.get("quelleName", "")) for row in asia_rows[:10]]
assert len(asia_rows) >= 10
assert len(set(asia_sources)) == len(asia_sources), asia_sources

abc_rows = [
    row for row in news
    if (
        "anarchist black cross" in str(row.get("quelleName", "")).casefold()
        or str(row.get("quelleName", "")).casefold().startswith("abc ")
    )
]
assert abc_rows
assert all("Anti-Rep & Prisons" in row.get("categories", []) for row in abc_rows)

podcast_sources = json.loads(
    (ROOT / "podcast-sources.json").read_text(encoding="utf-8")
)
aradio = next(row for row in podcast_sources if row.get("id") == "a-radio-wien")
assert aradio.get("enabled") is True
assert any("/podcast/anarchistisches-radio/feed" in url for url in aradio["feedUrls"])

radio_sources = json.loads(
    (ROOT / "radio-sources.json").read_text(encoding="utf-8")
)
orange = next(row for row in radio_sources if row.get("id") == "orange")
assert "https://securestream.o94.at/live.mp3" in orange["streamCandidates"]

app_js = (ROOT / "app.js").read_text(encoding="utf-8")
aggregate_py = (ROOT / "aggregate.py").read_text(encoding="utf-8")
assert "const ITEMS_PER_PAGE = 10;" in app_js
assert '_wrn_source["maxNewItems"] = 1' in aggregate_py
assert '_wrn_source["maxNewItems"] = 15' in aggregate_py
assert '"minArticleTextLength"] = 1200' in aggregate_py
assert 'categories.append("Movement News")' in aggregate_py

print(
    "WRN 1.8.5 Feed/UX: "
    f"{len(news)} Artikel vollständig klassifiziert, "
    f"{len(set(asia_sources))} verschiedene Asien-Quellen in den ersten 10."
)
