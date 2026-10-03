"""Prepare a bounded metadata-only intake from pinned candidate dossiers."""
import concurrent.futures, datetime, hashlib, json, subprocess, sys, urllib.error, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WEBSITE=Path('C:/Users/patri/Documents/World Revolution News/wrn-next-live-work')
DATA=ROOT.parent/'wrn-data-podcast-queue'
EVIDENCE=ROOT/'docs/evidence/WRN-CONTENT-EDITORIAL-2026-10-03'
def load(path): return json.loads(path.read_text(encoding='utf-8'))
def write(path,obj): path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def check(candidate):
    result={'id':candidate['record']['id'],'url':candidate['record']['url'],'observedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        req=urllib.request.Request(result['url'],method='HEAD',headers={'User-Agent':'WRN metadata review/1.0'})
        with urllib.request.urlopen(req,timeout=20) as response:
            result.update(status=response.status,finalUrl=response.url)
    except Exception as e: result['error']=str(e)[:200]
    return result
def main():
    book_dossier=load(WEBSITE/'docs/evidence/WRN-WEBSITE-LIBRARY-ADAPTERS-2026-10-03/observations.json')
    observations={r['id']:r for r in load(EVIDENCE/'primary-observations.json')['results'] if r['kind']=='book'}
    previous=load(ROOT/'library-feed.json'); originals={r.get('readUrl','').removesuffix('.epub').removesuffix('.pdf') for r in previous}; ids={r['id'] for r in previous}
    books=[]
    for row in book_dossier['germanCandidates']:
        obs=observations[row['id']]; meta=obs['metadata']
        if obs.get('status')!=200 or obs['finalUrl']!=row['upstreamId'] or meta.get('htmlLanguage')!='de': raise ValueError('Unverified book original')
        title=meta['og:title']; authors=meta.get('og:book:author') or meta.get('og:article:author')
        if row['id'] in ids or row['upstreamId'] in originals: raise ValueError('Existing identity/edition conflict')
        books.append({'id':row['id'],'sourceId':row['sourceId'],'sourceName':'Anarchistische Bibliothek (Deutsch)',
            'title':title,'authors':[authors] if authors and authors!='Anonym' else [],'languages':['de'],
            'languageSource':'individual-original-html-language','languageVerified':True,'topics':[],
            'formats':['html'],'readUrl':row['upstreamId'],'downloads':{},'upstreamId':row['upstreamId'],
            'updatedAt':obs['observedAtUTC'],'updatedAtMeaning':'WRN metadata review, not publisher publication date',
            'contentPolicy':'metadata_and_links_only','rightsStatus':'unverified','editorialReview':{
                'date':'2026-10-03','scope':'title/author/language/original/edition identity only; no body/media/download permission',
                'decision':'metadata-original-link-admitted','evidenceSha256':obs['inputSha256']}})
    dossier=load(WEBSITE/'docs/evidence/WRN-WEBSITE-PODCAST-ID-REVIEW-2026-10-03/candidate-review.json')
    eligible=set(dossier['structurallyConsistentIds'])
    candidates=[r for r in dossier['candidates'] if r['record']['id'] in eligible and 'newsletter' not in r['record']['title'].casefold()]
    if '--use-observations' in sys.argv:
        probes=load(EVIDENCE/'podcast-original-observations.json')['results']
        if {r['id'] for r in probes}!={r['record']['id'] for r in candidates}: raise ValueError('Observation identity mismatch')
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: probes=list(pool.map(check,candidates))
        write(EVIDENCE/'podcast-original-observations.json',{'scope':'HEAD original pages only; no audio/artwork/body requests; no spoken-language claim','results':probes})
    reachable={r['id'] for r in probes if r.get('status')==200 and r.get('finalUrl')==r['url']}
    raw=json.loads(subprocess.check_output(['git','show','5304fa0032a6761071962e4b74b66cb6f114c49f:podcasts.json'],cwd=DATA))
    by_id={r['id']:r for r in raw}; old=load(ROOT/'podcasts.json'); old_ids={r['id'] for r in old}
    policy=load(ROOT/'podcast-content-policy.json'); restricted=set(policy['restrictedEpisodeIds'])
    sources={r['id']:r for r in load(ROOT/'podcast-sources.json')}
    podcasts=[]; decisions=[]
    for c in dossier['candidates']:
        accepted=c['record']['id'] in reachable
        if c.get('sourceHoldIds') or c.get('restrictedIds') or c.get('unconfiguredSourceIds'): accepted=False
        for upstream in c.get('newUpstreamIds',[]):
            row=by_id[upstream]; source=sources.get(row['sourceId'],{})
            held=source.get('catalogReview',{}).get('episodeIntake')=='hold'
            if accepted and not held and upstream not in restricted and upstream not in old_ids:
                keep={k:row[k] for k in ['id','type','sourceId','sourceName','title','published','language','country','region','episodeUrl','feedUrl'] if k in row}
                keep.update(contentPolicy='metadata_and_links_only',description='',audioUrl='',artwork='',
                    languageVerified=c['languageVerified'],languageSource='upstream-item-metadata; no new audio language verification',
                    editorialReview={'date':'2026-10-03','scope':'metadata-original-link only','decision':'admitted',
                    'source':'existing configured independent/community radio, movement culture, queer or labour-history source',
                    'candidateId':c['record']['id']})
                podcasts.append(keep); old_ids.add(upstream)
        decisions.append({'id':c['record']['id'],'upstreamIds':c.get('newUpstreamIds',[]),
            'decision':'metadata-original-link-admitted' if accepted else 'hold',
            'reason':'known-source/item-metadata/original reviewed; media rights not admitted' if accepted else 'language/redirect/availability/identity review unresolved or newsletter excluded'})
    write(EVIDENCE/'intake-candidate.json',{'baselineBooks':len(previous),'baselinePodcastRows':len(old),'bookRecords':books,'podcastRecords':podcasts,'podcastDecisions':decisions,
        'preservation':'All previous records retained byte-field-equivalent; no URL/date/ID migrations; all existing source/episode holds unchanged'})
    print(json.dumps({'books':len(books),'newPodcastRows':len(podcasts),'newOriginalPages':len(reachable),'heldCandidates':len(decisions)-len(reachable)}))
if __name__=='__main__': main()
