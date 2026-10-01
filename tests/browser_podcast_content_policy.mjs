// Isolated regression harness: serves local files, stubs catalog responses and never plays media.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root = path.resolve('.');
const output = path.join(root, '.tmp/podcast-policy-browser');
fs.mkdirSync(output, { recursive:true });
const rules = JSON.parse(fs.readFileSync(path.join(root,'podcast-content-policy.json'),'utf8'));
const episode = {
  id:rules.restrictedEpisodeIds[0], title:'Solidarische Politik gegen Faschismus', sourceName:'Radio Dreyeckland',
  sourceId:'', sourceKind:'free-radio', language:'de', region:'Europe', published:new Date().toISOString(),
  feedUrl:rules.feedUrls[0], episodeUrl:'https://rdl.de/beitrag/solidaritaet',
  audioUrl:'https://rdl.de/recording.mp3', artwork:'https://rdl.de/photo.jpg',
  description:'FOREIGN DESCRIPTION', summary:'FOREIGN SUMMARY', candidates:['https://rdl.de/recording.mp3']
};
const ordinary = { ...episode, id:'ordinary', title:'Antifaschistische Politik und Solidarität',
  sourceName:'Radio CORAX', sourceId:'radio-corax', feedUrl:'https://example.org/rss',
  audioUrl:'https://example.org/audio.mp3', artwork:'', description:'Eine normale Folge.' };
const server = createServer((req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = path.resolve(root, '.'+(pathname==='/'?'/index.html':pathname));
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  const type = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, {'Content-Type':type}); res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const result = {status:'running',checks:[],remoteMediaRequests:[],pageErrors:[]};
try {
  browser = await chromium.launch({channel:'chrome',headless:true});
  const context = await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
  await context.addInitScript(({id,audio}) => {
    localStorage.setItem('wrn_next_language','de'); localStorage.setItem('wrn_lang','de');
    localStorage.setItem('wrn_next_ui_settings_v1',JSON.stringify({theme:'autonom'}));
    localStorage.setItem('wrn_audio_queue_v1',JSON.stringify([{id:`original:${id}`,candidates:[audio]}]));
    localStorage.setItem('wrn_audio_favorites_v1',JSON.stringify({[id]:true}));
    window.__shares=[];
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>window.__shares.push(data)});
  }, {id:episode.id,audio:episode.audioUrl});
  await context.route('**/*', async route => {
    const url=new URL(route.request().url());
    const json=data=>route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
    if (url.hostname==='rdl.de' && /\.(mp3|jpg)(\?|$)/.test(url.href)) result.remoteMediaRequests.push(url.href);
    if (url.pathname.endsWith('/podcast-sources.json')) return json([
      {id:rules.canonicalSourceId,name:'Radio Dreyeckland',language:'de'},
      {id:rules.endpointId,canonicalSourceId:rules.canonicalSourceId,name:'RDL podcast endpoint',feedUrl:rules.feedUrls[0],contentPolicy:'metadata_and_links_only'}]);
    if (url.pathname.endsWith('/podcasts.json')) return json([episode,ordinary]);
    if (url.pathname.endsWith('/news.json') || url.pathname.endsWith('/events.json') || url.pathname.endsWith('/radio-stations.json') || url.pathname.endsWith('/generated-podcasts.json')) return json([]);
    if (url.origin!==origin) return json({});
    return route.continue();
  });
  const page=await context.newPage();
  page.on('pageerror',error=>result.pageErrors.push(error.message));
  await page.goto(`${origin}/index.html?preview=8&data=snapshot`);
  await page.locator('#next-language').selectOption('de');
  await page.locator('[data-view-target="media"]').click();
  await page.locator('[data-action="media-section"][data-value="radio-podcasts"]').click();
  const card=page.locator('.podcast-card').filter({hasText:episode.title});
  await card.waitFor({state:'visible'});
  assert.equal(await card.locator('img,[data-audio-control]').count(),0);
  assert.equal(await card.locator('a').getAttribute('href'),episode.episodeUrl);
  assert((await card.innerText()).includes('Diese Folge auf der Originalseite anhören.'));
  assert(!(await card.innerText()).includes('FOREIGN'));
  await card.getByRole('button',{name:`Teilen: ${episode.title}`,exact:true}).click();
  await page.waitForFunction(()=>window.__shares.length===1);
  assert.equal(await page.evaluate(()=>window.__shares[0].url),episode.episodeUrl);
  assert.equal(await page.evaluate(id=>window.WRNAudioTools.isFavorite(id),episode.id),true);
  assert.equal(await page.evaluate(()=>window.WRNAudioTools.getQueue().length),0);
  assert.equal(await page.evaluate(item=>window.WRNMediaPlayer.play({id:item.id,candidates:[item.audioUrl]}),episode),false);
  assert.equal(await page.locator('.podcast-card').filter({hasText:ordinary.title}).locator('[data-audio-control]').count(),1);
  await page.screenshot({path:path.join(output,'current-autonom.png'),fullPage:true});
  result.checks.push('Current Autonom view: original-link notice, share destination, no copied text/image/playback; unrelated playable card and favorites preserved.');
  await page.goto(`${origin}/classic.html`);
  await page.evaluate(async()=>{
    window.currentLang='de';
    window.showPodcastModal('podcast-library-modal');
    await window.loadOriginalPodcasts(true);
  });
  const legacy=page.locator('.original-podcast-card').filter({hasText:episode.title});
  await legacy.waitFor({state:'visible'});
  assert.equal(await legacy.locator('img,.btn-media-play').count(),0);
  assert(!(await legacy.innerText()).includes('FOREIGN'));
  assert((await legacy.innerText()).includes('Diese Folge auf der Originalseite anhören.'));
  assert.equal(await legacy.locator('a').first().getAttribute('href'),episode.episodeUrl);
  const sharesBefore=await page.evaluate(()=>window.__shares.length);
  await legacy.getByRole('button',{name:`Teilen: ${episode.title}`,exact:true}).click();
  await page.waitForFunction(count=>window.__shares.length>count,sharesBefore);
  assert.equal(await page.evaluate(()=>window.__shares.at(-1).url),episode.episodeUrl);
  await page.screenshot({path:path.join(output,'classic-legacy.png'),fullPage:true});
  result.checks.push('Legacy Classic renderer: original-link episode retained, no foreign description/play controls, sharing uses original page.');
  await page.evaluate(async()=>{
    delete window.WRNPodcastContentPolicy;
    await window.loadOriginalPodcasts(true);
  });
  assert.equal(await page.locator('.original-podcast-card').count(),0);
  result.checks.push('Legacy renderer without policy module exposes no podcast media or copied description.');
  await page.goto(`${origin}/classic.html`);
  await page.waitForFunction(()=>Boolean(window.WRNAudioTab183?.open));
  await page.evaluate(()=>window.WRNAudioTab183.open('original'));
  const classic=page.locator('.wrn-audio-card-183').filter({hasText:episode.title});
  await classic.waitFor({state:'visible'});
  assert.equal(await classic.locator('img,.btn-media-play').count(),0);
  assert.equal(await classic.locator('a').first().getAttribute('href'),episode.episodeUrl);
  assert((await classic.innerText()).includes('Diese Folge auf der Originalseite anhören.'));
  assert(!(await classic.innerText()).includes('FOREIGN'));
  await page.screenshot({path:path.join(output,'classic.png'),fullPage:true});
  result.checks.push('Classic view retains the metadata-only episode with its stable raw ID and original link.');
  assert.equal(result.remoteMediaRequests.length,0);
  assert.equal(result.pageErrors.length,0,JSON.stringify(result.pageErrors));
  result.status='passed';
} catch(error) {
  result.status='failed'; result.error=String(error.stack||error); process.exitCode=1;
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
