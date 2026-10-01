import json
from pathlib import Path
import subprocess
import hashlib
import sys
import pytest
from unittest.mock import patch

import aggregate_podcasts as collector
from podcast_content_policy import project_episode, preserve_failed_sources

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT.parent/'wrn-data-autonom-current'
INPUTS = [(ROOT,'71c11c6bd4ff2d3cbc09dec41db54380f32dde58'),(DATA,'dcb0e7f7e97b9a437019ad4a17c9a3bc9a8c3915')]
LOCAL_INPUTS_AVAILABLE = all(root.exists() and subprocess.run(
    ['git','-C',str(root),'cat-file','-e',ref+':podcasts.json'],capture_output=True
).returncode==0 for root,ref in INPUTS)
local_snapshot = pytest.mark.skipif(not LOCAL_INPUTS_AVAILABLE,
    reason='Local immutable app/data input checkouts are unavailable; fixture policy/merge contracts still run')


def read(root, name): return json.loads((root/name).read_text(encoding='utf-8'))


@local_snapshot
def test_stable_ids_unaffected_archives_and_languages_are_preserved():
    ids = set(read(ROOT,'podcast-content-policy.json')['metadataOnlySourceIds'])
    for root,ref in INPUTS:
        previous = json.loads(subprocess.check_output(['git','-C',str(root),'show',f'{ref}:podcasts.json']))
        current = {row['id']:row for row in read(root,'podcasts.json')}
        assert all(e['id'] in current for e in previous)
        assert all(current[e['id']] == e for e in previous if e['sourceId'] not in ids)
        sources = read(root,'podcast-sources.json')
        assert ids <= {s['id'] for s in sources}
        old_sources = json.loads(subprocess.check_output(['git','-C',str(root),'show',f'{ref}:podcast-sources.json']))
        assert all(s == next(x for x in sources if x['id']==s['id']) for s in old_sources if s['id'] not in ids)
        assert next(s for s in sources if s['id']=='twelve-rules-for-what')['enabled'] is False
        for e in current.values():
            if e['sourceId'] in ids:
                assert not e['audioUrl'] and not e['artwork'] and not e['description']
                assert e['contentPolicy']=='metadata_and_links_only'
                assert e['rightsStatus']=='unverified' and e['license']=='Rights unverified; original source only'
                assert e['episodeUrl'].startswith('https://')
                if e['sourceId']=='contrabanda-specials':assert e['language']=='und' and e['languageReviewRequired']


def test_non_rdl_stale_ids_do_not_get_reassigned_to_rdl():
    rules=read(ROOT,'podcast-content-policy.json')
    row=project_episode({'id':'original:'+rules['metadataOnlyEpisodeIds'][0],'sourceId':'fumaca','license':'CC BY-NC-ND 3.0','audioUrl':'https://example.org/audio.mp3','summary':'foreign','episodeUrl':'https://example.org/episode'})
    assert row['sourceId']=='fumaca' and not row['audioUrl'] and 'summary' not in row
    assert 'endpointId' not in row
    assert row['rightsStatus']=='unverified' and 'CC' not in row['license']


def test_intake_holds_do_not_contact_network():
    source={'id':'twelve-rules-for-what','catalogReview':{'episodeIntake':'hold'}}
    with patch.object(collector.session,'get',side_effect=AssertionError('Held intake must not contact network')):
        rows,_,errors=collector.source_entries(source)
    assert not rows and errors


def test_failed_sources_survive_successful_refresh_and_narrow_archive_budget():
    held=project_episode({'id':'retained','sourceId':'l-orage','episodeUrl':'https://example.org/episode'})
    good={'id':'updated','sourceId':'good','audioUrl':'https://example.org/audio.mp3'}
    result=preserve_failed_sources([good],[held],{'good':{'ok':True},'l-orage':{'ok':False}})
    assert {e['id'] for e in result}=={'retained','updated'}
    assert next(e for e in result if e['id']=='retained')==held


def test_stale_mixed_channel_language_cannot_override_review_hold():
    rules=read(ROOT,'podcast-content-policy.json')
    for item in [{'sourceId':'contrabanda-specials'}, {'id':'original:'+rules['unverifiedLanguageEpisodeIds'][0]}]:
        result=project_episode({**item,'language':'es','languageVerified':True})
        assert result['language']=='und' and result['languageVerified'] is False and result['languageReviewRequired']


@local_snapshot
def test_common_library_contains_all_input_ids_and_german_books():
    app=read(ROOT,'library-feed.json');data=read(DATA,'library-feed.json')
    assert app==data and len(app)==715
    assert sum('de' in b['languages'] for b in app)==53
    ids={b['id'] for b in app}
    for root,ref in INPUTS:
        previous=json.loads(subprocess.check_output(['git','-C',str(root),'show',f'{ref}:library-feed.json']))
        assert {b['id'] for b in previous} <= ids
    assert {b['sourceId'] for b in app} <= {s['id'] for s in read(ROOT,'library-sources.json')}


@local_snapshot
def test_dry_reproduction_does_not_change_bound_product_or_evidence_bytes():
    files=[r/name for r,_ in INPUTS for name in ['podcast-sources.json','podcasts.json','podcast-content-policy.json','library-feed.json','library-sources.json','podcast_content_policy.py']]
    files += [ROOT/'podcast-content-policy.js',ROOT/'docs/evidence/catalog-parity-2026-10-01/bindings.json']
    before={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    subprocess.run([sys.executable,'-B',str(ROOT/'scripts/reconcile_existing_catalogs.py')],cwd=ROOT,check=True,capture_output=True)
    assert before=={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
