#!/usr/bin/env python3
from check_audio_sources import radio_urls

station = {
    "name": "Test Radio",
    "streamCandidates": [
        "https://example.invalid/one.mp3",
        "https://example.invalid/two.ogg",
        "https://example.invalid/one.mp3",
    ],
    "streamUrl": "https://example.invalid/legacy.mp3",
}

assert radio_urls(station) == [
    "https://example.invalid/one.mp3",
    "https://example.invalid/two.ogg",
    "https://example.invalid/legacy.mp3",
]
assert radio_urls({"name": "Empty"}) == []
print("Audio-Quellenschema: OK")
