const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=process.env.QURAN_QA_OUTPUT||'/Users/halimi_hanim/Projects/Islamic-App-QA-V2.6.2',chapters=JSON.parse(fs.readFileSync(root+'/quran/chapters.json'));
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}),results=[];
for(const width of [320,390,1280])for(const [mode,script,tajweed] of [['list','uthmani','off'],['list','simple','on'],['page','uthmani','off'],['page','uthmani','on'],['page','simple','on'],['classic','uthmani','off'],['classic','uthmani','on']])for(const n of (mode==='list'?[1,2,114]:[1,7,12,604])){
 const surah=mode==='list'?n:(n===604?112:n===1?1:2),captures=[];
 for(const [kind,url] of [['baseline','http://127.0.0.1:8827/'],['candidate',process.env.QURAN_QA_URL||'http://127.0.0.1:8826/']]){
  const ctx=await b.newContext({viewport:{width,height:844},serviceWorkers:'block'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);
  await p.evaluate(({mode,script,tajweed,surah,n})=>{localStorage.removeItem('uwa-quran-recent-v1');localStorage.setItem('uwa-quran-reader-v1',JSON.stringify({mode,script,uthmaniMode:mode,last:{surah,ayah:1,page:n,mode},bookmarks:['1:2']}));localStorage.setItem('uwa-quran-tajweed-v1',tajweed)},{mode,script,tajweed,surah,n});await p.reload();await p.locator('[data-app-view="allday"]').click();await p.locator('#quran-tab-library').click();await p.locator('#quran-continue, .quran-recent-item').first().click();
  if(mode==='list')await p.waitForFunction(count=>document.querySelectorAll('#quran-verse-list .quran-verse').length===count,chapters[surah-1][3]);else await p.waitForFunction(({mode,n})=>document.querySelector(`#quran-${mode==='page'?'mushaf':'classic'}-page .quran-page-folio`)?.textContent===String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[+d])&&document.querySelector('#quran-reader-status').textContent==='',{mode,n});
  await p.evaluate(()=>document.fonts.ready);await p.mouse.move(0,0);
  // Classic fitting can settle after Arabic font ready + two animation frames.
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const selector=mode==='list'?'#quran-list-panel':mode==='page'?'#quran-mushaf-page':'#quran-classic-page';const el=p.locator(selector);
  const geometry=await el.evaluate(e=>({text:e.textContent,rect:[e.offsetWidth,e.offsetHeight],font:getComputedStyle(e).fontSize,overflow:e.scrollWidth-e.clientWidth,words:[...e.querySelectorAll('.quran-page-word,.quran-verse-marker')].map(x=>({text:x.textContent,class:x.className,rect:[x.offsetWidth,x.offsetHeight],font:getComputedStyle(x).fontSize}))}));
  const pixels=await el.screenshot({animations:'disabled'});captures.push({geometry,pixels});assert.deepEqual(errors,[]);
  if(kind==='candidate'&&script==='uthmani'&&tajweed==='on'&&[7,12,604].includes(n))fs.writeFileSync(`${out}/regression-${mode}-${n}-${width}.png`,pixels);
  await ctx.close();
 }
 assert.deepEqual(captures[1].geometry,captures[0].geometry,`${width}/${mode}/${script}/${tajweed}/${n} baseline geometry/text`);
 assert(captures[0].pixels.equals(captures[1].pixels),`${width}/${mode}/${script}/${tajweed}/${n} baseline reading pixels`);
 results.push({width,mode,script,tajweed,n,exactGeometry:true,exactPixels:true});
}
fs.writeFileSync(out+'/reader-regression.json',JSON.stringify(results,null,2));console.log('PASS exact baseline reader comparisons:',results.length);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
