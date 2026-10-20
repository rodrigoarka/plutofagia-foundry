import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {seedPlutoCompendia,COLLECTIONS} from '../module/compendia.mjs';
const all=[...JSON.parse(fs.readFileSync(new URL('../assets/catalog.json',import.meta.url))),...JSON.parse(fs.readFileSync(new URL('../assets/cartas.json',import.meta.url)))];
test('os quatro compêndios distribuem os registros do suplemento e as 60 cartas originais',()=>{
 assert.equal(all.length,128);
 assert.equal(new Set(all.filter(e=>e.type==='carta').map(e=>e.name)).size,60);
 const total=Object.entries(COLLECTIONS).reduce((sum,[key,v])=>{
  const count=all.filter(e=>v.types.includes(e.type)).length;
  assert.ok(count>0,`compêndio vazio: ${key}`);return sum+count;
 },0);
 assert.equal(total,128);
});
test('sistema registra o tipo carta, URLs de release e formato V13',()=>{
 const j=JSON.parse(fs.readFileSync(new URL('../system.json',import.meta.url)));
 assert.equal(j.documentTypes.Item.carta.constructor,Object);
 assert.equal(j.version,'0.9.3');
 assert.match(j.download,/\/v0\.9\.3\/plutofagia\.zip$/);
});
test('catálogo por mundo é criado uma vez e não duplica na segunda abertura',async()=>{
 const packs=new Map();
 let inserted=[];
 globalThis.game={user:{isGM:true},packs:{get:id=>packs.get(id)}};
 globalThis.foundry={documents:{collections:{CompendiumCollection:{createCompendium:async metadata=>{
   const pack={collection:`world.${metadata.name}`,title:metadata.label,locked:false,
    index:[],getIndex:async function(){return this.index},getDocuments:async function(){return this.index.map(e=>({id:e._id,name:e.name,img:'icons/svg/book.svg'}))},configure:async()=>{}};
   packs.set(pack.collection,pack);return pack;
  }}}},utils:{deepClone:x=>JSON.parse(JSON.stringify(x))}};
 globalThis.Item={updateDocuments:async()=>{},createDocuments:async (items,{pack})=>{inserted.push(...items);packs.get(pack).index.push(...items.map((e,i)=>({_id:`i${i}`,name:e.name})));}};
 const fetchData=async name=>({ok:true,json:async()=>name.includes('cartas')?all.filter(e=>e.type==='carta'):all.filter(e=>e.type!=='carta')});
 const one=await seedPlutoCompendia({fetchData});
 assert.equal(Object.values(one).reduce((n,e)=>n+e.added,0),128);
 assert.equal(packs.size,4);
 const two=await seedPlutoCompendia({fetchData});
 assert.equal(Object.values(two).reduce((n,e)=>n+e.added,0),0);
 assert.equal(inserted.length,128);
});
