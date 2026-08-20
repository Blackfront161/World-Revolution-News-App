from datetime import datetime, timezone

from sync_generated_podcasts import normalize_items


NOW = datetime(2026, 7, 30, tzinfo=timezone.utc)
VALID = {
    "id": "podcasts/de/short/" + ("a" * 64) + ".mp3",
    "title": "Active",
    "source": "Source",
    "language": "de",
    "mode": "short",
    "voiceLabel": "Katja",
    "createdAt": "2026-07-24T09:06:27Z",
    "expiresAt": "2026-08-23T09:06:27Z",
    "size": 123,
    "audioUrl": (
        "https://revolution-proxy.paghklo.workers.dev/"
        "?action=podcast.audio&key=podcasts%2Fde%2Fshort%2Factive.mp3"
    ),
    "articleUrl": "https://example.org/article",
}

items = normalize_items(
    [
        VALID,
        {**VALID},
        {
            **VALID,
            "id": "podcasts/de/full/" + ("b" * 64) + ".mp3",
            "title": "Expired",
            "expiresAt": "2026-07-29T00:00:00Z",
        },
        {
            **VALID,
            "id": "podcasts/de/full/" + ("c" * 64) + ".mp3",
            "audioUrl": "https://attacker.example/podcast.mp3",
        },
    ],
    now=NOW,
)

assert len(items) == 1
assert items[0]["title"] == "Active"
assert items[0]["articleUrl"] == "https://example.org/article"

print("Generated podcast recovery snapshot contracts: OK")
