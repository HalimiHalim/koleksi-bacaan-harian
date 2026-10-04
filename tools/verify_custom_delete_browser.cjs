// Isolated synthetic browser contexts only. No persistent profile or user data.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const url=process.env.QURAN_QA_URL||'http://127.0.0.1:8826/',out=process.env.QURAN_QA_OUTPUT||'/Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.4';fs.mkdirSync(out,{recursive:true});
const prefix='uwa-navigation-renovation-trial-v1',custom='uwa-custom-readings-v1';
const item=id=>({id,name:id==='u-legacy'?'Synthetic legacy Quran excerpt':'Synthetic unrelated entry',arabic:'نص',meaning:'Synthetic test',reference:''});
function seed(assign=['morning','evening'],obsolete=true) {
 const s={[custom]:JSON.stringify([item('u-legacy'),item('u-other')]),[prefix+'-initialized']:'{"schema":1}','uwa-deleted-reading-ids-v1':'["u-old"]'};
 for(const t of ['morning','evening']) {
  const members=[1,'u-other',...(assign.includes(t)?['u-legacy']:[])];
  for(const k of [prefix+'-members-'+t,prefix+'-order-'+t,`uwa-routine-members-${t}-v1`,`uwa-routine-order-${t}-v1`])s[k]=JSON.stringify(members);
  for(const d of ['2020-01-01','2026-10-04'])for(const pre of ['uwa-daily-',prefix+'-daily-'])s[pre+d+'-'+t]=JSON.stringify(members);
 }
 Object.assign(s,{'uwa-quran-checklist-v1-members':'["112","114"]','uwa-quran-checklist-v1-order':'["114","112"]','uwa-quran-checklist-v1-daily-2026-10-04':'["112"]','uwa-quran-checklist-v1-migrated':'{"schema":1,"unmapped":["u-legacy"]}','uwa-quran-reader-v1':JSON.stringify({bookmarks:['2:20'],script:'uthmani',mode:'list',uthmaniMode:'list',last:{surah:2,ayah:20,page:4,mode:'list'}}),'uwa-quran-recent-v1':'{"schema":1,"entries":[{"surah":2,"ayah":20,"mode":"list"}]}','uwa-quran-tajweed-v1':'on','uwa-quran-checklist-v1-migration-backup':'{"legacy":["u-legacy","4"]}','uwa-quran-reader-v1-bookmarks-backup-v263':'{"schema":1,"bookmarks":["2:20"]}','uwa-quran-recent-v1-legacy-backup':'{"last":{"surah":2,"ayah":20}}','uwa-navigation-renovation-trial-v1-backup':'{"custom":["u-legacy"]}','uwa-selawat-21-stanzas-v1':'["1"]'});
 if(obsolete)Object.assign(s,{[prefix+'-members-allday']:'["u-legacy","4"]',[prefix+'-order-allday']:'broken obsolete array', [prefix+'-daily-2026-10-04-allday']:'["u-legacy"]','uwa-daily-2020-01-01-allday':'broken obsolete array'});
 return s;
}
const snapshot=p=>p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
const protectedState=s=>Object.fromEntries(Object.entries(s).filter(([k])=>k.startsWith('uwa-quran-')||k.includes('allday')||k.includes('backup')||k.includes('selawat')));
async function editor(p,id='u-legacy') {await p.locator('[data-app-view="reference"]').click();await p.locator(`tr[data-reading-id="${id}"] .toc-row-actions button`).last().click();}
async function remove(p) {await p.locator('#delete-reading').click();assert.match(await p.locator('#delete-question').textContent(),/Zikir dan Himpunan Doa/);assert.doesNotMatch((await p.locator('#delete-question').textContent()).split('Bacaan ini')[1],/Quran/);await p.locator('#delete-accept').click();}
function verify(before,after,id='u-legacy') {
 assert.deepEqual(protectedState(after),protectedState(before));assert.deepEqual(JSON.parse(after[custom]),JSON.parse(before[custom]).filter(i=>i.id!==id));
 assert(JSON.parse(after['uwa-deleted-reading-ids-v1']).includes(id));
 for(const [k,v]of Object.entries(before)) {
  if(k===custom||k==='uwa-deleted-reading-ids-v1')continue;
  if(k.endsWith('-morning')||k.endsWith('-evening')||/^uwa-routine-(members|order)-(morning|evening)-v1$/.test(k))assert.deepEqual(JSON.parse(after[k]),JSON.parse(v).filter(i=>String(i)!==id),k);
  else assert.equal(after[k],v,k);
 }
}
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}),checks=[];try{
 async function setup(width=390,state=seed()) {
  const c=await b.newContext({viewport:{width,height:844},serviceWorkers:'block',timezoneId:'Asia/Kuala_Lumpur'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.goto(url);await p.evaluate(s=>{localStorage.clear();for(const[k,v]of Object.entries(s))localStorage.setItem(k,v)},state);await p.reload();return {c,p,errors};
 }
 for(const width of [320,390,1280]) {
  const {c,p,errors}=await setup(width),before=await snapshot(p);await editor(p);assert.equal(await p.locator('#edit-number').textContent(),'Entry 22');await p.locator('#delete-reading').click();await p.evaluate(()=>document.fonts.ready);await p.locator('#delete-accept').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight/2,behavior:'instant'}));assert(await p.locator('#delete-accept').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===e}));await p.screenshot({path:path.join(out,`delete-confirm-${width}.png`)});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.locator('#delete-cancel').click();assert.equal(await p.locator('#delete-confirm').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.id),'delete-reading');await remove(p);assert.equal(await p.locator('#app-feedback').textContent(),'Bacaan dipadam.');verify(before,await snapshot(p));await p.reload();assert.equal(await p.locator('tr[data-reading-id="u-legacy"]').count(),0);assert.equal(await p.locator('#bacaan-u-legacy').count(),0);assert.equal(await p.locator('tr[data-reading-id="u-other"]').count(),1);verify(before,await snapshot(p));
  await p.locator('[data-app-view="reference"]').click();for(let id=1;id<=21;id++){const row=p.locator(`tr[data-reading-id="${id}"]`);assert.equal(await row.getAttribute('data-built-in'),'true');assert.equal(await row.locator('.toc-row-actions button').count(),1);assert.equal(await row.locator('button').textContent(),'Add to')}
  await p.locator('tr[data-reading-id="u-other"]').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`deleted-isi-${width}.png`)});await p.locator('[data-app-view="morning"]').click();assert.equal(await p.locator('#morning-checklist [data-zikir-id="u-legacy"]').count(),0);assert.equal(await p.locator('#morning-checklist [data-zikir-id="u-other"]').count(),1);await p.screenshot({path:path.join(out,`deleted-zikir-${width}.png`)});assert.deepEqual(errors,[]);checks.push({width,legacyDelete:true,confirmationCancelFocus:true,unrelatedStateAndQuranPreserved:true,reloadNoResurrection:true,builtInsUILocked:21,overflow:false,errors:0});await c.close();
 }
 for(const assign of [[],['morning'],['evening'],['morning','evening']]) {
  const {c,p,errors}=await setup(390,seed(assign,false)),before=await snapshot(p);await editor(p);await remove(p);verify(before,await snapshot(p));assert.deepEqual(errors,[]);checks.push({assign,delete:true,obsoleteQuranAbsent:true});await c.close();
 }
 // Missing collections stay missing; don't manufacture empty lists to erase read failures.
 {const s=seed([],false);for(const k of Object.keys(s))if(/morning|evening/.test(k))delete s[k];const{c,p}=await setup(390,s);await editor(p);await remove(p);assert.equal(await p.locator('#app-feedback').textContent(),'Bacaan dipadam.');for(const k of Object.keys(await snapshot(p)))assert(!/morning|evening/.test(k));checks.push({absentActiveCollectionsDelete:true});await c.close();}
 {const s=seed();delete s[prefix+'-initialized'];const{c,p,errors}=await setup(390,s),before=await snapshot(p);await editor(p);await remove(p);verify(before,await snapshot(p));assert.deepEqual(errors,[]);checks.push({absentTrialMarkerObsoleteMalformedQuranDelete:true});await c.close();}
 // Live Undo for the selected source must not reinsert it after deletion.
 {const{c,p}=await setup();await p.locator('[data-app-view="morning"]').click();await p.locator('[data-sort="morning"]').click();const handle=p.locator('#morning-checklist [data-zikir-id="u-legacy"] .drag-handle');await handle.focus();await p.keyboard.press('Space');await p.keyboard.press('Delete');assert.equal(await p.locator('[data-undo="morning"]').isVisible(),true);const before=await snapshot(p);await editor(p);await remove(p);assert.equal(await p.locator('[data-undo="morning"]').isVisible(),false);await p.locator('[data-undo="morning"]').evaluate(e=>e.click());verify(before,await snapshot(p));checks.push({pendingUndoCannotResurrect:true});await c.close();}
 // Allocation rejects a live collision and a deleted identity, then creates/edits/adds/deletes normally.
 {const{c,p,errors}=await setup();await p.evaluate(()=>{let ids=['legacy','old','fresh'];crypto.randomUUID=()=>ids.shift()||'unexpected'});await p.locator('[data-app-view="reference"]').click();await p.locator('#add-reading').click();assert.equal(await p.locator('#edit-number').textContent(),'Entry 24');await p.locator('#reading-name').fill('Synthetic fresh entry');await p.locator('#reading-arabic').fill('نص');await p.locator('#save-reading').click();assert.equal(await p.locator('tr[data-reading-id="u-fresh"]').count(),1);await editor(p,'u-fresh');await p.locator('#reading-name').fill('Synthetic edited entry');await p.locator('#save-reading').click();assert.equal(JSON.parse((await snapshot(p))[custom]).find(i=>i.id==='u-fresh').name,'Synthetic edited entry');await p.locator('tr[data-reading-id="u-fresh"] .toc-row-actions button').first().click();assert.deepEqual(await p.locator('.add-picker input').evaluateAll(es=>es.map(e=>e.value)),['morning','evening']);await p.locator('.add-picker input[value="morning"]').check();await p.locator('.add-picker input[value="evening"]').check();await p.locator('.picker-save').click();for(const t of ['morning','evening'])assert(JSON.parse((await snapshot(p))[prefix+'-members-'+t]).includes('u-fresh'));const before=await snapshot(p);await editor(p,'u-fresh');await remove(p);verify(before,await snapshot(p),'u-fresh');assert.deepEqual(errors,[]);checks.push({createEditAddBothDelete:true,liveAndDeletedIdCollisionsSkipped:true,quranAbsentFromPicker:true});await c.close();}
 // Validation / storage refusal must retain all raw values and the editor, permit retry after recovery.
 for(const failure of ['malformed-members','malformed-order','malformed-daily','active-read-denied','obsolete-read-denied','partial-throw','partial-silent','custom-malformed','tombstone-malformed']) {
  const{c,p,errors}=await setup();await editor(p);
  await p.evaluate(({failure,prefix,custom})=>{
   if(failure==='malformed-members')localStorage.setItem(prefix+'-members-morning','broken');
   if(failure==='malformed-order')localStorage.setItem(prefix+'-order-evening','["orphan"]');
   if(failure==='malformed-daily')localStorage.setItem('uwa-daily-2020-01-01-evening','{}');
   if(failure==='custom-malformed')localStorage.setItem(custom,'broken');
   if(failure==='tombstone-malformed')localStorage.setItem('uwa-deleted-reading-ids-v1','{}');
  },{failure,prefix,custom});const before=await snapshot(p);
  await p.evaluate(({failure,prefix})=>{
   window.qaGet=Storage.prototype.getItem;window.qaSet=Storage.prototype.setItem;
   if(failure.endsWith('read-denied'))Storage.prototype.getItem=function(k){if(failure==='active-read-denied'?k===prefix+'-members-evening':k.includes('allday'))throw Error('synthetic denied');return qaGet.call(this,k)};
   if(failure.startsWith('partial-')){let refused=false;Storage.prototype.setItem=function(k,v){if(!refused&&k===prefix+'-members-morning'){refused=true;if(failure==='partial-throw')throw Error('synthetic denied');return;}return qaSet.call(this,k,v)}};
  },{failure,prefix});await remove(p);await p.evaluate(()=>{Storage.prototype.getItem=qaGet;Storage.prototype.setItem=qaSet});
  if(failure==='obsolete-read-denied'){assert.equal(await p.locator('#app-feedback').textContent(),'Bacaan dipadam.');verify(before,await snapshot(p))}
  else {const message=await p.locator('#edit-error').textContent();assert(message.length>0);assert.equal(await p.locator('#edit-view').isVisible(),true);assert.notEqual(await p.locator('#app-feedback').textContent(),'Bacaan dipadam.');assert.deepEqual(await snapshot(p),before);if(failure==='active-read-denied')assert.match(message,/Storan Himpunan Doa.*diakses/);if(failure.startsWith('partial-'))assert.match(message,/Data asal dikekalkan/);if(failure.startsWith('malformed-'))assert.match(message,/Zikir|Himpunan Doa/);await p.evaluate(s=>{for(const[k,v]of Object.entries(s))localStorage.setItem(k,v)},seed());await p.locator('#delete-accept').click();assert.equal(await p.locator('#app-feedback').textContent(),'Bacaan dipadam.');}
  assert.deepEqual(errors,[]);checks.push({failure,safeResult:true,retryRecovered:failure!=='obsolete-read-denied'});await c.close();
 }
 fs.writeFileSync(path.join(out,'custom-delete-browser.json'),JSON.stringify({url,checks,isolatedSyntheticProfiles:true,physicalIPhoneSafariTested:false},null,2));console.log('PASS custom delete browser',checks.length,'scenarios');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
