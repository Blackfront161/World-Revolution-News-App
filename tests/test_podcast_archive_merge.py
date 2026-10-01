import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location('archive_merge', Path(__file__).resolve().parents[1]/'scripts/reconcile_podcast_archive.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def test_partial_refresh_preserves_archive_and_withdrawal():
    old = {'id':'old','sourceId':'source','title':'Old'}
    gone = {'id':'gone','sourceId':'source','status':'withdrawn'}
    result = module.merge_archive([[old,gone],[{'id':'gone','sourceId':'source','title':'Stale'}]], [{'id':'source'}])
    assert {item['id'] for item in result} == {'old','gone'}
    assert next(item for item in result if item['id']=='gone')['status'] == 'withdrawn'


def test_metadata_restriction_survives_stale_payload():
    result = module.merge_archive([[{'id':'test','sourceId':'mudawanat-arabic','title':'T','audioUrl':'https://example.org/test.mp3','license':'CC-BY'}]], [{'id':'mudawanat-arabic'}])
    assert result[0]['audioUrl'] == ''
    assert result[0]['license'] == 'Rights unverified; original source only'


def test_language_conflicts_cannot_be_restored_by_stale_payload():
    policy = json.loads((module.ROOT/'podcast-content-policy.json').read_bytes())
    for identifier in policy['languageConflictEpisodeIds']:
        row = module.project_episode({'id':'original:'+identifier,'language':'en','languageVerified':True}, None, [])
        assert row['language'] == 'und'
        assert row['languageVerified'] is False
        assert row['languageReviewRequired'] is True
