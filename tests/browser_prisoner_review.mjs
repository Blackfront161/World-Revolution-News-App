// Real module/data, isolated HTTP shell. No external pages, clipboard writes or letter uploads.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.WRN_PLAYWRIGHT_MODULE).href);
const root=path.resolve('.');
const files={'/prisoner-solidarity.js':'application/javascript','/prisoner-solidarity.css':'text/css','/prisoner-solidarity.json':'application/json'};
const server=createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/'){
  res.setHeader('Content-Type','text/html');
  res.end('<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/prisoner-solidarity.css"></head><body><main></main><script src="/prisoner-solidarity.js"></script></body></html>');return;
 }
 if(!files[pathname]){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',files[pathname]);res.end(fs.readFileSync(path.join(root,pathname.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const out=path.join(root,'docs/evidence/prisoner-roadmap-2026-10-03');
const result={status:'running',scope:'Actual module and committed data in isolated HTTP shell; no native-device or custody-status claim',checks:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',timezoneId:'Asia/Singapore'});
 await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 const page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-03T12:00:00Z')});
 await page.goto(origin);
 await page.evaluate(()=>window.WRNPrisonerSolidarity190.show('people'));
 assert.equal(await page.locator('.wrn-solidarity-profile-190').count(),30);
 assert.equal(await page.locator('.wrn-solidarity-profile-190.stale').count(),17);
 assert.equal(await page.locator('.wrn-solidarity-profile-190.stale button').count(),34);
 assert.equal(await page.locator('.wrn-solidarity-profile-190.stale button:disabled').count(),34);
 const blocked=await page.evaluate(()=>window.WRNPrisonerSolidarity190.openWorkshop('nele-aschoff'));
 assert.equal(blocked,false);
 assert.equal(await page.locator('.wrn-solidarity-workshop-190').count(),0);
 result.checks.push('30 profiles rendered; 17 undated profiles have 34 disabled actions; direct workshop entry denied');
 await page.evaluate(()=>window.WRNPrisonerSolidarity190.show('current'));
 assert.equal(await page.locator('.wrn-solidarity-profile-190').count(),13);
 await page.evaluate(()=>window.WRNPrisonerSolidarity190.show('sources'));
 assert.equal(await page.locator('.wrn-solidarity-sources-190 article').count(),18);
 for(const name of ['NYC Books Through Bars','Water Protector Legal Collective','Jericho Movement','Prison Radio','Prisoner Solidarity (Philadelphia ABC)']){
  assert.equal(await page.getByRole('heading',{name,exact:true}).count(),1);
 }
 result.checks.push('13 dated profiles in current list; 18 sources including five new original-link support resources');
 const opened=await page.evaluate(()=>window.WRNPrisonerSolidarity190.openWorkshop('bill-dunne'));
 assert.equal(opened,true);
 await page.evaluate(()=>window.WRNPrisonerSolidarity190.closeWorkshop());
 await page.clock.setFixedTime(new Date('2026-11-09T12:00:00Z'));
 await page.evaluate(()=>window.WRNPrisonerSolidarity190.show('people'));
 assert.equal(await page.locator('.wrn-solidarity-profile-190.stale').count(),30);
 assert.equal(await page.locator('.wrn-solidarity-profile-190 button:disabled').count(),60);
 assert.equal(await page.evaluate(()=>window.WRNPrisonerSolidarity190.openWorkshop('bill-dunne')),false);
 result.checks.push('Dated profile workshop opens before deadline; all 30 profiles lock after November8 review deadline');
 for (const [timezoneId,before,after] of [
  ['Asia/Singapore','2026-11-08T15:59:00Z','2026-11-08T16:01:00Z'],
  ['Pacific/Kiritimati','2026-11-08T09:59:00Z','2026-11-08T10:01:00Z'],
  ['America/Los_Angeles','2026-11-09T07:59:00Z','2026-11-09T08:01:00Z'],
 ]) {
  const zoneContext=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',timezoneId});
  await zoneContext.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  const zonePage=await zoneContext.newPage();
  zonePage.on('pageerror',e=>result.errors.push(e.message));
  await zonePage.clock.install({time:new Date(before)});
  await zonePage.goto(origin);
  await zonePage.evaluate(()=>window.WRNPrisonerSolidarity190.show('current'));
  assert.equal(await zonePage.locator('.wrn-solidarity-profile-190').count(),13,timezoneId+' before local midnight');
  const labels=await zonePage.locator('.wrn-solidarity-review-190').allTextContents();
  assert(labels.every(label=>label.includes('8. Nov. 2026')),timezoneId+' correct date-only label');
  await zonePage.clock.setFixedTime(new Date(after));
  await zonePage.evaluate(()=>window.WRNPrisonerSolidarity190.show('people'));
  assert.equal(await zonePage.locator('.wrn-solidarity-profile-190 button:disabled').count(),60,timezoneId+' after local midnight');
  assert.equal(await zonePage.evaluate(()=>window.WRNPrisonerSolidarity190.openWorkshop('bill-dunne')),false);
  await zoneContext.close();
  result.checks.push(timezoneId+': expiry and date label correct across local23:59/00:01 boundary');
 }
 assert.deepEqual(result.errors,[]);
 result.status='PASS';
}catch(e){result.status='FAIL';result.errors.push(e.stack||String(e));process.exitCode=1;}
finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}
