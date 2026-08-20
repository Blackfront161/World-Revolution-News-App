from datetime import datetime, timezone
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from build_source_archive import build_source_archives


NOW = datetime(2026, 8, 9, 12, tzinfo=timezone.utc)
NEWS = [
    {"quelleName": "Quelle A", "title": "Heute", "link": "a-1", "pubDate": "2026-08-09T10:00:00Z", "content": "A" * 1600},
    {"quelleName": "Quelle A", "title": "Vor 30 Tagen", "link": "a-2", "pubDate": "2026-07-10T12:00:00Z", "content": "vollständig"},
    {"quelleName": "Quelle B", "title": "Vor fünf Tagen", "link": "b-1", "pubDate": "2026-08-04T12:00:00Z", "content": "kurz"},
    {"quelleName": "Quelle B", "title": "Zu alt", "link": "b-old", "pubDate": "2026-06-01T12:00:00Z", "content": "alt"},
]

PREVIOUS = [
    {"quelleName": "Quelle B", "title": "Gesammelter Verlauf", "link": "b-history", "pubDate": "2026-08-01T12:00:00Z", "content": "gesammelt"},
]

manifest, chunks = build_source_archives(
    NEWS,
    NEWS[:1],
    previous_articles=PREVIOUS,
    previous_tracking={"Quelle A": "2026-07-09T12:00:00Z"},
    generated_at=NOW,
)
sources = {source["name"]: source for source in manifest["sources"]}

assert manifest["windowDays"] == 30
assert manifest["sourceCount"] == 2
assert manifest["itemCount"] == 4
assert sources["Quelle A"]["coverage"] == "complete"
assert sources["Quelle B"]["coverage"] == "partial"
assert sources["Quelle A"]["quickIndexCount"] == 1
assert all(item["title"] != "Zu alt" for rows in chunks.values() for item in rows)
assert any(item["title"] == "Gesammelter Verlauf" for rows in chunks.values() for item in rows)

source_a = chunks[sources["Quelle A"]["id"]][0]
assert len(source_a["content"]) == 1400
assert source_a["webFeedTruncated"] is True
assert source_a["webFeedOriginalLength"] == 1600

print("Per-source 30-day archive builder: OK")
