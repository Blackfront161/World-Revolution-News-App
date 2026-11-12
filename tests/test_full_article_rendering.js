'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const readerName=fs.existsSync(path.join(root,'news-app-2.js'))?'news-app-2.js':fs.readdirSync(root).find(n=>/^news-app-2-[a-f0-9]{64}\.js$/.test(n));
const coreName=fs.existsSync(path.join(root,'news-app-2-core.js'))?'news-app-2-core.js':fs.readdirSync(root).find(n=>/^news-app-2-core-[a-f0-9]{64}\.js$/.test(n));
const core=require(path.join(root,coreName)),code=fs.readFileSync(path.join(root,readerName),'utf8').replace(/\r\n/g,'\n');
function fn(name){const re=new RegExp('  (?:async )?function '+name+'\\('),start=code.search(re);assert(start>=0,name);const tail=code.slice(start+3),next=tail.search(/\n  (?:async )?function /);return next<0?code.slice(start):code.slice(start,start+3+next);}
const nodes=new Map(),getNode=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',scrollTop:0,removeAttribute(){},querySelector(){return {textContent:''};}});return nodes.get(id);};
const ctx=vm.createContext({core,console:{warn(){}},state:{dataStatus:{revision:'r1'},articles:[],cardArticles:[]},articleDetailChunkCache:new Map(),articleArchivePromise:null,articleTranslationGeneration:0,
 articleLexiconMarkup:v=>({html:v,count:0}),escapeHtml:v=>String(v),t:v=>v,translationFor:()=>null,
 document:{getElementById:getNode},articleDialog:{dataset:{},open:true},window:{requestAnimationFrame(){}},
 websiteArticleId:a=>a.id||a.link,dateLabel:()=>'',updateDialogSave(){},updateDialogZine(){},updateDialogRead(){},stopArticlePodcast(){},openArticleDialogWithHistory(){},readingPosition:()=>null,
 classificationLabel:v=>v||'',articleHistoryMarkup:()=>'',contextualHelpMarkup:()=>'',hydrateArticleFromArchive:async()=>{throw Error('archive unavailable');},
 hydrateRevisionDetail:async()=>{throw Error('not part of legacy test');}
});
for(const name of ['detailPolicyName','detailPolicyAllows','articleHasExplicitDetailRestriction','markArticleDetailRestricted','structuredArticleMarkup','mergeHydratedArticle','hydrateArticleDetail','resetArticleDetailForRetry','renderArticleLoadState','openArticle'])vm.runInContext(fn(name),ctx);
const call=(name,...args)=>{ctx.args=args;return vm.runInContext(`${name}(...args)`,ctx);};
const base={title:'Full article',link:'https://example.org/a',quelleName:'Source',contentComplete:true,pubDate:'2026-11-11T12:00:00Z'};
const blocks=Array.from({length:405},(_,i)=>({type:'paragraph',text:`PARAGRAPH_${i}`}));
assert.equal(core.normalizeContentBlocks(blocks).length,405);
let article=core.normalizeArticle({...base,content:blocks.map(b=>b.text).join('\n\n'),contentBlocks:blocks});
assert(call('structuredArticleMarkup',article,false,article.content).html.includes('PARAGRAPH_404'));
for(const b of [[{type:'paragraph',text:'START'}],[{type:'paragraph',text:'OLD BODY'}]]){
 article=core.normalizeArticle({...base,content:'START FULLTEXT_END',contentBlocks:b});
 assert(call('structuredArticleMarkup',article,false,article.content).html.includes('FULLTEXT_END'));
}
assert(call('structuredArticleMarkup',{...base,content:'',intro:'Only a teaser',contentBlocks:blocks},false,'').html.includes('PARAGRAPH_404'));
call('openArticle',{...base,content:'',intro:'Only a teaser',contentBlocks:blocks},{allowPartial:true});
assert(getNode('next-article-content').innerHTML.includes('PARAGRAPH_404'));
const long=('Long paragraph. '.repeat(30000))+'VERY_LAST_CHARACTER';
article=core.normalizeArticle({...base,content:long});assert(call('structuredArticleMarkup',article,false,article.content).html.includes('VERY_LAST_CHARACTER'));
assert(call('structuredArticleMarkup',{...article,contentBlocks:blocks},true,long+' TRANSLATED_END').html.includes('TRANSLATED_END'));
for(const flags of [{contentComplete:false},{contentComplete:true,webFeedTruncated:true}]){
 const old=core.normalizeArticle({...base,content:'x'.repeat(1000),contentComplete:false,webFeedTruncated:true,webFeedOriginalLength:1000});
 const detail=core.normalizeArticle({...base,content:'x'.repeat(980),...flags});
 assert.equal(call('mergeHydratedArticle',old,detail),false);assert.equal(old.contentComplete,false);assert.equal(old.detailHydrated,false);assert.equal(old.contentMode,'excerpt');
 call('openArticle',old,{allowPartial:true});const html=getNode('next-article-content').innerHTML;
 assert(html.includes('partialArticleLabel')&&html.includes('partialArticleText')&&html.includes('https://example.org/a')&&html.includes('article-detail-retry'));
}
const shorterOld=core.normalizeArticle({...base,content:'OLD PARTIAL '.repeat(200),contentComplete:false,webFeedTruncated:true});
assert.equal(call('mergeHydratedArticle',shorterOld,core.normalizeArticle({...base,content:'COMPLETE CORRECTED SHORT BODY'})),true);
assert.equal(shorterOld.content,'COMPLETE CORRECTED SHORT BODY');assert.equal(shorterOld.contentComplete,true);
for(const restriction of [{importMode:'metadata-only'},{status:'withdrawn'},{status:'revoked'},{deleted:true}]){
 const prior=core.normalizeArticle({...base,content:'PROTECTED_OLD_BODY',description:'PROTECTED_DESCRIPTION',summary:'PROTECTED_SUMMARY',imageUrl:'https://example.org/other-photo.jpg',image:'https://example.org/photo.jpg',contentBlocks:[{type:'paragraph',text:'PROTECTED_BLOCK'}]});
 assert.equal(call('mergeHydratedArticle',prior,core.normalizeArticle({...base,content:'Short restricted metadata',...restriction})),false);
 call('openArticle',prior,{allowPartial:true});const html=getNode('next-article-content').innerHTML;
 assert(!html.includes('PROTECTED')&&!html.includes('photo.jpg'));
 assert.equal(core.normalizeArticle(prior).content,'');assert.equal(core.normalizeArticle(prior).image,'');
 assert(html.includes('fullArticleUnavailable')&&html.includes('https://example.org/a'));
}
// Summary/audio retain their original independent intro fallback.
for(const name of ['renderArticleSummary','renderArticlePodcast']) assert(fn(name).includes('translation?.fullContent ? translation.content : (article.content || article.intro)'));
async function main(){
 for(const restriction of [{status:'withdrawn'},{status:'revoked'},{deleted:true},{importMode:'metadata-only'}]){
  for(const sourcePolicy of [false,true]) for(const options of [{},{allowPartial:true}]) {
   ctx.state.sourceCatalog=sourcePolicy?{sources:[{name:'Source',...restriction}]}:null;
   ctx.translationFor=()=>({title:'Protected translated title',intro:'PROTECTED_TRANSLATED_INTRO',content:'PROTECTED_TRANSLATED_BODY',fullContent:true});
   const protectedArticle=core.normalizeArticle({...base,content:'PROTECTED_COMPLETE_BODY',intro:'PROTECTED_INTRO',contentBlocks:[{type:'paragraph',text:'PROTECTED_BLOCK'}],...(sourcePolicy?{}:restriction)});
   call('openArticle',protectedArticle,options);
   await new Promise(resolve=>setImmediate(resolve));
   const html=getNode('next-article-content').innerHTML;
   assert(!html.includes('PROTECTED'),JSON.stringify({restriction,sourcePolicy,options}));
   assert(html.includes('fullArticleUnavailable')&&html.includes('https://example.org/a'));
  }
 }
 ctx.translationFor=()=>null;ctx.state.sourceCatalog=null;
 for(const flags of [{detailHydrated:true},{detailFailed:true}]){
  const restricted=core.normalizeArticle({...base,content:'PROTECTED_PREHYDRATED',status:'withdrawn',...flags});
  assert.equal(await call('hydrateArticleDetail',restricted),false);assert.equal(restricted.content,'');
 }

 for(const catalog of [null,{malformed:true},{sources:[{missingName:true}]}]){
  ctx.state.sourceCatalog=catalog;
  const blockOnly={...base,content:'',intro:'Only a teaser',contentBlocks:blocks};
  call('openArticle',blockOnly);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(blockOnly.contentBlocks.length,405);
  assert(getNode('next-article-content').innerHTML.includes('PARAGRAPH_404'));
 }
 ctx.state.sourceCatalog=null;

 let requests=0;ctx.fetchJson=async()=>{requests++;return [{...base,content:requests===1?'x'.repeat(980):'COMPLETE_AFTER_RETRY',contentComplete:requests!==1}];};
 const a=core.normalizeArticle({...base,content:'x'.repeat(1000),contentComplete:false,webFeedTruncated:true,detailUrl:'https://data.example/detail.json'});
 assert.equal(await call('hydrateArticleDetail',a),false);assert.equal(requests,1);
 // A previous client may have marked an incomplete response hydrated.
 a.detailHydrated=true;ctx.articleArchivePromise=Promise.resolve([]);
 call('resetArticleDetailForRetry',a);assert.equal(a.detailHydrated,false);assert.equal(ctx.articleArchivePromise,null);
 assert.equal(await call('hydrateArticleDetail',a),true);assert.equal(requests,2);assert.equal(a.content,'COMPLETE_AFTER_RETRY');
 const blocked=core.normalizeArticle({...base,content:'PROTECTED',importMode:'metadata-only',detailUrl:'https://data.example/restricted.json'});
 call('resetArticleDetailForRetry',blocked);const before=requests;
 assert.equal(await call('hydrateArticleDetail',blocked),false);assert.equal(requests,before);assert.equal(blocked.content,'');
 let archiveCalls=0;
 ctx.hydrateArticleFromArchive=async article=>{archiveCalls++;return call('mergeHydratedArticle',article,core.normalizeArticle({...base,content:'ARCHIVE_FULL_END'}));};
 ctx.fetchJson=async()=>[{...base,content:'PARTIAL',contentComplete:false}];
 const fallback=core.normalizeArticle({...base,content:'PARTIAL',contentComplete:false,detailUrl:'https://data.example/partial.json'});
 assert.equal(await call('hydrateArticleDetail',fallback),true);assert.equal(archiveCalls,1);assert.equal(fallback.content,'ARCHIVE_FULL_END');
 ctx.fetchJson=async()=>[{...base,content:'Restricted',importMode:'metadata-only'}];
 const restricted=core.normalizeArticle({...base,content:'PROTECTED',contentComplete:false,detailUrl:'https://data.example/restricted-response.json'});
 assert.equal(await call('hydrateArticleDetail',restricted),false);assert.equal(archiveCalls,1);assert.equal(restricted.content,'');
 assert(code.includes('resetArticleDetailForRetry(state.activeArticle)'));
 console.log('Full article rendering, block coverage, honest completeness, notice/original and real retry: OK');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
