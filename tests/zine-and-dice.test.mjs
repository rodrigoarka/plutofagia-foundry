import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getItemArtwork,ITEM_ARTWORK,LEGACY_ARTWORK} from '../module/artwork.mjs';
import {diceTape,countDamageExplosions,explosionStamps,decoratePlutoChat} from '../module/chat-ui.mjs';
import {registerPlutoDice,PLUTO_DICE_COLOR,PLUTO_DICE_SYSTEM} from '../module/dice-theme.mjs';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const base=JSON.parse(read('assets/catalog.json'));
test('iconografia do catálogo: 26 registros ilustrados e arquivos SVG locais',()=>{
 const entries=base.filter(x=>['arma','protecao','equipamento','consumivel'].includes(x.type));
 assert.equal(entries.length,26);
 assert.equal(Object.keys(ITEM_ARTWORK).length,26);
 assert(entries.every(x=>x.img===ITEM_ARTWORK[x.name]));
 assert(new Set(entries.map(x=>x.img)).size>=18);
 entries.forEach(item=>{
  const path=item.img.replace('systems/plutofagia/','');
  assert.match(read(path),/<svg/);
 });
});
test('preserva ícones personalizados, mas melhora itens antigos',()=>{
 const original='systems/outro/img/meu-item.webp';
 assert.equal(getItemArtwork({name:'Bastão encantado',img:original}),original);
 assert.equal(getItemArtwork({name:'Bastão encantado',img:'icons/svg/sword.svg'}),ITEM_ARTWORK['Bastão encantado']);
 assert(LEGACY_ARTWORK.has('icons/svg/item-bag.svg'));
});
test('dado 10 não muda a matemática e aparece como Ⓐ em 2D',()=>{
 assert.match(diceTape([4,10,2]),/Ⓐ/);
 assert.match(diceTape([10]),/Resultado 10/);
 assert(!diceTape([4,7]).includes('Ⓐ'));
});
test('cada 10 do dano ganha um único carimbo vermelho',()=>{
 const roll={dice:[{faces:10,results:[{result:10,active:true},{result:10,active:true},{result:4,active:true},{result:10,active:false}]},{faces:6,results:[{result:10,active:true}]}]};
 assert.equal(countDamageExplosions(roll),2);
 assert.equal((explosionStamps(roll).match(/class="pluto-anarchy-stamp"/g)||[]).length,2);
 assert.equal(explosionStamps({dice:[{faces:10,results:[{result:6,active:true}]}]}),'');
});
test('tema tridimensional opcional com D10 preto e símbolo no 10',()=>{
 const events=[];
 const api={addColorset:x=>events.push(['colorset',x]),addSystem:(...args)=>events.push(['system',...args]),addDicePreset:x=>events.push(['preset',x])};
 assert.equal(registerPlutoDice(null),false);
 assert.equal(registerPlutoDice(api),true);
 assert.equal(events[0][1].name,PLUTO_DICE_COLOR);
 assert.equal(events[0][1].background,'#0b0c0e');
 assert.equal(events[1][1].id,PLUTO_DICE_SYSTEM);
 assert.equal(events[2][1].labels.length,10);
 assert.equal(events[2][1].labels[9],'Ⓐ');
});
test('personalização do chat usa hook HTML Foundry 13 e não altera outros sistemas',()=>{
 let tagged=false;
 const html={querySelector:()=>({}),classList:{add:n=>{tagged=n==='pluto-zine-message';}},querySelectorAll:()=>[]};
 assert.equal(decoratePlutoChat(null,html),true);
 assert(tagged);
 assert.equal(decoratePlutoChat(null,{querySelector:()=>null}),false);
 const main=read('module/main.mjs');
 assert(main.includes('renderChatMessageHTML'));
});
test('CSS protege textos longos e formulário de dano em telas estreitas',()=>{
 const css=read('styles/plutofagia.css');
 assert.match(css,/overflow-wrap:anywhere/);
 assert.match(css,/word-break:break-word/);
 assert.match(css,/max-width:420px/);
 assert.match(css,/pluto-explosion-report/);
 assert.match(css,/pluto-item-icon/);
});
test('rolagem explosiva só é sinalizada no dano, não nos testes de ataque',()=>{
 const rules=read('module/rules.mjs');
 const pool=rules.slice(rules.indexOf('export async function rollPool'),rules.indexOf('export async function rollExploding'));
 const damage=rules.slice(rules.indexOf('export async function rollExploding'),rules.indexOf('export function combatStatus'));
 assert(!pool.includes('explosionStamps('));
 assert(damage.includes('explosionStamps(roll)'));
 assert(damage.includes('diceTape(roll'));
});
