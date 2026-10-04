// Synthetic fixtures only; no real user's reading history.
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),chapters=JSON.parse(fs.readFileSync(root+'/quran/chapters.json')),source=fs.readFileSync(root+'/quran/recent.js','utf8');
const key='uwa-quran-recent-v1',readerKey='uwa-quran-reader-v1';
function create(seed={},fail=()=>false) {const map=new Map(Object.entries(seed)),writes=[];const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{writes.push(k);if(fail(k))throw Error('synthetic failure');map.set(k,v)},removeItem:k=>map.delete(k)};const context={window:{}};vm.runInNewContext(source,context);return {map,writes,storage,api:context.window.createQuranRecent(chapters,storage),reload:()=>context.window.createQuranRecent(chapters,storage)}}
const entry=(surah,mode='list',ayah=1,page=chapters[surah-1][4])=>({surah,mode,ayah,...(mode==='list'?{}:{page})});
const plain=r=>JSON.parse(JSON.stringify(r.api.entries));let cases=0;
let r=create();assert.deepEqual(plain(r),[]);assert.deepEqual(JSON.parse(r.map.get(key)),{schema:1,entries:[]});cases++;
r=create({[readerKey]:JSON.stringify({last:{surah:2,ayah:10,page:3,mode:'list'},bookmarks:['1:2'],script:'simple'})});assert.deepEqual(plain(r),[entry(2,'list',10)]);const backup=r.map.get(key+'-legacy-backup'),original=r.map.get(readerKey);assert.deepEqual(JSON.parse(backup).last,{surah:2,ayah:10,page:3,mode:'list'});r.reload();assert.equal(r.map.get(readerKey),original);assert.equal(r.map.get(key+'-legacy-backup'),backup);cases++;
for(const invalid of [{surah:0,mode:'list',ayah:1},{surah:115,mode:'list',ayah:1},{surah:1,mode:'list',ayah:8},{surah:1,mode:'page',ayah:1,page:2},{surah:2,mode:'classic',ayah:1,page:605},{surah:2,mode:'bad',ayah:1},{surah:1,mode:'list',ayah:0}]){r=create({[readerKey]:JSON.stringify({last:invalid})});assert.deepEqual(plain(r),[]);cases++;}
r=create({[key]:JSON.stringify({schema:1,entries:[]}),[readerKey]:JSON.stringify({last:entry(2)})});assert.deepEqual(plain(r),[],'empty never reseeded');cases++;
r=create();for(let i=1;i<=11;i++)r.api.record(entry(i));assert.deepEqual(plain(r).map(x=>x.surah),[11,10,9,8,7,6,5,4,3,2]);cases++;
r.api.record(entry(5,'list',4));assert.deepEqual(plain(r).map(x=>x.surah),[5,11,10,9,8,7,6,4,3,2]);assert.equal(plain(r)[0].ayah,4);const count=r.writes.length;assert(!r.api.record(entry(5,'list',4)));assert.equal(r.writes.length,count,'same position no spam');cases++;
r.api.record(entry(9,'page',1),false);assert.equal(plain(r)[3].surah,9,'mode metadata retains order');assert.equal(plain(r)[3].mode,'page');assert.equal(plain(r).length,10);cases++;
assert.deepEqual(JSON.parse(JSON.stringify(r.reload().entries)),plain(r),'reload independent of day');cases++;
r=create({[key]:JSON.stringify({schema:1,entries:[entry(1),entry(1,'list',3),{surah:2,mode:'page',ayah:1,page:600},entry(2,'classic',6,3),entry(114)]})});assert.deepEqual(plain(r),[entry(1),entry(2,'classic',6,3),entry(114)]);cases++;
for(const raw of ['bad','null','{"schema":2,"entries":[]}','{"schema":1,"entries":{}}']){r=create({[key]:raw});assert.deepEqual(plain(r),[]);assert.equal(r.map.get(key),raw,'malformed retained until actual read');r.api.record(entry(1));assert.deepEqual(plain(r),[entry(1)]);cases++;}
r=create({[readerKey]:JSON.stringify({last:entry(2),bookmarks:['2:1']})},k=>k.endsWith('legacy-backup'));assert(!r.api.protectLegacy());assert(!r.map.has(key));assert.equal(r.map.get(readerKey),JSON.stringify({last:entry(2),bookmarks:['2:1']}));cases++;
r=create({[key]:JSON.stringify({schema:1,entries:[entry(1)]})},k=>k===key);const saved=r.map.get(key);r.api.record(entry(2));assert.deepEqual(plain(r).map(x=>x.surah),[2,1]);assert.equal(r.map.get(key),saved);assert(r.api.notice);cases++;
const blocked={window:{}};vm.runInNewContext(source,blocked);const unavailable=blocked.window.createQuranRecent(chapters,{getItem(){throw Error('denied')}});assert(!unavailable.protectLegacy());unavailable.record(entry(1));assert.equal(unavailable.entries[0].surah,1);cases++;
let refuse=true;r=create({},k=>k===key&&refuse);r.api.record(entry(1));assert(!r.map.has(key));refuse=false;r.api.record(entry(1));assert.equal(JSON.parse(r.map.get(key)).entries[0].surah,1,'retry same position after storage recovery');cases++;
console.log('PASS recent history cases:',cases);
