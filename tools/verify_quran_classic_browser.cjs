// Against a served V2.5.1 checkout. Playwright can be resolved via NODE_PATH.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),url=process.env.QURAN_QA_URL||'http://127.0.0.1:8819/',out=process.env.QURAN_QA_OUTPUT||'/Users/halimi_hanim/Projects/Islamic-App-QA-V2.5.1';fs.mkdirSync(out,{recursive:true});
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const reps=[1,2,303,420,531,534,535,537,597,604],chapters=json('quran/chapters.json');
const classes={ghunnah:'ghunnah',hamzat_wasl:'silent',lam_shamsiyyah:'silent',silent:'silent',idghaam_ghunnah:'idgham',idghaam_no_ghunnah:'idgham',idghaam_mutajanisayn:'idgham',idghaam_mutaqaribayn:'idgham',idghaam_shafawi:'idgham',ikhfa:'ikhfa',ikhfa_shafawi:'ikhfa',iqlab:'iqlab',qalqalah:'qalqalah',madd_2:'madd',madd_246:'madd',madd_6:'madd',madd_munfasil:'madd',madd_muttasil:'madd'};
(async()=>{const b=await chromium.launch({executablePath:process.env.QURAN_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}),results=[];
for(const width of [320,390,1280])for(const tajweed of ['off','on']){
 const ctx=await b.newContext({viewport:{width,height:844},serviceWorkers:'block'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.goto(url);await p.evaluate(tajweed=>{localStorage.setItem('uwa-quran-reader-v1',JSON.stringify({mode:'classic',script:'uthmani',last:{surah:1,ayah:1,page:1,mode:'classic'},bookmarks:[]}));localStorage.setItem('uwa-quran-tajweed-v1',tajweed)},tajweed);await p.reload();await p.locator('[data-app-view="allday"]').click();await p.locator('#quran-tab-library').click();await p.locator('#quran-continue').click();await p.evaluate(()=>document.fonts.ready);let minFont=28,maxFont=11,maxHeight=0;
 for(let n=1;n<=604;n++){
  await p.waitForFunction(n=>document.querySelector('#quran-classic-page .quran-page-folio')?.textContent===String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[+d])&&document.querySelector('#quran-reader-status').textContent===''&&[...document.querySelectorAll('#quran-classic-page .quran-classic-line')].every(e=>e.style.fontSize),n);
  const data=json(`quran/pages/${String(n).padStart(3,'0')}.json`),tokens=data.lines.flat(),annotation=json(`quran/tajweed/pages/${String(n).padStart(3,'0')}.json`),segments=new Map(annotation.tokens.map(([l,i,s])=>[l+':'+i,s]));
  const expectedColours=[];if(tajweed==='on')for(const [l,line] of data.lines.entries())for(const [i,token] of line.entries())for(const [start,end,rule] of segments.get(l+':'+i)||[])expectedColours.push(['tajweed-'+classes[rule],Array.from(token[1]).slice(start,end).join('')]);
  const seen=await p.evaluate(()=>{const sheet=document.querySelector('#quran-classic-page'),lines=[...sheet.querySelectorAll('.quran-classic-line')],ordinary=lines.filter(e=>!e.matches('.quran-page-heading,.quran-page-bismillah'));return{
   words:[...sheet.querySelectorAll('.quran-page-word')].map(e=>e.textContent),
   lines:lines.map(e=>[...e.children].map(x=>x.textContent)),
   markers:[...sheet.querySelectorAll('.quran-verse-marker')].map(e=>e.getAttribute('aria-label').replace('Akhir ayat ','')),
   colors:[...sheet.querySelectorAll('[class^="tajweed-"]')].map(e=>[e.className,e.textContent]),
   quarters:sheet.querySelectorAll('.quran-page-quarter').length,sajdahs:sheet.querySelectorAll('.quran-page-sajdah').length,
   sizes:ordinary.map(e=>parseFloat(getComputedStyle(e).fontSize)),
   wrap:lines.every(e=>getComputedStyle(e).flexWrap==='nowrap'&&getComputedStyle(e).display==='flex'),
   overflow:lines.filter(e=>e.scrollWidth>e.clientWidth+1).length,doc:document.documentElement.scrollWidth-innerWidth,
   sheetOverflow:sheet.scrollWidth-sheet.clientWidth, height:sheet.getBoundingClientRect().height,
   headings:[...sheet.querySelectorAll('.quran-page-heading')].map(e=>e.textContent),
   basmalahs:[...sheet.querySelectorAll('.quran-page-bismillah')].map(e=>e.textContent)
  }});
  const label=`Classic ${width}/${tajweed}/${n}`;
  assert.deepEqual(seen.words,tokens.filter(x=>['word','bismillah'].includes(x[0])).map(x=>x[1]),label+' immutable words');
  assert.deepEqual(seen.lines,data.lines.map(line=>line.map(([kind,t,key,s])=>kind==='surah_header'?'سُورَةُ '+chapters[s-1][2]:kind==='end'?String(key.split(':')[1]).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[+d]):kind==='quarter'?'۞':t)),label+' QCF exact line/token order');
  assert.deepEqual(seen.colors,expectedColours,label+' exact annotation span text/classes');
  assert.deepEqual(seen.markers,tokens.filter(x=>x[0]==='end').map(x=>x[2]),label+' markers');assert.equal(seen.quarters,tokens.filter(x=>x[0]==='quarter').length);assert.equal(seen.sajdahs,tokens.filter(x=>x[0]==='sajdah').length);
  assert(seen.sizes.every(s=>s>=11&&s<=28)&&new Set(seen.sizes).size===1,label+' uniform historical size');assert(seen.wrap&&seen.overflow===0&&seen.doc<=1&&seen.sheetOverflow<=1,label+' overflow '+JSON.stringify(seen));
  minFont=Math.min(minFont,...seen.sizes);maxFont=Math.max(maxFont,...seen.sizes);maxHeight=Math.max(maxHeight,seen.height);
  if(reps.includes(n)&&tajweed==='on'){await p.mouse.move(0,0);await p.screenshot({path:`${out}/classic-page-${n}-${width}.png`,fullPage:true})}
  if(n%100===0)console.log('checked',label);if(n<604)await p.locator('#quran-next-classic-bottom').evaluate(e=>e.click());
 }
 assert.deepEqual(errors,[]);results.push({width,tajweed,pages:604,textMismatches:0,exactAnnotationSpans:true,overflow:0,errors:0,minFont,maxFont,maxHeight:Math.round(maxHeight)});await ctx.close();
}
await b.close();fs.writeFileSync(out+'/classic-allpages.json',JSON.stringify(results,null,2));console.log('PASS',JSON.stringify(results));})().catch(e=>{console.error(e);process.exit(1)});
