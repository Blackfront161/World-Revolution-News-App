#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

config = (ROOT / 'config.js').read_text(encoding='utf-8')
worker = (ROOT / 'service-worker.js').read_text(encoding='utf-8')
index = (ROOT / 'classic.html').read_text(encoding='utf-8')
aggregate = (ROOT / 'aggregate.py').read_text(encoding='utf-8')
source_filters = (ROOT / 'source-filters.js').read_text(encoding='utf-8')
source_verification = (ROOT / 'source-verification.js').read_text(encoding='utf-8')
registry = json.loads((ROOT / 'multilingual-source-registry.json').read_text(encoding='utf-8'))
sources_registry = json.loads((ROOT / 'sources-registry.json').read_text(encoding='utf-8'))
language_audit = json.loads((ROOT / 'language-source-audit.json').read_text(encoding='utf-8'))

assert "version: '1.8.4'" in config
assert "sourceCatalog: 'https://blackfront161.github.io/Revolution-News-Data/sources-registry.json'" in config
assert 'source-filters.js' in config
assert 'wrn-app-v2.1.1-r1' in worker and 'wrn-data-v2.1.1-r1' in worker
assert 'source-filters.js' in worker
assert 'source-language-filter' in index and 'source-origin-filter' in index
assert 'WRN MULTILINGUAL SOURCES 1.8.2 START' in aggregate
assert aggregate.count('quellen = {') == 1
assert 'window.WRNSourceFilters' in source_filters
assert 'wrn-source-language-filter' in source_verification
assert 'wrn-source-origin-filter' in source_verification

assert registry['policy']['keepExistingSources'] is True
assert 'Democracy Now!' in registry['policy']['excluded']
by_name = {item.get('name'): item for item in registry['sources']}
expected = {
    'Bianet Türkçe': ('tr', 'Türkiye'),
    'Evrensel': ('tr', 'Türkiye'),
    'Bianet Kurdî': ('ku', 'Türkiye'),
    'Pressin Kurdî': ('ku', 'Kurdistan Region'),
}
for name, (language, origin) in expected.items():
    item = by_name[name]
    assert item['languages'] == [language]
    assert origin in {item.get('originCountry'), item.get('originRegion')}

built_by_name = {item.get('name'): item for item in sources_registry['sources']}
for name, (language, origin) in expected.items():
    item = built_by_name[name]
    assert language in item['languages']
    assert origin in {item.get('originCountry'), item.get('originRegion')}

assert language_audit['version'] == '1.8.2'
assert language_audit['requiredSourceLanguages'] == ['tr', 'ku']
assert language_audit['missingRequiredSourceLanguages'] == []
assert language_audit['activeLanguages'].get('tr', 0) >= 2
assert language_audit['activeLanguages'].get('ku', 0) >= 2

print('WRN 1.8.2 Funktionsverträge unter 1.8.4: OK')
