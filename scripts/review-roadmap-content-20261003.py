"""Bounded primary-page metadata observation; never persist publisher bodies/media."""
import concurrent.futures, datetime, hashlib, json, re, ssl, urllib.request
from html.parser import HTMLParser
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
WEBSITE = Path('C:/Users/patri/Documents/World Revolution News/wrn-next-live-work')
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta = {}; self.title = []; self.in_title = False; self.text = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title': self.in_title = True
        if tag == 'html': self.meta['htmlLanguage'] = a.get('lang')
        if tag == 'meta': self.meta[a.get('name') or a.get('property') or ''] = a.get('content', '')
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title.append(data)
        if data.strip(): self.text.append(data.strip())
def observe(row):
    url = row['url']; result = {**row, 'observedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'WRN metadata review/1.0'})
        with urllib.request.urlopen(req, timeout=25, context=ssl.create_default_context()) as response:
            body = response.read(3*1024*1024+1)
            if len(body) > 3*1024*1024: raise ValueError('bounded input exceeded')
            result.update(status=response.status, finalUrl=response.url, inputSha256=hashlib.sha256(body).hexdigest())
            page = Page(); page.feed(body.decode('utf-8', 'replace'))
            result.update(title=' '.join(page.title), metadata=page.meta)
            # Only short publisher metadata labels; no article paragraphs/body stored.
            labels = [t for t in page.text if re.match(r'^(Titel|AutorIn|Datum|Quelle|Bemerkungen):', t)]
            result['metadataLabels'] = labels[:8]
    except Exception as error: result['error'] = str(error)[:200]
    return result
if __name__ == '__main__':
    obs = json.loads((WEBSITE/'docs/evidence/WRN-WEBSITE-LIBRARY-ADAPTERS-2026-10-03/observations.json').read_text(encoding='utf-8'))
    books = [{ 'kind':'book', 'id':r['id'], 'url':r['upstreamId'], 'candidateTitle':r['title'], 'candidateAuthors':r['authors']} for r in obs['germanCandidates']]
    refs = re.findall(r"\['(knowledge-[^']+)', '([^']+)', '(https://[^']+)'\]", (ROOT/'lexicon-tab.js').read_text(encoding='utf-8'))
    wanted = set(json.loads((ROOT/'docs/LEXICON-GAP-MATRIX-2026-10-03.json').read_text(encoding='utf-8'))['rows'][i]['references'][0] for i in range(10))
    jobs = books + [{'kind':'lexicon-reference','id':i,'url':u,'name':n} for i,n,u in refs if i in wanted]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: results = list(pool.map(observe, jobs))
    target = ROOT/'docs/evidence/WRN-CONTENT-EDITORIAL-2026-10-03'; target.mkdir(parents=True,exist_ok=True)
    (target/'primary-observations.json').write_text(json.dumps({'scope':'primary metadata only; no retained bodies/media/downloads; reachability is not admission','results':results},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for r in results: print(json.dumps(r,ensure_ascii=False))
