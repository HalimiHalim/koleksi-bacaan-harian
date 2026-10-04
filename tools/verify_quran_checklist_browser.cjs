const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const url=process.env.QURAN_QA_URL||'http://127.0.0.1:8826/',out=process.env.QURAN_QA_OUTPUT||'/Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.1';fs.mkdirSync(out,{recursive:true});
const prefix='uwa-quran-checklist-v1',old='uwa-navigation-renovation-trial-v1';
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}); const results=[];
 for(const width of [320,390,1280]){
  const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block',timezoneId:'Asia/Kuala_Lumpur'}),p=await context.newPage(),errors=[],requests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('request',r=>requests.push(r.url()));
  await p.goto(url);await p.waitForFunction(()=>document.querySelector('#allday-checklist .checklist-name')?.textContent==='Al-Ikhlas');
  assert(!requests.some(u=>/\/quran\/(?:pages|surah|scripts\/simple\/surah)\//.test(u)),'no Quran content on startup');
  await p.locator('[data-app-view="allday"]').click();
  const ids=()=>p.locator('#allday-checklist .check-row').evaluateAll(rows=>rows.map(r=>r.dataset.zikirId));
  assert.deepEqual(await ids(),['112','113','114']);
  const before=await p.evaluate(()=>localStorage.getItem('uwa-quran-reader-v1'));
  await p.locator('#quran-add').click();await p.locator('[data-surah="112"]').waitFor();assert(await p.locator('[data-surah="112"]').isDisabled());assert.match(await p.locator('[data-surah="112"]').innerText(),/Sudah ditambah/);
  await p.locator('[data-surah="2"]').click();await p.locator('#quran-search').fill('Fatihah');await p.locator('[data-surah="1"]').click();await p.locator('#quran-search').fill('2');assert.equal(await p.locator('[data-surah="2"]').getAttribute('aria-pressed'),'true');
  assert.equal(await p.evaluate(()=>localStorage.getItem('uwa-quran-reader-v1')),before,'selection does not affect reading');
  await p.screenshot({path:`${out}/selection-${width}.png`,fullPage:true});
  await p.locator('#quran-selection-done').click();assert.deepEqual(await ids(),['112','113','114','1','2']);
  await p.locator('#quran-add').click();await p.locator('[data-surah="3"]').click();await p.locator('#quran-selection-cancel').click();assert.deepEqual(await ids(),['112','113','114','1','2']);assert.equal(await p.evaluate(()=>document.activeElement.id),'quran-add');
  await p.locator('#quran-add').click();await p.locator('[data-surah="3"]').click();await p.goBack();await p.locator('#quran-routine').waitFor({state:'visible'});assert.deepEqual(await ids(),['112','113','114','1','2']);
  await p.locator('#quran-add').click();await p.locator('[data-surah="3"]').click();await p.keyboard.press('Escape');assert.deepEqual(await ids(),['112','113','114','1','2']);
  await p.locator('#allday-checklist [data-zikir-id="112"] input').check();assert(await p.locator('#quran-reader').isHidden());assert.equal(await p.locator('#allday-count-big').textContent(),'1/5');
  await p.locator('#allday-checklist [data-zikir-id="1"] .checklist-name').click();await p.waitForFunction(()=>document.querySelectorAll('#quran-verse-list .quran-verse').length===7);assert.equal(await p.locator('#quran-reader-title').textContent(),'Al-Fatihah');
  assert.equal(await p.locator('#quran-back .quran-back-label').textContent(),'Amalan Saya');await p.locator('#quran-back').click();assert.equal(await p.locator('#allday-count-big').textContent(),'1/5');
  assert.equal(await p.evaluate(()=>document.activeElement.closest('.check-row')?.dataset.zikirId),'1');
  await p.locator('[data-sort="allday"]').click();let handle=p.locator('#allday-checklist [data-zikir-id="112"] .drag-handle');await handle.focus();await p.keyboard.press('Space');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');assert.deepEqual(await ids(),['113','112','114','1','2']);
  handle=p.locator('#allday-checklist [data-zikir-id="112"] .drag-handle');await handle.focus();await p.keyboard.press('Space');await p.keyboard.press('Delete');assert.deepEqual(await ids(),['113','114','1','2']);await p.locator('[data-undo="allday"]').click();assert.deepEqual(await ids(),['113','112','114','1','2']);assert.equal(await p.locator('#allday-count-big').textContent(),'1/5');
  await p.locator('[data-sort="allday"]').click();await p.reload();await p.locator('[data-app-view="allday"]').click();assert.deepEqual(await ids(),['113','112','114','1','2']);assert(await p.locator('#allday-checklist [data-zikir-id="112"] input').isChecked());
  await p.screenshot({path:`${out}/checklist-${width}.png`,fullPage:true});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'checklist width');
  // Source assignments remain Zikir/Doa; never Quran.
  await p.locator('[data-app-view="reference"]').click();await p.locator('tr[data-reading-id="4"] .toc-actions button').click();assert.deepEqual(await p.locator('.add-picker input').evaluateAll(xs=>xs.map(x=>x.value)),['morning','evening']);await p.getByRole('button',{name:'Batal',exact:true}).click();
  // Both scripts and all modes via the same checklist reader route.
  await p.locator('[data-app-view="allday"]').click();await p.locator('#allday-checklist [data-zikir-id="1"] .checklist-name').click();await p.locator('#quran-settings-toggle').click();await p.locator('#quran-page-mode').click();await p.waitForFunction(()=>document.querySelector('#quran-mushaf-page .quran-page-folio')&&document.querySelector('#quran-reader-status').textContent==='');
  await p.locator('#quran-tajweed-on').click();await p.waitForFunction(()=>document.querySelector('#quran-mushaf-page [class^="tajweed-"]'));
  await p.locator('#quran-script-simple').click();await p.waitForFunction(()=>document.querySelector('#quran-mushaf-page .quran-page-folio')&&document.querySelector('#quran-reader-status').textContent===''&&document.querySelector('#quran-script-simple').getAttribute('aria-pressed')==='true');assert(await p.locator('#quran-tajweed-on').isDisabled());assert.equal(await p.locator('#quran-mushaf-page [class^="tajweed-"]').count(),0);
  await p.locator('#quran-script-uthmani').click();await p.waitForFunction(()=>document.querySelector('#quran-mushaf-page [class^="tajweed-"]'));await p.locator('#quran-classic-mode').click();await p.waitForFunction(()=>document.querySelector('#quran-classic-page .quran-page-folio')&&document.querySelector('#quran-reader-status').textContent==='');await p.locator('#quran-settings-close').click();await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/classic-${width}.png`,fullPage:true});
  await p.locator('#quran-back').click();await p.locator('#quran-tab-library').click();await p.locator('#quran-search').fill('Al-Falaq');await p.locator('[data-surah="113"]').click();await p.locator('#quran-back').click();assert(await p.locator('#quran-library').isVisible());assert.equal(await p.locator('#quran-back').getAttribute('aria-label'),'Kembali ke senarai surah');
  // Reset date in an active session and on reload using browser clock.
  await p.locator('#quran-tab-routine').click();const tomorrow=new Date(Date.now()+86400000);await p.clock.install({time:tomorrow});await p.evaluate(()=>window.dispatchEvent(new Event('focus')));assert.equal(await p.locator('#allday-count-big').textContent(),'0/5');
  // Add a single new surah and persist; test remaining Isi write path.
  await p.locator('#quran-add').click();await p.locator('[data-surah="3"]').click();await p.locator('#quran-selection-done').click();assert.deepEqual(await ids(),['113','112','114','1','2','3']);
  await p.evaluate(old=>{for(const suffix of ['members','order']){const key=old+'-'+suffix+'-morning';localStorage.setItem(key,JSON.stringify(JSON.parse(localStorage.getItem(key)).filter(id=>id!=='4')))}},old);await p.reload();
  await p.locator('[data-app-view="reference"]').click();await p.locator('tr[data-reading-id="4"] .toc-actions button').click();await p.locator('.add-picker input[value="morning"]').check();await p.locator('.picker-save').click();assert(await p.evaluate(old=>JSON.parse(localStorage.getItem(old+'-members-morning')).includes('4'),old));
  assert.deepEqual(await ids(),['113','112','114','1','2','3']);
  assert.deepEqual(errors,[]);results.push({width,addSearchCancelBack:true,readerCheckboxIsolation:true,reorderRemoveUndo:true,reloadProgress:true,settingsModesScripts:true,dailyRollover:true,consoleErrors:0,startupQuranContentRequests:0});await context.close();
 }
 // Test real V2.5.2 trial state migration and source independence in the app.
 const context=await browser.newContext({serviceWorkers:'block',timezoneId:'Asia/Kuala_Lumpur'}),p=await context.newPage();await p.goto(url);
 await p.evaluate(({prefix,old})=>{
  localStorage.clear();const now=new Date(),day=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  localStorage.setItem(old+'-initialized','{"schema":1}');localStorage.setItem(old+'-members-allday','["17","4","15","u-example"]');localStorage.setItem(old+'-order-allday','["15","4","17","u-example"]');localStorage.setItem(old+'-daily-'+day+'-allday','["4"]');
 },{prefix,old});await p.reload();await p.locator('[data-app-view="allday"]').click();assert.equal(await p.locator('#allday-count-big').textContent(),'3/3');assert.match(await p.locator('#quran-migration-notice').textContent(),/petikan/);
 await p.evaluate(old=>localStorage.setItem(old+'-members-allday','["15"]'),old);await p.reload();await p.locator('[data-app-view="allday"]').click();assert.equal(await p.locator('#allday-checklist .check-row').count(),3,'legacy no longer controls checklist');
 await p.evaluate(prefix=>{localStorage.setItem(prefix+'-members','[]');localStorage.setItem(prefix+'-order','[]')},prefix);await p.reload();await p.locator('[data-app-view="allday"]').click();assert(await p.locator('#quran-empty').isVisible());assert.equal(await p.locator('#allday-checklist .check-row').count(),0);await p.screenshot({path:out+'/empty.png',fullPage:true});
 const saved=await p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
 await p.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='uwa-quran-checklist-v1-order')throw Error('synthetic quota failure');return set.call(this,k,v)}});
 await p.locator('#quran-add').click();await p.locator('[data-surah="1"]').click();await p.locator('#quran-selection-done').click();assert(await p.locator('#quran-selection').isVisible());assert.match(await p.locator('#quran-library-status').textContent(),/tidak dapat disimpan/);
 assert.deepEqual(await p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))),saved,'failed add retains all source/storage');await p.locator('#quran-selection-cancel').click();await context.close();
 await browser.close();fs.writeFileSync(out+'/interactions.json',JSON.stringify(results,null,2));console.log('PASS',JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
