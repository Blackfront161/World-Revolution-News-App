'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require('node:path').join(__dirname,'../news-app-2.js'),'utf8');
const section=app.slice(app.indexOf('function scheduleHomeTranslationWake('),app.indexOf('function hasPreferences()'));
let now=1000000,calls=[],timers=[],renders=0;
const translated=new Set();
const ctx={state:{view:'home',language:'de'},dataRefreshInFlight:true,
 homeTranslationWindowStartedAt:0,homeTranslationRequests:0,homeTranslationPausedUntil:0,homeTranslationWakeTimer:null,
 homeTranslationRun:null,homeTranslationLanguage:'',homeTranslationQueue:[],
 Date:{now:()=>now},Map,Set,Promise,
 window:{WRNSharedTranslations:{request(){}},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;}},
 articleNeedsTeaserTranslation:a=>!translated.has(a.id),
 requestBriefingTranslation:async a=>{calls.push(a.id);translated.add(a.id);return {title:'Translated'};},
 renderHome(){renders++;}};
vm.createContext(ctx);vm.runInContext(`${section};this.run=ensureHomeTranslations`,ctx);
(async()=>{
 const articles=Array.from({length:25},(_,i)=>({id:`item-${i}`}));
 await ctx.run(articles);assert.equal(calls.length,0,'startup snapshot must not spend quota while live loading');
 ctx.dataRefreshInFlight=false;await ctx.run(articles);
 assert.equal(calls.length,12);assert.equal(calls[0],'item-0','lead retains priority');
 await ctx.run(articles);assert.equal(calls.length,12,'rerender cannot restart the minute budget');
 assert.equal(timers.length,1,'only one automatic wake is scheduled');assert(timers[0].delay>=60000);
 now+=61000;timers.shift().fn();await ctx.run(articles);assert.equal(calls.length,24);
 ctx.homeTranslationPausedUntil=now+65000;
 await ctx.run(articles);assert.equal(calls.length,24,'server429 pause cannot be bypassed by rerender');
 now+=66000;timers.shift().fn();await ctx.run(articles);assert.equal(calls.length,25);
 assert.equal(new Set(calls).size,25);assert(renders>0);
 const needs=app.slice(app.indexOf('function articleNeedsTeaserTranslation('),app.indexOf('async function requestBriefingTranslation('));
 const check=vm.runInNewContext(`(${needs.trim()})`,{translationForLanguage:()=>null,newsCardTeaser:()=>'',briefingTranslationsAttempted:new Set(),core:require('../news-app-2-core.js')});
 assert.equal(check({id:'empty',language:'en'},'de'),false,'empty teasers must not make invalid API calls');
 assert.equal(check({id:'link',title:'Community report',language:'es',importMode:'metadata-only',rightsReview:'metadata only',sourceHomepage:'https://source.example/',link:'https://source.example/report'},'de'),true,'reviewed original-link headlines remain eligible for automatic translation');
 console.log('Home translation: no startup snapshot requests,12/min across rerenders,lead priority,minute pause/resume,no empty requests PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
