import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const baseline=process.argv.includes('--expect-base-failures'),key='gyeongdongmkt_cookie_preferences',veto='gyeongdongmkt_analytics_denied',disable='ga-disable-G-HXM22WWPKP';
const runtime=baseline?execFileSync('git',['show','239fec864b4342d5eeec8dfdf1af0866aec81f45:public/js/consent.js'],{encoding:'utf8'}):fs.readFileSync('dist/js/consent.js','utf8');
if(!baseline)assert.equal(runtime,fs.readFileSync('public/js/consent.js','utf8'));
function store(map=new Map()){return{map,fail:{},writes:[],getItem(k){if(this.fail.read)throw Error('read');return map.get(k)??null;},setItem(k,v){if(this.fail.write)throw Error('write');map.set(k,v);this.writes.push([k,v]);if(this.fail.readAfterWrite&&k===key)this.fail.read=true;},removeItem(k){if(this.fail.clear)throw Error('clear');map.delete(k);}};}
function page({local=store(),session=store(),file='cookies/index.html'}={}){
 const html=fs.readFileSync('dist/'+file,'utf8'),nodes=[],listeners={},scripts=[];
 assert.match(html,/<html lang="ko-KR"/);
 for(const tag of html.matchAll(/<(\w+)([^>]*)>/g)){
  const attrs=Object.fromEntries(Array.from(tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g),m=>[m[1],m[2]??'']));
  if(!attrs.id&&!Object.keys(attrs).some(k=>k.startsWith('data-')))continue;
  const classes=new Set((attrs.class||'').split(' '));nodes.push({attrs,checked:false,textContent:'',events:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},addEventListener(type,fn){this.events[type]=fn;}});
 }
 const ctx={localStorage:local,sessionStorage:session,navigator:{},location:{hostname:'gyeongdongmkt.com'},document:{documentElement:{lang:'ko-KR'},cookie:'_ga=fixture',getElementById:id=>nodes.find(n=>n.attrs.id===id),querySelectorAll:selector=>nodes.filter(n=>selector.startsWith('[')&&selector.slice(1,-1) in n.attrs),createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},addEventListener(type,fn){(listeners[type]||=[]).push(fn);}};
 ctx.window=ctx;vm.createContext(ctx);const order=[];
 for(const s of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
  if(s[1].includes('application/ld+json'))continue;const src=s[1].match(/src="([^"]+)"/)?.[1];
  if(src){assert.match(s[1],/defer/);order.push(src);vm.runInContext(src==='/js/consent.js'?runtime:fs.readFileSync('dist'+src,'utf8'),ctx);}
  else vm.runInContext(s[2],ctx);
 }
 assert.deepEqual(order,['/js/consent.js']);
 const checkbox=ctx.document.getElementById('analytics'),statuses=()=>ctx.document.querySelectorAll('[data-consent-status]');
 return{ctx,local,session,scripts,checkbox,choose(value){checkbox.checked=value;checkbox.events.change?.();ctx.document.getElementById('cookie-settings').events.submit({preventDefault(){}});},draft(value){checkbox.checked=value;checkbox.events.change?.();},deny(){ctx.document.querySelectorAll('[data-cookie-reject]')[0].events.click();},storageEvent(){for(const fn of listeners.storage||[])fn({key,newValue:local.map.get(key)??null});},state(){return{disabled:ctx[disable],checked:checkbox?.checked,status:statuses().map(n=>n.textContent),shared:local.map.get(key)??null,libraries:scripts.length,lastConsent:Array.from(ctx.dataLayer||[]).filter(a=>a[0]==='consent').at(-1)?.[2].analytics_storage};}};
}
let p=page();p.choose(true);p.choose(false);p.choose(true);
if(baseline){
 assert.equal(p.state().lastConsent,'denied');
 const unreadable=store();unreadable.fail.read=true;p=page({local:unreadable});p.choose(true);assert.equal(JSON.parse(p.state().shared).analytics,true);assert.equal(p.state().disabled,true);assert.match(p.state().status[0],/허용했습니다/);
 const shared=store(new Map([[key,'{"analytics":false}']]));p=page({local:shared,session:store(new Map([[veto,'1']]))});p.session.fail.clear=true;p.choose(true);assert.equal(JSON.parse(p.state().shared).analytics,true);
 console.log('PASS reproduced original regrant runtime denial, local-read/writeok false allowed/shared grant, and veto-clear failure publishing shared grant.');
}else{
 assert.equal(p.state().lastConsent,'granted');assert.equal(p.scripts.length,1);assert.equal(p.state().disabled,false);p.choose(false);p.choose(false);assert.equal(p.state().disabled,true);assert.ok(p.state().status.every(s=>/거부했습니다/.test(s)));p.choose(true);p.draft(false);assert.ok(p.state().status.every(s=>s===''));p.choose(false);assert.equal(p.state().lastConsent,'denied');
 const oldGrant=store(new Map([[key,'{"analytics":true}']]));p=page({local:oldGrant});oldGrant.fail.write=true;p.deny();assert.equal(p.state().disabled,true);assert.equal(p.state().lastConsent,'denied');assert.equal(oldGrant.map.get(key),'{"analytics":true}');assert.equal(p.session.getItem(veto),'1');assert.ok(p.state().status.every(s=>/이 탭/.test(s)));const reload=page({local:oldGrant,session:p.session});assert.equal(reload.scripts.length,0);
 for(const which of ['local','session']){const local=store(new Map([[key,'{"analytics":true}']])),session=store();(which==='local'?local:session).fail.read=true;p=page({local,session});assert.equal(p.scripts.length,0);p.choose(true);assert.equal(p.state().disabled,true);assert.equal(p.checkbox.checked,false);assert.ok(p.state().status.every(s=>!s.includes('허용했습니다')));assert.equal(local.writes.length,0);}
 const unreadable=store(new Map([[key,'{"analytics":false}']]));unreadable.fail.read=true;p=page({local:unreadable});p.choose(true);const healthy=page({local:store(unreadable.map)});assert.equal(healthy.scripts.length,0);assert.equal(JSON.parse(unreadable.map.get(key)).analytics,false);
 const late=store();late.fail.readAfterWrite=true;p=page({local:late});p.choose(true);assert.equal(p.checkbox.checked,false);assert.equal(p.state().disabled,true);assert.ok(p.state().status.every(s=>/이 페이지/.test(s)&&!s.includes('허용했습니다')));
 p=page();p.choose(true);p.local.fail.write=true;p.session.fail.write=true;p.deny();assert.equal(p.state().lastConsent,'denied');assert.ok(p.state().status.every(s=>/이 페이지/.test(s)));
 const shared=store(new Map([[key,'{"analytics":false}']])),a=page({local:shared,session:store(new Map([[veto,'1']]))}),b=page({local:store(shared.map)});a.session.fail.clear=true;a.choose(true);b.storageEvent();assert.equal(JSON.parse(shared.map.get(key)).analytics,false);assert.equal(a.checkbox.checked,false);assert.equal(b.scripts.length,0);a.session.fail.clear=false;a.choose(true);b.choose(true);assert.equal(b.state().lastConsent,'granted');a.deny();b.storageEvent();assert.equal(b.state().lastConsent,'denied');assert.equal(b.checkbox.checked,false);assert.ok(b.state().status.every(s=>/꺼져/.test(s)));
 for(const raw of ['bad','null','{"analytics":"true"}']){p=page({local:store(new Map([[key,raw]]))});assert.equal(p.scripts.length,0);}
 for(const file of ['index.html','privacy/index.html','terms/index.html','404.html']){p=page({file});assert.equal(p.scripts.length,0);}
 console.log('PASS actual Korean built initializer/order/registered controls: repeated allow-save/deny-save; draft clears old feedback; library regrant; old-grant failed-write fresh-document veto; independent local/session reads; no shared grant on unreadable local or failed veto clear; late read truthful page scope; dual failure; separate-tab stores/runtime/UI denial; malformed preference; every existing page initializer. DOM/storage simulation, not browser acceptance.');
}
