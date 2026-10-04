const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// Execute actual production functions, including the transaction and handler guards.
function source(name) {
  const start = html.indexOf(`  function ${name}(`);
  assert(start >= 0, name);
  return html.slice(start, html.indexOf('\n  }', start) + 4);
}
const ctx = vm.createContext({window:{}, editError:{}, userReading:() => ({id:'forged'}), localStorage:null});
vm.runInContext(fs.readFileSync(path.join(root, 'source-delete.js'), 'utf8'), ctx);
vm.runInContext(['isBuiltIn','openEditReading','deleteUserReading','applyStorageTransaction','storageFailureMessage','loadCustomReadings','loadDeletedIds'].map(source).join('\n') + '\nlet storageRollbackFailed=false; const customStorageKey="uwa-custom-readings-v1",deletedIdsKey="uwa-deleted-reading-ids-v1";', ctx);
const results=[];
function test(name, check) { check(); results.push(name); }
function storage(seed={}) {
  const data = new Map(Object.entries(seed));
  return {data, get length(){return data.size}, key:i=>[...data.keys()][i]??null,
    getItem:k=>data.get(k)??null, setItem:(k,v)=>data.set(k,String(v)), removeItem:k=>data.delete(k)};
}
const readings = ['u-legacy','u-other'].map(id=>({id,name:id,arabic:'',meaning:'',reference:''}));
const member = t=>`uwa-navigation-renovation-trial-v1-members-${t}`;
const order = t=>`uwa-navigation-renovation-trial-v1-order-${t}`;
const plan = s=>ctx.window.planCustomSourceDeletion(s,'u-legacy',readings,['u-old']);
test('All 21 built-ins locked in edit and delete handlers before any read, even forged custom lookup',()=>{
  ctx.localStorage={getItem(){throw Error('must never read')}};
  for(let i=1;i<=21;i++)for(const id of [i,String(i)]) {
    assert.equal(ctx.isBuiltIn(id),true);assert.equal(ctx.openEditReading(id),false);assert.equal(ctx.deleteUserReading(id),false);
  }
  assert.equal(ctx.isBuiltIn('u-21'),false);
});
test('Absent explicit collections are not failures; only custom record and tombstone planned',()=>assert.equal(plan(storage()).length,2));
test('Cleanup removes selected ID only, preserves numeric types, unrelated unknown IDs, daily duplicates and every Quran/backup raw byte',()=>{
  const seed={};
  for(const t of ['morning','evening']) {
    for(const k of [member(t),order(t),`uwa-routine-members-${t}-v1`,`uwa-routine-order-${t}-v1`]) seed[k]='[1,"u-other","u-legacy","missing-old-source"]';
    for(const prefix of ['uwa-daily-','uwa-navigation-renovation-trial-v1-daily-'])for(const day of ['2020-01-01','2026-10-04']) seed[`${prefix}${day}-${t}`]='[1,"u-legacy","u-other","u-other"]';
  }
  for(const k of ['uwa-navigation-renovation-trial-v1-members-allday','uwa-routine-order-allday-v1','uwa-navigation-renovation-trial-v1-daily-2026-10-04-allday','uwa-daily-2020-01-01-allday','uwa-quran-checklist-v1-members','uwa-quran-recent-v1','uwa-quran-reader-v1','uwa-quran-checklist-v1-migration-backup','uwa-navigation-renovation-trial-v1-daily-2026-10-04-morning-backup','uwa-selawat-21-stanzas-v1'])seed[k]='broken historical / isolated state';
  const s=storage(seed),before=Object.fromEntries(s.data),get=s.getItem;
  s.getItem=k=> { if(k.includes('allday')||k.includes('quran')||k.includes('backup')||k.includes('selawat'))throw Error('must not access unrelated storage');return get(k) };
  const changes=plan(s);changes.forEach(([k,v])=>s.setItem(k,v));
  for(const [k,v]of Object.entries(before)) {
    if(k.includes('allday')||k.includes('quran')||k.includes('backup')||k.includes('selawat'))assert.equal(s.data.get(k),v);
    else assert.deepEqual(JSON.parse(s.data.get(k)),JSON.parse(v).filter(id=>id!=='u-legacy'));
  }
  assert.equal(changes.length,18);
});
test('Malformed active lists, duplicate IDs, invalid values and orphan orders block without writes and identify module/field',()=>{
  for(const raw of ['broken','{}','null','[0]','[{}]','["1",1]']) {
    const s=storage({[member('morning')]:raw});assert.throws(()=>plan(s),/Data Zikir \(senarai\) tidak sah/);assert.equal(s.data.size,1);assert.equal(s.data.get(member('morning')),raw);
  }
  assert.throws(()=>plan(storage({[member('evening')]:'["1"]',[order('evening')]:'["u-other"]'})),/Susunan Himpunan Doa/);
  assert.throws(()=>plan(storage({'uwa-daily-2026-10-04-evening':'{}'})),/Himpunan Doa \(tanda selesai\)/);
});
test('Actual active storage read or enumeration failures are distinct from absence',()=>{
  const s=storage();s.getItem=()=>{throw Error('denied')};assert.throws(()=>plan(s),/Storan Zikir.*tidak dapat diakses/);
  const e=storage();e.key=()=>{throw Error('denied')};e.setItem('opaque','x');assert.throws(()=>plan(e),/Senarai storan/);
});
test('Unsupported historical numeric custom identity/duplicate records and malformed tombstones preserved and writes blocked',()=>{
  for(const items of [[{...readings[0],id:'21'}],[readings[0],readings[0]]]) {
    ctx.localStorage=storage({'uwa-custom-readings-v1':JSON.stringify(items)});assert.equal(ctx.loadCustomReadings().error,true);assert.equal(ctx.localStorage.data.size,1);
  }
  ctx.localStorage=storage({'uwa-deleted-reading-ids-v1':'["21"]'});assert.equal(ctx.loadDeletedIds().error,true);
});
test('Refused partial write rolls back all previous values, including originally absent tombstone',()=>{
  for(const refusal of ['throw','silent','write-then-throw']) {
    const s=storage({'uwa-custom-readings-v1':JSON.stringify(readings),[member('morning')]:'["u-legacy","1"]'}),before=[...s.data];
    const set=s.setItem;let failed=false;
    s.setItem=(k,v)=> { if(!failed&&k===member('morning')) {failed=true;if(refusal==='write-then-throw')set(k,v);if(refusal!=='silent')throw Error('refused');return;}set(k,v) };
    ctx.localStorage=s;assert.equal(ctx.applyStorageTransaction(plan(s)),false);assert.deepEqual([...s.data],before);assert.match(ctx.storageFailureMessage(),/Data asal dikekalkan/);
  }
});
test('Snapshot read failure prevents all writes',()=>{
  const s=storage({a:'old'});s.getItem=()=>{throw Error('blocked')};ctx.localStorage=s;assert.equal(ctx.applyStorageTransaction([['a','new']]),false);assert.equal(s.data.get('a'),'old');
});
test('Silently refused rollback is verified and reports possible incomplete recovery, never success',()=>{
  const s=storage({a:'old',b:'old'}),set=s.setItem;s.setItem=(k,v)=>{if(k==='b')throw Error('denied');if(v!=='old')set(k,v)};
  ctx.localStorage=s;assert.equal(ctx.applyStorageTransaction([['a','new'],['b','new']]),false);assert.match(ctx.storageFailureMessage(),/pemulihan mungkin tidak lengkap/);
});
console.log(JSON.stringify({passed:results.length,checks:results},null,2));
