"""Integrate the hash-bound local candidate; publication has separate gates."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(name): return json.loads((ROOT/name).read_text(encoding='utf-8'))
def write(name,obj): (ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
candidate=read('docs/evidence/WRN-CONTENT-EDITORIAL-2026-10-03/intake-candidate.json')
for name,key in [('library-feed.json','bookRecords'),('podcasts.json','podcastRecords')]:
    old=read(name); ids={r['id'] for r in old}; new=[r for r in candidate[key] if r['id'] not in ids]
    write(name,old+new)
rules=read('podcast-content-policy.json')
rules['metadataOnlyEpisodeIds']=sorted(set(rules['metadataOnlyEpisodeIds'])|{r['id'] for r in candidate['podcastRecords']})
write('podcast-content-policy.json',rules)
script=(ROOT/'podcast-content-policy.js').read_text(encoding='utf-8')
script=re.sub(r'/\* POLICY_RULES_START \*/.*?/\* POLICY_RULES_END \*/',lambda _: '/* POLICY_RULES_START */ '+json.dumps(rules,ensure_ascii=False,indent=2)+' /* POLICY_RULES_END */',script,flags=re.S)
(ROOT/'podcast-content-policy.js').write_text(script,encoding='utf-8')
for name in ['index.html','service-worker.js','news-app-2-sw.js']:
    path=ROOT/name; text=path.read_text(encoding='utf-8').replace('lexicon-tab.js?release=11','lexicon-tab.js?release=12').replace('podcast-content-policy.js?release=4','podcast-content-policy.js?release=5')
    text=text.replace("wrn-app-v2.1.2-r30", "wrn-app-v2.1.2-r31").replace('`${CACHE_PREFIX}v118`','`${CACHE_PREFIX}v119`')
    path.write_text(text,encoding='utf-8')
print('Local reviewed-candidate runtime integrated; previous records retained; new IDs metadata-only in all catalog orders.')
