from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def main() -> None:
    index = read("classic.html")
    csp_match = re.search(
        r'http-equiv="Content-Security-Policy"\s+content="([^"]+)"',
        index,
        flags=re.IGNORECASE,
    )
    assert csp_match, "CSP meta tag missing"
    csp = csp_match.group(1)
    assert "frame-src" in csp, "frame-src directive missing"
    assert "https://www.youtube-nocookie.com" in csp
    assert "https://player.vimeo.com" in csp
    assert not re.search(r"frame-src[^;]*\shttps:\s", csp), (
        "frame-src must not allow every HTTPS origin"
    )

    background_css = read("app-background.css")
    intro_css = read("intro-screen.css")
    assert 'app-background.webp?v=183' in background_css
    assert 'app-background.webp?v=184' in intro_css
    assert '/ contain no-repeat' in intro_css
    assert 'from { transform: scale(1.012)' in intro_css
    assert "background-image" in background_css

    header_script = read("wrn-header.js")
    header_css = read("wrn-header.css")
    light_css = read("light-theme.css")
    config = read("config.js")
    assert "wrn-future-header-white.png?v=184-release-1" in header_script
    assert "background: transparent !important" in header_css
    assert "saturate(1.38)" in header_css
    assert "body.theme-light" in light_css
    assert "#f1e9dc" in light_css
    assert "['light-theme.css', 'light-theme-recovery-184']" in config

    image = ROOT / "app-background.webp"
    data = image.read_bytes()
    assert len(data) > 20_000, "Background image unexpectedly small"
    assert data[:4] == b"RIFF" and data[8:12] == b"WEBP", (
        "Background is not a valid WebP container"
    )

    worker = read("service-worker.js")
    assert "wrn-app-v2.1.1-r1" in worker
    assert "wrn-data-v2.1.1-r1" in worker
    assert "./video-hub.js" in worker
    assert "./video-hub.css" in worker
    assert "./app-background.webp" in worker
    assert "./wrn-future-header-white.png" in worker
    assert "./light-theme.css" in worker

    video = read("video-hub.js")
    assert "(?:watch|embed)" in video
    assert "youtube-nocookie.com/embed" in video
    assert "player.vimeo.com/video" in video
    assert "sandbox" in video

    print("Video and background asset tests passed.")


if __name__ == "__main__":
    main()
