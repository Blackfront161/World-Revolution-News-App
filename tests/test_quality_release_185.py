#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
REGIONS = {
    "Global", "Europe", "Africa", "North America",
    "Latin America", "Asia", "Australia & NZ",
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
assert news
for article in news:
    assert article["primaryRegion"] in REGIONS
    assert article["primaryTopic"] in TOPICS
    assert article["categories"][0] == article["primaryRegion"]
    assert article["primaryTopic"] in article["categories"]
    assert len([value for value in article["categories"] if value in REGIONS]) == 1
    assert 0 <= float(article["classificationConfidence"]) <= 1
    assert isinstance(article["secondaryTopics"], list)
    assert isinstance(article["editorialReview"], bool)

review = json.loads((ROOT / "editorial-review.json").read_text(encoding="utf-8"))
assert review["count"] == len(review["items"])
assert all(0 <= float(row["confidence"]) < 0.61 for row in review["items"])

stories = (ROOT / "stories-core.js").read_text(encoding="utf-8")
timeline = (ROOT / "stories-timeline.js").read_text(encoding="utf-8")
assert "Math.max(0.52" in stories
assert "first.type !== second.type" in stories
assert "'summer','winter'" in stories
assert "matchReasons" in stories
assert "wrn-stories-beta-185" in timeline
assert "allKinds" in timeline and "eventKind" in timeline
assert "clusterIndex" in stories

app = (ROOT / "app.js").read_text(encoding="utf-8")
assert "deduplicateArticles" in app
assert "mixed.length < 10" in app
assert "? 1 : 2" in app
assert "sourceFilter === 'ALL'" in app

briefing = (ROOT / "briefing.js").read_text(encoding="utf-8")
assert "wrn-briefing-wizard-step-185" in briefing
assert "Erweiterte Einstellungen" in briefing

audio = (ROOT / "audio-tab-183.js").read_text(encoding="utf-8")
assert "allCategories" in audio
assert "isEditoriallyRelevant" in audio
render_start = audio.index("function render()")
render_end = audio.index("function renderList()", render_start)
assert "wrn-audio-tabs-183" not in audio[render_start:render_end]

events = (ROOT / "events.js").read_text(encoding="utf-8")
assert "International / unklar" in events
assert "timeZoneName:'short'" in events
assert "collapseRecurringEvents" in events
assert "getEventEndMs(article)" in events

nav_css = (ROOT / "release-1.5-nav.css").read_text(encoding="utf-8")
assert nav_css.rfind("min-width: 44px !important") > nav_css.rfind("min-width: 28px !important")

about = (ROOT / "about-tab.js").read_text(encoding="utf-8")
assert "Wie Quellen ausgewählt werden" in about
assert "Datenschutz und KI-Hinweise" in about
assert "Mastodon" in about and "PeerTube" in about and "Mobilizon" in about

social = json.loads((ROOT / "alternative-social-media.json").read_text(encoding="utf-8"))
assert social["automaticFeedEnabled"] is False
assert len(social["platforms"]) >= 4

lexicon = (ROOT / "lexicon-tab.js").read_text(encoding="utf-8")
base_block = lexicon[lexicon.index("const TERMS = ["):lexicon.index("const extraTerm")]
base_count = len(re.findall(r"\bid:\s*'[^']+'", base_block))
extra_count = len(re.findall(r"\bextraTerm\(", lexicon))
assert 150 <= base_count + extra_count <= 170, (base_count, extra_count)
assert "downloadEpub" in lexicon
assert "printLexicon" in lexicon
assert "revisionSection" in lexicon

translation = (ROOT / "translation-tools.js").read_text(encoding="utf-8")
assert "Maschinell übersetzt" in translation
assert "translation-original-link-185" in translation
for language in ("es", "fr", "it", "pt", "ru", "el", "tr"):
    assert re.search(rf"\n\s*{language}:\s*\{{", translation)

release = (ROOT / "scripts" / "build-android-release.ps1").read_text(encoding="utf-8")
release_helpers = (ROOT / "scripts" / "wrn-aab-release-helpers.ps1").read_text(encoding="utf-8")
for token in (
    "git worktree add", "npm.cmd run sync:android", "bundleRelease",
    "versionCode", "jarsigner", "Compare-WrnHashManifest",
    "release-report-code", "SHA256",
    "Assert-AndroidSplashTransition", "postSplashScreenTheme",
    "SplashScreen\\.installSplashScreen",
    "Get-WebVersion", "stimmt nicht mit der Webversion",
    "Get-WrnWebAssetManifest", "Clear-WrnWebDirectory",
    "Invoke-WrnArtifactTransaction", "New-WrnVerifiedSignedAab", "releaseReady",
):
    assert token in release
assert "-verify -verbose -certs" in release_helpers
assert "-verify -strict -certs" not in release + release_helpers
for token in (
    "news-archive", "RelativePath", "SourceRepository",
    "cordova.js", "cordova_plugins.js", "Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File",
    "HasSignatureFile", "HasSignatureBlock", "ExpectedCertificateSha256",
    "JarsignerReportedVerified", "CertificateMatches",
    "Assert-WrnAabSignature", "Invoke-WrnArtifactTransaction",
    "Assert-WrnPathHasNoReparsePoints", ".wrn-publish-",
    ".wrn-web-quarantine-", "Remove-WrnDirectoryTreeWithoutReparsePoints",
):
    assert token in release_helpers

print(
    "WRN 1.8.5 quality release: "
    f"{len(news)} classified articles, {review['count']} review items, "
    f"{base_count + extra_count} glossary terms."
)
