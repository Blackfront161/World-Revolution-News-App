#!/usr/bin/env python3
"""Small dependency-free consistency checks for World Revolution News."""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLASSIC_ENTRY = ROOT / "classic.html"
PUBLISHED_BASELINE_VERSION = "2.0.8"
CANDIDATE_VERSION = "2.1.0"
CANDIDATE_APP_CACHE = "wrn-app-v2.1.0-r4"
CANDIDATE_DATA_CACHE = "wrn-data-v2.1.0-r2"
ERRORS: list[str] = []
WARNINGS: list[str] = []


class AppHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.scripts: list[str] = []
        self.handlers: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        element_id = attributes.get("id")
        if element_id:
            self.ids.append(element_id)
        if tag == "script" and attributes.get("src"):
            self.scripts.append(attributes["src"] or "")
        for name, value in attrs:
            if name.startswith("on") and value:
                self.handlers.append(value)


def error(message: str) -> None:
    ERRORS.append(message)


def warning(message: str) -> None:
    WARNINGS.append(message)


def check_required_files() -> None:
    required = [
        "index.html",
        "classic.html",
        "styles.css",
        "config.js",
        "status-center.js",
        "utils.js",
        "source-profiles.js",
        "translation-tools.js",
        "accessibility.js",
        "media-player.js",
        "audio-tools.js",
        "stories-core.js",
        "stories-timeline.js",
        "stories-timeline.css",
        "video-hub.js",
        "video-hub.css",
        "audio-region-core.js",
        "source-filters.js",
        "briefing-2.js",
        "briefing-2.css",
        "events.js",
        "reading-state.js",
        "app.js",
        "audio-hub.js",
        "offline-db.js",
        "data-control.js",
        "service-worker.js",
        "manifest.json",
        "events.json",
        "build_source_catalog.py",
        "source-catalog.json",
        "check_news_sources.py",
        "source-health.json",
        ".github/workflows/update.yml",
    ]
    for relative in required:
        if not (ROOT / relative).is_file():
            error(f"Pflichtdatei fehlt: {relative}")


def check_html() -> AppHtmlParser | None:
    path = CLASSIC_ENTRY
    if not path.is_file():
        return None
    parser = AppHtmlParser()
    parser.feed(path.read_text(encoding="utf-8"))

    seen: set[str] = set()
    duplicate_ids: set[str] = set()
    for value in parser.ids:
        if value in seen:
            duplicate_ids.add(value)
        seen.add(value)
    for value in sorted(duplicate_ids):
        error(f"Doppelte HTML-ID: {value}")

    for script in parser.scripts:
        if script.startswith(("http://", "https://", "//")):
            continue
        clean = script.split("?", 1)[0].lstrip("./")
        if not (ROOT / clean).is_file():
            error(f"In index.html referenzierte Scriptdatei fehlt: {clean}")

    required_order = ["config.js", "offline-db.js", "data-control.js", "status-center.js", "utils.js", "source-profiles.js", "translation-tools.js", "accessibility.js", "media-player.js", "audio-tools.js", "events.js", "reading-state.js", "app.js", "audio-hub.js"]
    local_scripts = [value.split("?", 1)[0].lstrip("./") for value in parser.scripts if not value.startswith(("http://", "https://", "//"))]
    positions = [local_scripts.index(name) for name in required_order if name in local_scripts]
    if len(positions) != len(required_order) or positions != sorted(positions):
        error("Script-Reihenfolge in index.html ist falsch: config, Offline, Datenkontrolle, Status, Utils, Quellenprofile, Übersetzung, Accessibility, Media, Audio-Tools, Events, Reading, App, Audio-Hub.")

    required_ids = {
        "status-container",
        "feed-container",
        "event-filter-panel",
        "podcast-library-modal",
        "global-media-player",
        "continue-listening",
        "continue-listening-play",
        "system-status-modal",
        "system-status-version",
        "event-saved-filter",
        "btn-event-filter-save",
        "btn-event-filter-delete",
        "ui-news-view",
        "content-type-filter",
        "btn-read-articles",
        "audio-queue-panel",
        "audio-queue-list",
        "global-media-speed",
        "global-media-sleep",
        "global-media-sleep-status",
        "original-podcast-favorites-only",
        "live-radio-favorites-only",
        "accessibility-live",
        "skip-to-content",
        "translation-compare-modal",
        "translation-compare-original-text",
        "translation-compare-translated-text",
        "translation-report-modal",
        "translation-report-issue",
        "translation-report-note",
        "data-control-modal",
        "data-count-bookmarks",
        "data-count-read",
        "data-count-zine",
        "data-storage-total",
        "data-import-file",
        "data-control-status",
        "zine-modal",
        "zine-list",
        "btn-zine-print",
        "btn-zine-clear",
    }
    missing = sorted(required_ids.difference(parser.ids))
    for value in missing:
        error(f"Benötigte HTML-ID fehlt: {value}")

    return parser


def javascript_symbols() -> set[str]:
    symbols: set[str] = set()
    patterns = [
        re.compile(r"(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\("),
        re.compile(r"window\.([A-Za-z_$][\w$]*)\s*="),
    ]
    for path in ROOT.glob("*.js"):
        text = path.read_text(encoding="utf-8")
        for pattern in patterns:
            symbols.update(pattern.findall(text))
    return symbols


def check_inline_handlers(parser: AppHtmlParser | None) -> None:
    if parser is None:
        return
    known = javascript_symbols()
    calls: set[str] = set()
    for handler in parser.handlers:
        for name in re.findall(r"\b([A-Za-z_$][\w$]*)\s*\(", handler):
            if name not in {"if", "for", "while", "switch"}:
                calls.add(name)
    for name in sorted(calls.difference(known)):
        error(f"HTML ruft eine nicht gefundene JavaScript-Funktion auf: {name}()")


def check_json_files() -> None:
    expected_lists = {"news.json", "events.json", "podcasts.json", "radio-stations.json"}
    for path in ROOT.glob("*.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            error(f"Ungültiges JSON in {path.name}: {exc}")
            continue
        if path.name in expected_lists and not isinstance(data, list):
            error(f"{path.name} muss eine JSON-Liste sein.")
        if path.name == "manifest.json" and not isinstance(data, dict):
            error("manifest.json muss ein JSON-Objekt sein.")


def check_source_health() -> None:
    path = ROOT / "source-health.json"
    if path.is_file():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            error(f"source-health.json ist ungültig: {exc}")
            data = None

        if data is not None and not isinstance(data, dict):
            error("source-health.json muss ein JSON-Objekt sein.")
        elif isinstance(data, dict):
            for key, item in data.items():
                if not isinstance(item, dict):
                    error(f"source-health.json: Eintrag {key!r} muss ein Objekt sein.")
                    continue
                for required in ("name", "url", "status", "ok", "lastChecked"):
                    if required not in item:
                        error(f"source-health.json: {key!r} fehlt das Feld {required!r}.")

    checker = ROOT / "check_news_sources.py"
    if checker.is_file():
        text = checker.read_text(encoding="utf-8")
        for token in ["aggregate.py", "source-health.json", "def load_sources(", "def check_source(", "def main()"]:
            if token not in text:
                error(f"check_news_sources.py enthält den Pflichtwert nicht: {token}")


def check_update_workflow() -> None:
    path = ROOT / ".github" / "workflows" / "update.yml"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "python aggregate.py",
        "python reclassify_news_categories.py",
        "python build_source_catalog.py",
        "python check_news_sources.py",
    ]:
        if token not in text:
            error(f"update.yml enthält den Phase-1J-Schritt nicht: {token}")
    git_add = re.search(r"git add ([^\r\n]+)", text)
    staged = set(git_add.group(1).split()) if git_add else set()
    for required in {
        "news.json", "events.json", "editorial-review.json",
        "source-catalog.json", "source-health.json",
    }:
        if required not in staged:
            error(f"update.yml veröffentlicht die Pflichtdatei nicht: {required}")


def check_service_worker() -> None:
    path = ROOT / "service-worker.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for match in re.findall(r"['\"]\./([^'\"]+)['\"]", text):
        clean = match.split("?", 1)[0]
        if clean.endswith(".json"):
            continue
        if not (ROOT / clean).is_file():
            error(f"Service Worker referenziert eine fehlende Datei: {match}")
    for required_script in ["config.js", "data-control.js", "status-center.js", "utils.js", "source-profiles.js", "translation-tools.js", "accessibility.js", "media-player.js", "audio-tools.js", "stories-core.js", "briefing-2.js", "stories-timeline.js", "events.js", "reading-state.js"]:
        if required_script not in text:
            error(f"Service Worker muss {required_script} im App-Shell führen.")



def check_script_order(parser: AppHtmlParser | None) -> None:
    if parser is None:
        return
    expected = [
        "config.js",
        "offline-db.js",
        "data-control.js",
        "status-center.js",
        "utils.js",
        "source-profiles.js",
        "translation-tools.js",
        "accessibility.js",
        "media-player.js",
        "audio-tools.js",
        "events.js",
        "reading-state.js",
        "app.js",
        "audio-hub.js",
    ]
    local_scripts = [value.split("?", 1)[0].lstrip("./") for value in parser.scripts
                     if not value.startswith(("http://", "https://", "//"))]
    positions = []
    for script in expected:
        if script not in local_scripts:
            error(f"Script fehlt in index.html: {script}")
            continue
        positions.append((script, local_scripts.index(script)))
    indices = [index for _, index in positions]
    if indices != sorted(indices):
        error("Script-Reihenfolge ist falsch: config → offline-db → data-control → status-center → utils → source-profiles → translation-tools → accessibility → media-player → audio-tools → events → reading-state → app → audio-hub")


def check_modularization() -> None:
    app = (ROOT / "app.js").read_text(encoding="utf-8") if (ROOT / "app.js").is_file() else ""
    for moved_symbol in ["function escapeHtml(", "function getGlobalMediaPlayer(", "function isEventArticle(", "function populateEventFilters(", "function buildEventDetailsHtml("]:
        if moved_symbol in app:
            error(f"Ausgelagerte Funktion befindet sich noch in app.js: {moved_symbol}")


def check_event_module() -> None:
    path = ROOT / "events.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function downloadEventCalendar(",
        "function openEventMap(",
        "function openEventRoute(",
        "function saveCurrentEventFilter(",
        "function buildEventStatusBadges(",
    ]:
        if token not in text:
            error(f"events.js enthält die erwartete Funktion nicht: {token}")



def check_reading_module() -> None:
    path = ROOT / "reading-state.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function toggleBookmark(",
        "function toggleRead(",
        "function onExpand(",
        "function applyViewMode(",
        "window.WRNReading",
    ]:
        if token not in text:
            error(f"reading-state.js enthält die erwartete Funktion nicht: {token}")


def check_accessibility_module() -> None:
    path = ROOT / "accessibility.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function applyTheme(",
        "function applyMotionPreference(",
        "function handleKeyboard(",
        "window.WRNAccessibility",
    ]:
        if token not in text:
            error(f"accessibility.js enthält die erwartete Funktion nicht: {token}")
    styles = (ROOT / "styles.css").read_text(encoding="utf-8") if (ROOT / "styles.css").is_file() else ""
    for token in ["body.theme-oled", "body.theme-contrast", "body.theme-soft", ".skip-link", ":focus-visible", 'data-motion="reduced"']:
        if token not in styles:
            error(f"styles.css enthält die Barrierefreiheitsregel nicht: {token}")


def check_audio_tools_module() -> None:
    path = ROOT / "audio-tools.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function addToQueue(",
        "function toggleFavorite(",
        "function setSleepTimer(",
        "function setPlaybackRate(",
        "window.WRNAudioTools",
    ]:
        if token not in text:
            error(f"audio-tools.js enthält die erwartete Funktion nicht: {token}")

    media = (ROOT / "media-player.js").read_text(encoding="utf-8") if (ROOT / "media-player.js").is_file() else ""
    for token in ["window.WRNMediaPlayer", "wrnmediaended", "setGlobalMediaPlaybackRate"]:
        if token not in media:
            error(f"media-player.js enthält die Phase-1G-Schnittstelle nicht: {token}")

def check_source_profiles_module() -> None:
    path = ROOT / "source-profiles.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function classifyArticle(",
        "function badgeMarkup(",
        "function markTranslated(",
        "function open(name)",
        "window.WRNSourceProfiles",
    ]:
        if token not in text:
            error(f"source-profiles.js enthält die erwartete Funktion nicht: {token}")
    styles = (ROOT / "styles.css").read_text(encoding="utf-8") if (ROOT / "styles.css").is_file() else ""
    for token in [".editorial-badges", ".source-profile-link", ".source-profile-modal", ".source-list-row"]:
        if token not in styles:
            error(f"styles.css enthält die Quellenprofil-Regel nicht: {token}")


def check_source_catalog() -> None:
    path = ROOT / "source-catalog.json"
    if not path.is_file():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        error(f"source-catalog.json ist ungültig: {exc}")
        return
    if not isinstance(data, dict) or not isinstance(data.get("sources"), list):
        error("source-catalog.json muss ein Objekt mit einer sources-Liste sein.")
    script = ROOT / "build_source_catalog.py"
    if script.is_file():
        text = script.read_text(encoding="utf-8")
        for token in ["news.json", "source-catalog.json", "def main()"]:
            if token not in text:
                error(f"build_source_catalog.py enthält den Pflichtwert nicht: {token}")



def check_translation_tools_module() -> None:
    path = ROOT / "translation-tools.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function articleFingerprint(",
        "function getCachedChunk(",
        "function putCachedChunk(",
        "function registerTranslation(",
        "function showOriginal(",
        "function openCompare(",
        "function sendReport(",
        "window.WRNTranslationTools",
    ]:
        if token not in text:
            error(f"translation-tools.js enthält die erwartete Funktion nicht: {token}")
    styles = (ROOT / "styles.css").read_text(encoding="utf-8") if (ROOT / "styles.css").is_file() else ""
    for token in [".translation-tools", ".translation-view-button", ".translation-compare-grid", ".translation-report-field"]:
        if token not in styles:
            error(f"styles.css enthält die Übersetzungsregel nicht: {token}")
    app = (ROOT / "app.js").read_text(encoding="utf-8") if (ROOT / "app.js").is_file() else ""
    for token in ["getCachedChunk", "putCachedChunk", "registerTranslation", "translation-tools-${globalIndex}"]:
        if token not in app:
            error(f"app.js enthält die Phase-1I-Verknüpfung nicht: {token}")



def check_data_control_module() -> None:
    path = ROOT / "data-control.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in [
        "function exportBackup(",
        "function importBackupFile(",
        "function clearCategory(",
        "function refreshLanguage(",
        "window.WRNDataControl",
    ]:
        if token not in text:
            error(f"data-control.js enthält die erwartete Funktion nicht: {token}")

    offline = (ROOT / "offline-db.js").read_text(encoding="utf-8") if (ROOT / "offline-db.js").is_file() else ""
    for token in [
        "function getAllDatasetRecords(",
        "function getAllTranslationRecords(",
        "function replaceDatasetRecords(",
        "function clearTranslations(",
        "function getStorageSummary(",
    ]:
        if token not in offline:
            error(f"offline-db.js enthält die Phase-1J-Schnittstelle nicht: {token}")

    styles = (ROOT / "styles.css").read_text(encoding="utf-8") if (ROOT / "styles.css").is_file() else ""
    for token in [".data-control-modal", ".data-control-grid", ".data-control-delete-grid", ".data-external-list"]:
        if token not in styles:
            error(f"styles.css enthält die Datenkontroll-Regel nicht: {token}")

    app = (ROOT / "app.js").read_text(encoding="utf-8") if (ROOT / "app.js").is_file() else ""
    for token in ["WRNDataControl?.close()", "WRNDataControl?.refreshLanguage()"]:
        if token not in app:
            error(f"app.js enthält die Phase-1J-Verknüpfung nicht: {token}")


def check_phase1k_release_fixes() -> None:
    app = (ROOT / "app.js").read_text(encoding="utf-8") if (ROOT / "app.js").is_file() else ""
    aggregate = (ROOT / "aggregate.py").read_text(encoding="utf-8") if (ROOT / "aggregate.py").is_file() else ""
    workflow = (ROOT / ".github" / "workflows" / "update.yml").read_text(encoding="utf-8") if (ROOT / ".github" / "workflows" / "update.yml").is_file() else ""
    service_worker = (ROOT / "service-worker.js").read_text(encoding="utf-8") if (ROOT / "service-worker.js").is_file() else ""
    config = (ROOT / "config.js").read_text(encoding="utf-8") if (ROOT / "config.js").is_file() else ""
    development_config = (ROOT / "news-app-2-config.js").read_text(encoding="utf-8") if (ROOT / "news-app-2-config.js").is_file() else ""
    preview_worker = (ROOT / "news-app-2-sw.js").read_text(encoding="utf-8") if (ROOT / "news-app-2-sw.js").is_file() else ""

    for forbidden in ["X-App-Secret", "LEGACY_APP_SECRET"]:
        if forbidden in app:
            error(f"app.js enthält weiterhin das entfernte öffentliche Shared-Secret-Protokoll: {forbidden}")
    for token in ["function openZineManager(", "function removeFromZine(", "wrn_zine_articles", "@page { size: A4; margin: 0; }"]:
        if token not in app:
            error(f"app.js enthält die Phase-1K-Zine-Korrektur nicht: {token}")
    for token in ["events.json", "content_is_incomplete", "MAX_INCOMPLETE_PER_SOURCE", "contentComplete"]:
        if token not in aggregate:
            error(f"aggregate.py enthält die Phase-1K-Artikel-/Event-Korrektur nicht: {token}")
    if "events.json" not in workflow:
        error("update.yml veröffentlicht events.json nicht.")

    config_version = re.search(
        r"window\.WRN_CONFIG\s*=\s*Object\.freeze\(\{.*?\bversion:\s*['\"]([^'\"]+)",
        config,
        re.DOTALL,
    )
    if not config_version or config_version.group(1) != PUBLISHED_BASELINE_VERSION:
        error(f"config.js muss die veröffentlichte Baseline {PUBLISHED_BASELINE_VERSION} getrennt ausweisen.")
    if f"? '{CANDIDATE_VERSION}'" not in development_config:
        error(f"news-app-2-config.js muss den Produktionsstand {CANDIDATE_VERSION} ausweisen.")
    for token in [CANDIDATE_APP_CACHE, CANDIDATE_DATA_CACHE]:
        if token not in service_worker:
            error(f"Produktionspfad des 2.1-Workers fehlt: {token}")
    if "`${CACHE_PREFIX}v86`" not in preview_worker:
        error("Vorschaupfad des 2.1-Entwicklungsworkers muss Cache v86 verwenden.")


def check_release_182() -> None:
    config = (ROOT / "config.js").read_text(encoding="utf-8") if (ROOT / "config.js").is_file() else ""
    worker = (ROOT / "service-worker.js").read_text(encoding="utf-8") if (ROOT / "service-worker.js").is_file() else ""
    navigation = (ROOT / "release-1.5-nav.js").read_text(encoding="utf-8") if (ROOT / "release-1.5-nav.js").is_file() else ""
    briefing = (ROOT / "briefing.js").read_text(encoding="utf-8") if (ROOT / "briefing.js").is_file() else ""
    developments = (ROOT / "stories-timeline.js").read_text(encoding="utf-8") if (ROOT / "stories-timeline.js").is_file() else ""
    core = (ROOT / "stories-core.js").read_text(encoding="utf-8") if (ROOT / "stories-core.js").is_file() else ""
    audio = (ROOT / "audio-tab.js").read_text(encoding="utf-8") if (ROOT / "audio-tab.js").is_file() else ""
    source_verification = (ROOT / "source-verification.js").read_text(encoding="utf-8") if (ROOT / "source-verification.js").is_file() else ""
    release_languages = (ROOT / "release-1.4.js").read_text(encoding="utf-8") if (ROOT / "release-1.4.js").is_file() else ""

    configured_version = re.search(
        r"window\.WRN_CONFIG\s*=\s*Object\.freeze\(\{.*?\bversion:\s*['\"]([^'\"]+)",
        config,
        re.DOTALL,
    )
    expected_version = configured_version.group(1) if configured_version else ""
    for token in [f"version: '{expected_version}'", "audio-region-core.js", "video-hub.js", "video-hub.css", "openLandingTab"]:
        if token not in config:
            error(f"config.js enthält die 1.8.2-Verknüpfung nicht: {token}")

    for token in ["audio-region-core.js", "video-hub.js", "video-hub.css"]:
        if token not in worker:
            error(f"2.1-Entwicklungsworker enthält die übernommene 1.8.2-Datei nicht: {token}")
    for token in [CANDIDATE_APP_CACHE, CANDIDATE_DATA_CACHE]:
        if token not in worker:
            error(f"2.1-Entwicklungsworker enthält nicht den erwarteten Cache: {token}")

    if "new URL('./generated-podcasts.json', self.location.href)" not in worker:
        error("service-worker.js enthält keinen gültigen Fallback für generated-podcasts.json.")

    if "new URL('./podcasts.json', './generated-podcasts.json'" in worker:
        error("service-worker.js enthält weiterhin den fehlerhaften kombinierten Podcast-Fallback.")

    for token in ["key: 'stories'", "Entwicklungen", "key: 'video'", "window.WRNVideoHub?.show?.()"]:
        if token not in navigation:
            error(f"release-1.5-nav.js enthält die 1.8.2-Navigation nicht: {token}")

    for token in ["window.WRNAudioTab181", "wrn-audio-region-tabs-181", "WRNAudioRegionCore"]:
        if token not in audio:
            error(f"audio-tab.js enthält die Audio-Herkunftsfilterung nicht: {token}")

    for token in ["radioCatalog", "pendingCheck", "streamCandidates"]:
        if token not in source_verification:
            error(f"source-verification.js enthält die robuste Statuslogik nicht: {token}")

    source_filters = (ROOT / "source-filters.js").read_text(encoding="utf-8") if (ROOT / "source-filters.js").is_file() else ""
    for token in ["window.WRNSourceFilters", "source-language-filter", "source-origin-filter", "Kurdî"]:
        if token not in source_filters:
            error(f"source-filters.js enthält den 1.8.2-Filtervertrag nicht: {token}")

    if "const BETA_LANGUAGES = new Set();" not in release_languages:
        error("release-1.4.js kennzeichnet zusätzliche Sprachen weiterhin als Beta.")

    if "wrn-briefing-rendered" not in briefing:
        error("briefing.js veröffentlicht das Briefing-2-Render-Ereignis nicht.")

    for token in ["window.WRNStories", "clusterStories", "perspectiveRows"]:
        if token not in developments and token not in core:
            error(f"Entwicklungsmodul enthält die erwartete Funktion nicht: {token}")

def check_config() -> None:
    path = ROOT / "config.js"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    for token in ["version:", "news:", "events:", "podcasts:", "radio:", "sourceCatalog:", "proxyUrl:"]:
        if token not in text:
            error(f"config.js enthält den Pflichtwert nicht: {token}")


def main() -> int:
    check_required_files()
    parser = check_html()
    check_inline_handlers(parser)
    check_script_order(parser)
    check_modularization()
    check_json_files()
    check_source_health()
    check_update_workflow()
    check_service_worker()
    check_event_module()
    check_reading_module()
    check_accessibility_module()
    check_audio_tools_module()
    check_source_profiles_module()
    check_translation_tools_module()
    check_data_control_module()
    check_phase1k_release_fixes()
    check_release_182()
    check_source_catalog()
    check_config()

    print("World Revolution News – App-Prüfung")
    for item in WARNINGS:
        print(f"WARNUNG: {item}")
    for item in ERRORS:
        print(f"FEHLER: {item}")
    if ERRORS:
        print(f"\nPrüfung fehlgeschlagen: {len(ERRORS)} Fehler.")
        return 1
    print("\nAlle Prüfungen erfolgreich.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
