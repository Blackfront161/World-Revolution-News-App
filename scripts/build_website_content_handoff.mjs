// Offline handoff from an immutable App commit; never writes into the Website repository.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [freeze,website,output,dataRepo,dataCommit]=process.argv.slice(2);
if(!freeze||!website||!output) throw Error('Usage: appCommit websiteReadOnlyDirectory outputDirectory');
const out=path.resolve(output); fs.mkdirSync(out,{recursive:true});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const inputs={},outputs={};
function frozen(name){
  const bytes=execFileSync('git',['show',`${freeze}:${name}`],{cwd:root,maxBuffer:32*1024*1024});
  inputs[name]={commit:freeze,sha256:hash(bytes),bytes:bytes.length};
  return bytes.toString('utf8');
}
function json(name){return JSON.parse(frozen(name));}
function write(name,value){
  const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');
  fs.writeFileSync(path.join(out,name),bytes); outputs[name]={sha256:hash(bytes),bytes:bytes.length};
}
function api(name){const context={module:{exports:{}},URL,Intl,Date};vm.runInNewContext(frozen(name),context);return context.module.exports;}
function rows(value){return Array.isArray(value)?value:(value?.items||value?.sources||value?.stations||value?.entries||[]);}
function pick(item,keys){return Object.fromEntries(keys.filter(k=>item[k]!==undefined).map(k=>[k,item[k]]));}
function canonical(value){const u=new URL(value);u.hash='';for(const k of [...u.searchParams.keys()])if(k.toLowerCase().startsWith('utm_'))u.searchParams.delete(k);return u.href;}
const core=api('news-app-2-core.js'),cardCopy=api('news-card-copy.js');
const offlineFeed=json('news-feed.json');
let raw=offlineFeed;
if(dataRepo&&dataCommit){
  const bytes=execFileSync('git',['show',`${dataCommit}:news-feed.json`],{cwd:path.resolve(dataRepo),maxBuffer:32*1024*1024});
  inputs['published-data:news-feed.json']={commit:dataCommit,sha256:hash(bytes),bytes:bytes.length};
  raw=JSON.parse(bytes.toString('utf8'));
}
const articles=core.applyEditorialDecisions(core.normalizeArticles(raw).filter(core.hasVisibleArticle),json('editorial-decisions.json'));
const shell=frozen('news-app-2.js');
function functionSource(name){
  const start=shell.indexOf(`  function ${name}(`);
  if(start<0)throw Error(`Missing ${name}`);
  const end=shell.indexOf('\n  function ',start+3);
  if(end<0)throw Error(`Missing boundary for ${name}`);
  return shell.slice(start,end).trim();
}
const start=shell.indexOf('  function renderHome() {');
const stop=shell.indexOf('    const homeServices = homeServiceData();',start);
if(start<0||stop<0)throw Error('Home selection boundary changed; review exporter');
const selectionSource=shell.slice(start,stop).replace('function renderHome()', 'function selectHome()')
  + '\n return {lead:[hero],top:topStories,sport:sportStories,more:moreStories,briefing:briefingItems};\n}';
const context={core,cardCopy,HOME_COUNT:10,viewRoot:{dataset:{}},state:{articles,quickArticleIds:new Set(articles.map(a=>a.id)),cardArticles:[],language:'de'},
  personalizedHomeGroups:()=>[],renderError:()=>{throw Error('No lead');}};
vm.runInNewContext([functionSource('newsCardTeaser'),functionSource('isSportArticle'),functionSource('homeSportArticles'),selectionSource,'selection=selectHome();'].join('\n'),context);
const websiteRoot=path.resolve(website);
function websiteJson(relative){const b=fs.readFileSync(path.join(websiteRoot,relative));inputs[`website:${relative}`]={sha256:hash(b),bytes:b.length};return JSON.parse(b);}
const directory=websiteJson('apps/website/src/features/projection/data/content-directory-v1.json');
const accepted=websiteJson('apps/website/src/features/home/app-home-editorial-v1.json');
const previousLayout=websiteJson('apps/website/src/features/home/app-home-layout-v1.json');
const byUrl=new Map(directory.articles.map(a=>[canonical(a.url),a]));
const notes=new Map(accepted.entries.map(n=>[canonical(n.originalUrl),n]));
const roles=new Map();
for(const [role,items] of Object.entries(context.selection))items.forEach((a,i)=>roles.set(a.id,{role,order:i}));
const metadata=articles.map(a=>{
  const originalUrl=canonical(a.link), admitted=byUrl.get(originalUrl), note=notes.get(originalUrl);
  const articleId=admitted?.id||`news-${hash(originalUrl)}`;
  return {articleId,appArticleId:a.id,originalUrl,originalTitle:a.title,sourceName:a.source,sourceLanguage:a.language||'und',
    topicIds:admitted?.topics||[],appTopics:[a.primaryTopic,...(a.secondaryTopics||[])].filter(Boolean),
    publishedAt:a.published,AppHomeRole:roles.get(a.id)?.role||null,order:roles.get(a.id)?.order??null,
    wrnHeadlineDe:note?.headlineDe||'',wrnSummaryDe:note?.summaryDe||'',wrnSummaryEn:note?.summaryEn||'',
    editorialNoteRights:note?.rights||null,contentPolicy:'metadata-and-original-link',
    websiteAdmission:admitted?'present-in-frozen-directory':'requires-website-admission',
    publisherImagesNotAdmitted:true};
});
write('articles-metadata.json',metadata);
write('app-home-selection.json',{schema:'wrn.app-home-selection-handoff.v1',appCommit:freeze,dataCommit:dataCommit||null,mode:dataCommit?'anonymous-published-data-snapshot-DE':'anonymous-local-snapshot-DE',
  feedSha256:(inputs['published-data:news-feed.json']||inputs['news-feed.json']).sha256,selectionSourceSha256:hash(selectionSource),
  roles:Object.fromEntries(Object.entries(context.selection).map(([role,items])=>[role,items.map(a=>metadata.find(m=>m.appArticleId===a.id).articleId)])),
  limits:'Actual frozen App selection code and exact frozen feed revision; not user-personalized groups or a promise of continuing live identity. New directory entries still require Website admission.'});
write('website-accepted-selection.json',previousLayout);
write('wrn-editorial-notes.json',accepted);
write('library-metadata.json',rows(json('library-feed.json')).map(x=>pick(x,['id','sourceId','sourceName','title','authors','languages','topics','formats','readUrl','updatedAt','rightsReview'])));
write('podcast-metadata.json',rows(json('podcasts.json')).map(x=>pick(x,['id','sourceId','sourceName','sourceKind','title','published','duration','language','languageVerified','declaredLanguage','country','region','topics','episodeUrl','link','website','contentPolicy','rightsReview'])));
write('radios.json',json('radio-stations.json'));write('radio-health.json',json('radio-health.json'));
const lexiconContext={window:{}};vm.runInNewContext(frozen('lexicon-tab.js'),lexiconContext);
write('lexicon.json',lexiconContext.window.WRNLexicon184.snapshot());
write('lexicon-locales.json',json('lexicon-locales.json'));write('learning-paths.json',json('learning-paths.json'));
const sourceFiles=['source-catalog.json','sources-registry.json','multilingual-source-registry.json','library-sources.json','podcast-sources.json'];
write('source-metadata.json',Object.fromEntries(sourceFiles.map(name=>[name,rows(json(name)).map(x=>({
  appMetadataKey:`app-source-${hash(x.canonicalUrl||x.url||x.website||x.domain||x.name)}`,
  ...pick(x,['id','name','sourceName','sourceId','endpointId','publisherId','url','canonicalUrl','homepage','website','domain','feedUrl','feeds','feedUrls','languages','language','languageSource','region','country','originRegion','originCountry','originCountryCode','topics','categories','kind','mediaType','status','active','origins','contentPolicy','rightsReview'])
}))])));
write('podcast-content-policy.json',json('podcast-content-policy.json'));
const prisoners=json('prisoner-solidarity.json');
write('prisoner-review-handoff.json',{generatedAt:prisoners.generatedAt,reviewWindowDays:prisoners.reviewWindowDays,editorialPolicy:prisoners.editorialPolicy,sources:prisoners.sources,
  status:'expired-snapshot-requires-source-review',copyPrintEnabled:false,addressesExported:false});
if(fs.existsSync(path.join(out,'README.md'))){const b=fs.readFileSync(path.join(out,'README.md'));outputs['README.md']={sha256:hash(b),bytes:b.length};}
const generatorBytes=fs.readFileSync(fileURLToPath(import.meta.url));
write('manifest.json',{schema:'wrn.website-content-handoff.v1',createdAt:new Date().toISOString(),appCommit:freeze,
  generator:{path:'scripts/build_website_content_handoff.mjs',sha256:hash(generatorBytes)},
  source:'Frozen App assets plus exact published data-feed revision when supplied',publishedDataCommit:dataCommit||null,websiteDirectoryCommit:directory.sourceCommit,
  rights:'Article/book/podcast metadata and original links; WRN editorial notes/lexicon/learning paths. No publisher bodies, transcripts, artwork, audio downloads or unreviewed addresses.',
  imageHandoffCommit:'b777198',imageManifest:'docs/handoffs/website-media-2026-10-02/image-handoff-v1.json',
  counts:{rawFeedRows:rows(raw).length,offlineAppFeedRows:rows(offlineFeed).length,appVisibleRows:articles.length,libraryItems:rows(json('library-feed.json')).length,podcastRows:rows(json('podcasts.json')).length,lexiconTerms:lexiconContext.window.WRNLexicon184.snapshot().terms.length,radios:rows(json('radio-stations.json')).length,wrnAcceptedNotes:accepted.entries.length},
  inputs,outputs});
console.log(JSON.stringify({appCommit:freeze,output:out,files:Object.keys(outputs).length,articles:metadata.length,lexiconTerms:lexiconContext.window.WRNLexicon184.snapshot().terms.length}));
