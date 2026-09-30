// Run against a served checkout; requires Playwright (NODE_PATH can locate it).
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),url=process.env.QURAN_QA_URL||'http://127.0.0.1:8815/';
const out=process.env.QURAN_QA_OUTPUT||'/private/tmp/v25-qa';fs.mkdirSync(out,{recursive:true});
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const pages=Array.from({length:604},(_,i)=>json(`quran/pages/${String(i+1).padStart(3,'0')}.json`));
const simple=Array.from({length:114},(_,i)=>json(`quran/scripts/simple/surah/${String(i+1).padStart(3,'0')}.json`));
const display=(s,a)=>{const d=simple[s-1],t=d.verses[a-1][1];return a===1&&d.bismillah?t.slice(d.bismillah.length+1):t};
const reps=[1,2,303,531,534,535,597,604];
async function enter(p){await p.locator('[data-app-view="allday"]').click();await p.locator('#quran-tab-library').click();await p.locator('#quran-continue').click();}
async function ready(p,n){await p.waitForFunction(n=>document.querySelector('.quran-page-folio')?.textContent===String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[+d])&&document.querySelector('#quran-reader-status').textContent==='',n);}
(async()=>{
const b=await chromium.launch({executablePath:process.env.QURAN_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const results=[];
for(const width of [320,390,1280]){
 for(const script of ['uthmani','simple']){
  for(const tajweed of script==='uthmani'?['off','on']:['on']){
   const ctx=await b.newContext({viewport:{width,height:844},serviceWorkers:'block'});
   const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await p.goto(url);await p.evaluate(({script,tajweed})=>{localStorage.setItem('uwa-quran-reader-v1',JSON.stringify({last:{surah:1,ayah:1,page:1,mode:'page'},bookmarks:[],mode:'page',script}));localStorage.setItem('uwa-quran-tajweed-v1',tajweed)},{script,tajweed});await p.reload();await enter(p);await ready(p,1);await p.evaluate(()=>document.fonts.ready);
   let maxNodes=0,maxHeight=0;
   for(let n=1;n<=604;n++){
    await ready(p,n);const data=pages[n-1],tokens=data.lines.flat(),keys=tokens.filter(x=>x[0]==='end').map(x=>x[2]);
    const seen=await p.evaluate(()=>({
     words:[...document.querySelectorAll('.quran-page-word')].map(e=>e.textContent),
     verses:[...document.querySelectorAll('.quran-simple-verse')].map(e=>{const c=e.cloneNode(true);c.querySelector('.quran-verse-marker').remove();return [e.dataset.verseKey,c.textContent.trim()]}),
     markerKeys:[...document.querySelectorAll('.quran-verse-marker')].map(e=>e.getAttribute('aria-label').replace('Akhir ayat ','')),
     headings:[...document.querySelectorAll('.quran-page-heading')].map(e=>e.textContent),
     basmalahs:[...document.querySelectorAll('.quran-page-bismillah')].map(e=>e.textContent),
     flows:document.querySelectorAll('.quran-page-flow').length,
     pairs:document.querySelectorAll('.quran-verse-end-pair').length,
     quarter:document.querySelectorAll('.quran-page-quarter').length,
     sajdah:document.querySelector('#quran-mushaf-page').textContent.split('۩').length-1,
     colors:document.querySelectorAll('#quran-mushaf-page [class^="tajweed-"]').length,
     overflow:[...document.querySelectorAll('.quran-page-flow,.quran-page-line,.quran-verse-end-pair')].filter(e=>e.scrollWidth>e.clientWidth+1&&e.clientWidth>0).length,
     doc:document.documentElement.scrollWidth-innerWidth,
     badStyle:[...document.querySelectorAll('.quran-page-flow')].filter(e=>getComputedStyle(e).direction!=='rtl'||getComputedStyle(e).textAlign!=='right'||getComputedStyle(e).fontSize!=='32px').length,
     clipped:[...document.querySelectorAll('#quran-mushaf-page *')].filter(e=>['hidden','clip'].includes(getComputedStyle(e).overflowY)).length,
     nodes:document.querySelectorAll('#quran-mushaf-page *').length,height:document.querySelector('#quran-mushaf-page').getBoundingClientRect().height
    }));
    const label=`${script}/${tajweed}/${width}/page${n}`;
    assert.deepEqual(seen.markerKeys,keys,label+' marker order');assert.equal(seen.pairs,keys.length,label+' pairing');
    assert.deepEqual(seen.headings,tokens.filter(x=>x[0]==='surah_header').map(x=>'سُورَةُ '+json('quran/chapters.json')[x[3]-1][2]),label+' headings');
    let flows=0,open=false;for(const line of data.lines){if(['surah_header','bismillah'].includes(line[0][0]))open=false;else if(!open){flows++;open=true}}
    if(script==='uthmani'){
     assert.deepEqual(seen.words,tokens.filter(x=>['word','bismillah'].includes(x[0])).map(x=>x[1]),label+' immutable words');
     assert.equal(seen.flows,flows,label+' flows');assert.equal(seen.quarter,tokens.filter(x=>x[0]==='quarter').length,label+' quarters');
     assert.equal(seen.sajdah,tokens.filter(x=>x[0]==='sajdah').length,label+' sajdah');
     assert(tajweed==='on'?seen.colors>0:seen.colors===0,label+' colors');
     assert.deepEqual(seen.basmalahs,tokens.filter(x=>x[0]==='bismillah').map(x=>x[1]),label+' basmalahs');
    }else{
     assert.deepEqual(seen.verses,keys.map(k=>{const [s,a]=k.split(':').map(Number);return [k,display(s,a)]}),label+' immutable Simple verses');
     assert.equal(seen.sajdah,keys.reduce((c,k)=>{const [s,a]=k.split(':').map(Number);return c+(display(s,a).includes('۩')?1:0)},0),label+' sajdah');
     assert.deepEqual(seen.basmalahs,tokens.filter(x=>x[0]==='bismillah').map(x=>simple[x[3]-1].bismillah),label+' basmalahs');
     assert.equal(seen.colors,0,label+' unsupported Tajweed');
    }
    assert(seen.doc<=1&&seen.overflow===0&&seen.badStyle===0&&seen.clipped===0,label+' layout '+JSON.stringify(seen));
    maxNodes=Math.max(maxNodes,seen.nodes);maxHeight=Math.max(maxHeight,seen.height);
    if(reps.includes(n)&&tajweed==='on')await p.screenshot({path:path.join(out,`${script}-page-${n}-${width}.png`),fullPage:true});
    if(n%100===0)console.log('checked',label);
    if(n<604)await p.locator('#quran-next-page-bottom').evaluate(e=>e.click());
   }
   await p.locator('#quran-settings-toggle').click();
   assert.equal(await p.locator('#quran-tajweed-on').isDisabled(),script==='simple');
   assert.equal(await p.locator('#quran-script-'+script).getAttribute('aria-pressed'),'true');
   assert.equal(await p.locator('#quran-settings').getByText('IndoPak',{exact:true}).count(),0);
   await p.screenshot({path:path.join(out,`${script}-settings-${width}.png`)});
   assert.deepEqual(errors,[]);
   results.push({width,script,tajweed,pages:604,errors:0,overflow:0,textMismatches:0,maxNodes,maxHeight:Math.round(maxHeight)});await ctx.close();
  }
 }
}
await b.close();fs.writeFileSync(path.join(out,'allpages.json'),JSON.stringify(results,null,2));console.log('PASS',JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
