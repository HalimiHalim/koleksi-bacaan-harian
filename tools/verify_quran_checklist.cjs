// Synthetic state only: no user storage snapshots or credentials.
const assert=require('assert'), fs=require('fs'), vm=require('vm'), path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../quran/checklist.js'),'utf8');
const pre='uwa-quran-checklist-v1', old='uwa-navigation-renovation-trial-v1';
function run(seed={},fail=()=>false,today='2026-10-04') {
 const map=new Map(Object.entries(seed)), original={...seed}; let writes=0;
 const storage={get length(){return map.size},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(fail(k,++writes))throw Error('synthetic quota failure');map.set(k,v)},removeItem:k=>map.delete(k)};
 const NativeDate=Date; class FixedDate extends NativeDate { constructor(...args){super(...(args.length?args:[today+'T12:00:00']))} }
 const context={window:{},localStorage:storage,Date:FixedDate}; vm.runInNewContext(source,context);
 return {api:context.window.QuranChecklist,map,original,storage,context};
}
const seed=(members,order=members,done=[],date='2026-10-04')=>({[old+'-initialized']:'{"schema":1}',[old+'-members-allday']:JSON.stringify(members),[old+'-order-allday']:JSON.stringify(order),[old+`-daily-${date}-allday`]:JSON.stringify(done),'uwa-custom-readings-v1':'[]'});
const value=(r,key)=>JSON.parse(r.map.get(pre+'-'+key));
function unchanged(r){for(const [k,v] of Object.entries(r.original))assert.equal(r.map.get(k),v,'source retained '+k)}
let cases=0;
for(const [label,input,members,done] of [
 ['fresh',{},['112','113','114'],[]],
 ['standard',seed(['4','15','17']),['112','113','114'],[]],
 ['ordered partial',seed(['4','15','17'],['17','4','15'],['4','15']),['112','113','114'],['112','113','114']],
 ['stale',seed(['4'],['4'],['4'],'2026-10-03'),['112','113','114'],[]],
 ['empty',seed([]),[],[]],
 ['custom',seed(['u-example','4','15']),['112','113','114'],[]],
 ['duplicate',seed(['4','4','15'],['4','4','15'],['4']),['112','113','114'],[]],
 ['duplicate order',seed(['4'],['4','4'],['4']),['112','113','114'],[]],
 ['only excerpts',seed(['15','17']),[],[]],
 ['pretrial empty',{'uwa-routine-members-allday-v1':'[]'},[],[]]
]){
 const r=run(input);assert(r.api.ready,label);assert.deepEqual(value(r,'members'),members,label);assert.deepEqual(value(r,'daily-2026-10-04'),done,label);unchanged(r);
 const before=JSON.stringify([...r.map]);vm.runInNewContext(source,r.context);assert.equal(JSON.stringify([...r.map]),before,label+' idempotent');cases++;
}
for(let at=1;at<=5;at++){
 const input=seed(['4','15'],['4','15'],['4']);const r=run(input,(_,n)=>n===at);assert(!r.api.ready);unchanged(r);assert(!r.map.has(pre+'-migrated'));
 const resumed=run(Object.fromEntries(r.map));assert(resumed.api.ready);assert.deepEqual(value(resumed,'members'),['112','113','114']);assert.deepEqual(value(resumed,'daily-2026-10-04'),['112','113','114']);unchanged(resumed);cases++;
}
// Persistent write refusal and unavailable reads never mutate source.
const failed=run(seed(['4']),()=>true);assert(!failed.api.ready);unchanged(failed);cases++;
const blocked={window:{},localStorage:{getItem(){throw Error('denied')}}};vm.runInNewContext(source,blocked);assert(!blocked.window.QuranChecklist.ready);cases++;
const malformed=run(seed(['4'],'not-an-array'));assert(!malformed.api.ready);unchanged(malformed);cases++;
// Resume on a new day must not carry backed-up completion into today.
const interrupted=run(seed(['4'],['4'],['4']),(_,n)=>n===3);const next=run(Object.fromEntries(interrupted.map),()=>false,'2026-10-05');assert(next.api.ready);assert.deepEqual(value(next,'daily-2026-10-05'),[]);cases++;
console.log('PASS migration cases:',cases);
