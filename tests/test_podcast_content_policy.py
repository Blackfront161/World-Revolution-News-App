import hashlib
import json
from pathlib import Path
import importlib.util
import sys
from unittest.mock import patch

import feedparser
import aggregate_podcasts as app
from podcast_content_policy import MODE, RULES, metadata_only, project_episode, episode_key

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT.parent / 'wrn-data-autonom-current'


def test_strongest_policy_and_projection():
    item = {'id': RULES['restrictedEpisodeIds'][0], 'title': 'Test', 'audioUrl': 'https://example.org/a.mp3',
            'episodeUrl': 'https://rdl.de/beitrag/test', 'description': 'Full text', 'image': 'image',
            'contentPolicy': 'playable', 'summary': 'Summary', 'transcript': 'Transcript', 'candidates': ['audio']}
    result = project_episode(item)
    assert result['id'] == item['id'] and result['sourceId'] == RULES['canonicalSourceId']
    assert result['contentPolicy'] == MODE and result['episodeUrl'] == item['episodeUrl']
    assert not result['audioUrl'] and not result['description'] and not result['artwork']
    assert not {'image', 'summary', 'transcript', 'candidates'} & result.keys()
    assert metadata_only({'sourceId': 'restricted'}, sources=[{'id': 'restricted', 'contentPolicy': MODE}])
    assert not metadata_only({}, sources=[{'contentPolicy': MODE}])


def test_catalog_identity_and_policy_are_preserved():
    roots = [ROOT]
    if DATA.exists(): roots.append(DATA)
    for root in roots:
        sources = json.loads((root/'podcast-sources.json').read_text(encoding='utf-8'))
        assert len(sources) == len({source['id'] for source in sources})
        endpoint = next(source for source in sources if source['id'] == RULES['endpointId'])
        assert endpoint['canonicalSourceId'] == RULES['canonicalSourceId']
        assert endpoint['episodeIdNamespace'] == 'None' and endpoint['contentPolicy'] == MODE
        rows = json.loads((root/'podcasts.json').read_text(encoding='utf-8'))
        restricted = [item for item in rows if item['id'] in RULES['restrictedEpisodeIds']]
        assert {item['id'] for item in restricted} == set(RULES['restrictedEpisodeIds'])
        assert all(item['sourceId'] == RULES['canonicalSourceId'] and item['contentPolicy'] == MODE for item in restricted)
        assert all(not item['audioUrl'] and not item['description'] and not item['artwork'] for item in restricted)
        assert (root/'podcast-content-policy.json').read_bytes() == (ROOT/'podcast-content-policy.json').read_bytes()


def collector_modules():
    yield app
    if DATA.exists():
        spec = importlib.util.spec_from_file_location('data_podcast_collector_policy_test', DATA/'aggregate_podcasts.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        yield module


def test_collector_keeps_guid_namespace_and_accepts_original_link_without_audio():
    xml = b'''<rss version="2.0"><channel><title>RDL</title><language>de</language>
    <item><title>Solidarische Politik</title><guid>stable-guid</guid><link>https://rdl.de/beitrag/test</link>
    <description>Foreign copied description</description></item></channel></rss>'''
    source = {'id': RULES['endpointId'], 'canonicalSourceId': RULES['canonicalSourceId'], 'episodeIdNamespace': 'None',
              'name': 'Radio Dreyeckland', 'feedUrl': RULES['feedUrls'][0], 'feedUrls': RULES['feedUrls'],
              'language': 'de', 'contentPolicy': MODE, 'pageAudioFallback': True}
    class Response:
        content = xml
        def raise_for_status(self): pass
    for collector in collector_modules():
        with patch.object(collector, 'discover_feeds', return_value=[]), patch.object(collector.session, 'get', return_value=Response()), patch.object(collector, 'find_audio_on_page', side_effect=AssertionError('Media page fetch forbidden')):
            rows, used_feed, errors = collector.source_entries(source)
        assert len(rows) == 1, errors
        assert rows[0]['id'] == hashlib.sha256(b'None|stable-guid').hexdigest()[:24]
        assert rows[0]['sourceId'] == RULES['canonicalSourceId'] and rows[0]['endpointId'] == RULES['endpointId']
        assert rows[0]['contentPolicy'] == MODE and not rows[0]['audioUrl'] and not rows[0]['description']
        assert rows[0]['episodeUrl'] == 'https://rdl.de/beitrag/test'
        assert used_feed == RULES['feedUrls'][0]


def test_metadata_dedup_does_not_collapse_empty_audio():
    rows = [project_episode({'id': value, 'episodeUrl':'https://rdl.de/beitrag/'+str(index)})
            for index, value in enumerate(RULES['restrictedEpisodeIds'][:2])]
    assert len(app.deduplicate_episodes([*rows, rows[0]])) == 2
    assert episode_key(rows[0]) != episode_key(rows[1])


def test_failed_targeted_refresh_keeps_sanitized_previous_and_unrelated_records(tmp_path, monkeypatch):
    for index, collector in enumerate(collector_modules()):
        root = tmp_path/str(index); root.mkdir()
        source = {'id': RULES['endpointId'], 'canonicalSourceId':RULES['canonicalSourceId'],
                  'contentPolicy':MODE, 'name':'RDL', 'feedUrl':RULES['feedUrls'][0]}
        previous = [{'id':RULES['restrictedEpisodeIds'][0], 'sourceId':'', 'feedUrl':RULES['feedUrls'][0],
                    'episodeUrl':'https://rdl.de/beitrag/test', 'audioUrl':'https://rdl.de/a.mp3', 'description':'Foreign', 'language':'de'},
                    {'id':'ordinary', 'sourceId':'other', 'audioUrl':'https://example.org/audio.mp3', 'language':'de'}]
        (root/'sources.json').write_text(json.dumps([source]),encoding='utf-8')
        (root/'pods.json').write_text(json.dumps(previous),encoding='utf-8')
        monkeypatch.setattr(collector,'SOURCES_FILE',root/'sources.json')
        monkeypatch.setattr(collector,'OUTPUT_FILE',root/'pods.json')
        monkeypatch.setattr(collector,'HEALTH_FILE',root/'health.json')
        monkeypatch.setattr(collector,'source_entries',lambda source:([], '', ['offline fixture']))
        if hasattr(collector,'partitioned_catalog'):
            monkeypatch.setattr(collector,'partitioned_catalog',lambda items: [])
        else:
            monkeypatch.setattr(collector,'MAX_TOTAL',1)
        monkeypatch.setenv('WRN_PODCAST_SOURCE_IDS',RULES['canonicalSourceId'])
        # Include the publisher identity as a catalog row, as in the actual catalogs.
        sources=[source, {'id':RULES['canonicalSourceId'], 'name':'RDL publisher'}]
        (root/'sources.json').write_text(json.dumps(sources),encoding='utf-8')
        assert collector.main() == 0
        result=json.loads((root/'pods.json').read_text(encoding='utf-8'))
        assert {item['id'] for item in result} == {item['id'] for item in previous}
        restricted=next(item for item in result if item['id']==previous[0]['id'])
        assert restricted['sourceId']==RULES['canonicalSourceId'] and restricted['contentPolicy']==MODE
        assert not restricted['audioUrl'] and not restricted['description']
        assert next(item for item in result if item['id']=='ordinary')['audioUrl']==previous[1]['audioUrl']
