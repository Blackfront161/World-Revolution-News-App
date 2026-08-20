#!/usr/bin/env python3
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
LANGS = ['de','en','es','fr','it','pt','ru','el','tr']


class LanguageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_select = False
        self.values: list[str] = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'select' and attributes.get('id') == 'ui-language':
            self.in_select = True
        elif self.in_select and tag == 'option' and attributes.get('value'):
            self.values.append(attributes['value'])

    def handle_endtag(self, tag):
        if tag == 'select' and self.in_select:
            self.in_select = False


index = (ROOT / 'classic.html').read_text(encoding='utf-8')
parser = LanguageParser()
parser.feed(index)
assert parser.values == ['en','de','es','fr','it','pt','ru','el','tr'], parser.values

i18n = (ROOT / 'wrn-i18n.js').read_text(encoding='utf-8')
assert "SUPPORTED_LANGUAGES = Object.freeze(['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'el', 'tr'])" in i18n
for token in ['Entwicklungen', 'Developments', 'Desarrollos', 'Évolutions', 'Sviluppi', 'Desenvolvimentos', 'Развитие событий', 'Εξελίξεις', 'Gelişmeler']:
    assert token in i18n, token

navigation = (ROOT / 'release-1.5-nav.js').read_text(encoding='utf-8')
tabs = navigation[navigation.index('const TABS = ['):navigation.index('const state = {')]
tab_order = [
    tabs.index("key: 'regions'"),
    tabs.index("key: 'topics'"),
    tabs.index("key: 'video'"),
    tabs.index("key: 'events'"),
]
assert tab_order == sorted(tab_order), tab_order

release = (ROOT / 'release-1.4.js').read_text(encoding='utf-8')
assert 'const BETA_LANGUAGES = new Set();' in release
assert "document.getElementById('language-beta-note')?.remove();" in release

audio = (ROOT / 'audio-tab.js').read_text(encoding='utf-8')
assert 'wrn-audio-region-tabs-181' in audio
assert 'WRNAudioRegionCore' in audio
assert "['original','generated','radio']" in audio
assert 'stopImmediatePropagation' not in audio

source = (ROOT / 'source-verification.js').read_text(encoding='utf-8')
for token in [
    'radioCatalog',
    'pendingCheck',
    'streamCandidates',
    'item.audioStatus',
    'item.audioDetail',
    "tr: { title:'Kaynak doğrulama'"
]:
    assert token in source, token

video = (ROOT / 'video-hub.js').read_text(encoding='utf-8')
for token in ['window.WRNVideoHub', 'youtube-nocookie.com', 'PeerTube', 'data-video-preview']:
    assert token in video, token

config = (ROOT / 'config.js').read_text(encoding='utf-8')
worker = (ROOT / 'service-worker.js').read_text(encoding='utf-8')
for token in ["version: '1.8.4'", 'video-hub.js', 'audio-region-core.js']:
    assert token in config, token
for token in ['wrn-app-v2.1.0-r4', 'wrn-data-v2.1.0-r2', 'video-hub.js', 'audio-region-core.js']:
    assert token in worker, token

feature = (ROOT / 'feature-audit.json').read_text(encoding='utf-8')
assert '"version": "1.8.2"' in feature
assert '"video_hub"' in feature
assert '"criticalMissing": 0' in feature

language_audit = (ROOT / 'language-source-audit.json').read_text(encoding='utf-8')
assert '"version": "1.8.2"' in language_audit
assert '"missingInterfaceLanguages": []' in language_audit
assert '"missingOfferedLanguages": []' in language_audit

print('WRN 1.8.1/1.8.2 Funktionsverträge unter 1.8.4: OK')
