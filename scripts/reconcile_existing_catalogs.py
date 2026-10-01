"""Reproduce the scoped 16-source/library batch from immutable Git inputs.

No network access, media copying, source discovery, signing or publication.
--write refuses to replace a catalog modified after this batch.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from library_catalog import merge_catalogs

APP_REF = '71c11c6bd4ff2d3cbc09dec41db54380f32dde58'
DATA_REF = 'dcb0e7f7e97b9a437019ad4a17c9a3bc9a8c3915'
MODE = 'metadata_and_links_only'
REASONS = {
    'queering-the-air': 'Programme identity and official RSS confirmed; use www.3cr.org.au homepage rather than TLS-failing pod subdomain.',
    'out-of-the-pan': 'Official programme homepage directly links configured RSS.',
    'live-like-the-world-is-dying': 'Creator-hosted homepage directly links configured Pinecast RSS.',
    'twelve-rules-for-what': 'Needs identity review: homepage 404; configured feed now titled Red Flare Podcast. No successor asserted.',
    'histoires-d-a': 'Programme directory directly links configured RSS; archived selection retained.',
    'l-orage': 'Publisher ORA homepage and matching L\'Orage creator feed observed; independent feed binding remains to review.',
    'carapatage': 'Programme archive identity documented; homepage and feed currently timeout. Retain last-known metadata only.',
    'chroniques-rebelles': 'Programme archive identity documented; homepage and feed currently timeout. Retain last-known metadata only.',
    'fumaca': 'Official homepage directly links configured Omny RSS.',
    'acik-yesil': 'Official programme identity confirmed; configured feed currently 403. Retain last-known metadata only.',
    'iklim-kusagi-konusuyor': 'Official programme identity confirmed; configured feed currently 403. Retain last-known metadata only.',
    'contrabanda-specials': 'Official podcast archive; mixed Spanish/Catalan cannot be verified from channel language. No fresh intake before per-episode language review.',
    'infowar-greece': 'Matching INFOWAR creator feed and official podcast section; current homepage probe 403. Endpoint binding remains to review.',
    'epanastasi-greece': 'Creator RSS identifies www.marxismos.com; official homepage identity agrees.',
    'mudawanat-arabic': 'Programme homepage directly links configured RSS; archived cultural programme. Historical CC label is not a verified rights grant.',
    'jalsa-arabic': 'Arab Reform Initiative programme homepage directly links RSS; Arabic/English remain episode-specific.',
}


def git_bytes(root, ref, name):
    return subprocess.check_output(['git', '-C', str(root), 'show', f'{ref}:{name}'])


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data', type=Path, default=ROOT.parent/'wrn-data-autonom-current')
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    data = args.data.resolve()
    inputs = {}
    def read(root, ref, name):
        payload = git_bytes(root, ref, name)
        inputs[f'{"app" if root == ROOT else "data"}/{name}'] = hashlib.sha256(payload).hexdigest()
        return json.loads(payload)
    app_sources = read(ROOT, APP_REF, 'podcast-sources.json')
    data_sources = read(data, DATA_REF, 'podcast-sources.json')
    new_ids = {s['id'] for s in app_sources} - {s['id'] for s in data_sources}
    if new_ids != set(REASONS):
        raise ValueError('The immutable inputs do not match the reviewed 16-source scope')
    observations = json.loads((ROOT/'docs/evidence/catalog-parity-2026-10-01/source-observations.json').read_text(encoding='utf-8'))
    probes = {s['sourceId']: s for s in observations['sources']}
    reviewed = {}
    for source in app_sources:
        if source['id'] not in new_ids: continue
        source = dict(source)
        source.update(contentPolicy=MODE, pageAudioFallback=False, rightsStatus='unverified', verificationNote=REASONS[source['id']])
        source['catalogReview'] = {'disposition':'metadata-only-last-known-selection', 'checkedAt':probes[source['id']]['checkedAt'],
            'episodeIntake':'hold' if source['id'] in {'twelve-rules-for-what','contrabanda-specials','l-orage','infowar-greece'} else 'metadata-only',
            'rights':{'audio':'unknown','artwork':'unknown','transcript':'unknown','offlineAudio':'unknown'},
            'evidence':'docs/evidence/catalog-parity-2026-10-01/source-observations.json'}
        if source['id'] == 'twelve-rules-for-what':
            source['enabled'] = False
            source['catalogReview']['disposition'] = 'needs-identity-review'
        if source['id'] == 'contrabanda-specials':
            source['languages'] = ['es','ca']
            source['enabled'] = False
            source['catalogReview']['disposition'] = 'needs-episode-language-review'
        if source['id'] == 'queering-the-air': source['homepage']='https://www.3cr.org.au/queeringtheair'
        reviewed[source['id']] = source
    app_sources = [reviewed.get(s['id'],s) for s in app_sources]
    data_sources += [reviewed[s['id']] for s in app_sources if s['id'] in new_ids]
    app_eps = read(ROOT,APP_REF,'podcasts.json')
    data_eps = read(data,DATA_REF,'podcasts.json')
    rules = read(ROOT,APP_REF,'podcast-content-policy.json')
    rules['metadataOnlySourceIds'] = sorted(new_ids)
    rules['metadataOnlyFeedUrls'] = sorted({url for s in reviewed.values() for url in s['feedUrls']})
    rules['metadataOnlyEpisodeIds'] = sorted({e['id'] for e in app_eps if e.get('sourceId') in new_ids})
    def project(item):
        if item.get('sourceId') not in new_ids: return item
        output = {k:v for k,v in item.items() if k in rules['metadataFields']}
        output.update(contentPolicy=MODE, episodeUrl=item.get('episodeUrl',''),feedUrl=item.get('feedUrl',''),description='',audioUrl='',artwork='')
        if item['sourceId']=='contrabanda-specials':
            output.update(language='und',languageVerified=False,languageReviewRequired=True,languageConfidence=0,languageSource='mixed-channel-requires-review',configuredLanguages=['es','ca'])
        return output
    app_eps = [project(e) for e in app_eps]
    existing = {e['id'] for e in data_eps}
    additions = [project(e) for e in app_eps if e.get('sourceId') in new_ids and e['id'] not in existing]
    data_eps += additions
    app_books = read(ROOT,APP_REF,'library-feed.json')
    data_books = read(data,DATA_REF,'library-feed.json')
    book_sources = read(data,DATA_REF,'library-sources.json')
    books = merge_catalogs([app_books,data_books],book_sources)
    outputs = {}
    for root,sources,episodes in [(ROOT,app_sources,app_eps),(data,data_sources,data_eps)]:
        outputs[root/'podcast-sources.json'] = encode(sources)
        outputs[root/'podcasts.json'] = encode(episodes)
        outputs[root/'podcast-content-policy.json'] = encode(rules)
        outputs[root/'library-sources.json'] = encode(book_sources)
        outputs[root/'library-feed.json'] = encode(books)
    js = (ROOT/'podcast-content-policy.js').read_text(encoding='utf-8')
    start = js.index('/* POLICY_RULES_START */')+len('/* POLICY_RULES_START */')
    end = js.index('/* POLICY_RULES_END */')
    outputs[ROOT/'podcast-content-policy.js']=(js[:start]+' '+json.dumps(rules,ensure_ascii=False,indent=2)+' '+js[end:]).encode('utf-8')
    outputs[data/'library_catalog.py']=(ROOT/'library_catalog.py').read_bytes()
    for root,ref in [(ROOT,APP_REF),(data,DATA_REF)]:
        health=read(root,ref,'podcast-health.json')
        for key,s in reviewed.items():
            obs=next(o for o in probes[key]['observations'] if o['kind']=='feed')
            health[key]={'name':s['name'],'status':'last-known-metadata','ok':obs.get('status')==200,
                'episodes':sum(e['sourceId']==key for e in app_eps),'freshEpisodes':0,
                'checkedAt':probes[key]['checkedAt'],'latestFeedPublished':obs.get('latestPublished'),
                'feedStatus':obs.get('status',obs.get('error')),'admission':s['catalogReview']['disposition']}
        outputs[root/'podcast-health.json']=encode(health)
        health=read(root,ref,'library-health.json')
        health['itemCount']=len(books)
        health['catalogProjection']={'status':'merged-existing-metadata-not-a-new-crawl','inputRefs':{'app':APP_REF,'data':DATA_REF},
            'indexedItemsBySource':dict(Counter(b['sourceId'] for b in books)),'downloadRights':'not-granted; original-host links only'}
        outputs[root/'library-health.json']=encode(health)
    # Guard catalog files against unrelated changes; implementation files are handled separately.
    for path,payload in outputs.items():
        if path.name.endswith('.json'):
            ref=APP_REF if path.parent==ROOT else DATA_REF
            old=git_bytes(path.parent,ref,path.name)
            current = json.loads(path.read_bytes())
            if current not in [json.loads(old),json.loads(payload)]: raise ValueError(f'Refusing to overwrite modified catalog: {path}')
    manifest={'schemaVersion':1,'scope':'16 app-only sources and common library metadata; local candidate',
        'inputRefs':{'app':APP_REF,'data':DATA_REF},'inputSha256':inputs,
        'outputSha256':{f'{"app" if p.parent==ROOT else "data"}/{p.name}':hashlib.sha256(v).hexdigest() for p,v in outputs.items()},
        'registeredSources':16,'newPublishers':0,'importedExistingEpisodeMetadata':len(additions),
        'heldSourceIds':[k for k,v in reviewed.items() if v['catalogReview']['episodeIntake']=='hold'],
        'libraryItems':len(books),'germanTitles':sum('de' in b['languages'] for b in books),
        'preservedAppBookIds':len(app_books),'preservedDataBookIds':len(data_books),
        'identityAndLanguageHoldsAreNotAdmission':True,'publication':'local-only','versionCode':None}
    if args.write:
        for path,payload in outputs.items():path.write_bytes(payload)
        (ROOT/'docs/evidence/catalog-parity-2026-10-01/bindings.json').write_bytes(encode(manifest))
    print(json.dumps({k:v for k,v in manifest.items() if 'Sha256' not in k},ensure_ascii=True))


if __name__=='__main__': main()
