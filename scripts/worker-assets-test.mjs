import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire,stripTypeScriptTypes} from 'node:module';
const require=createRequire(import.meta.resolve('wrangler'));
const {Miniflare,convertV4MiniflareOptions}=require('miniflare');
const config=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));
const mf=new Miniflare(convertV4MiniflareOptions({name:'gyeongdongmkt-test',modules:true,script:stripTypeScriptTypes(fs.readFileSync('src/worker.ts','utf8')),compatibilityDate:config.compatibility_date,assets:{directory:'dist',binding:'ASSETS',run_worker_first:true,routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true},assetConfig:{not_found_handling:'404-page'}}}));
try{
 for(const uri of ['/404','/404/','/404.html','/unknown-test'])for(const query of ['','?a=b%2Fc&a=2'])for(const method of ['GET','HEAD']){
  const r=await mf.dispatchFetch(`https://gyeongdongmkt.com${uri}${query}`,{method,redirect:'manual'});assert.equal(r.status,404,method+uri+query);assert.equal(r.headers.get('X-Robots-Tag'),'noindex, follow');assert.equal(r.headers.get('Location'),null);const body=await r.text();assert.equal(method==='HEAD'?body==='':/noindex,nofollow/.test(body),true);
 }
 for(const uri of ['/','/cookies/','/privacy/','/terms/'])for(const method of ['GET','HEAD']){const r=await mf.dispatchFetch('https://gyeongdongmkt.com'+uri,{method,redirect:'manual'});assert.equal(r.status,200,uri);assert.equal(r.headers.get('X-Robots-Tag'),null);await r.arrayBuffer();}
 function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
 for(const file of files('dist').filter(x=>!x.endsWith('.html'))){const r=await mf.dispatchFetch('https://gyeongdongmkt.com/'+file.slice(5),{redirect:'manual'});assert.equal(r.status,200,file);await r.arrayBuffer();}
 for(const origin of ['http://gyeongdongmkt.com','http://www.gyeongdongmkt.com','https://www.gyeongdongmkt.com'])for(const method of ['GET','HEAD']){const r=await mf.dispatchFetch(origin+'/cookies/?a=b%2Fc&a=2',{method,redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('Location'),'https://gyeongdongmkt.com/cookies/?a=b%2Fc&a=2');await r.arrayBuffer();}
 console.log('PASS unchanged actual Worker+Assets:32 GET/HEAD/query explicit-alias/unknown404 cases,8normal GET/HEAD200,all built nonHTML resources200,existing canonical protocol/host regression preserves path/query. Production compatibility2026-08-01 used unchanged; no browser/production assertion.');
}finally{await mf.dispose();console.log('Local Worker disposed.');}
