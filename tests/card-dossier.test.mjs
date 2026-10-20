import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=new URL('../',import.meta.url);
test('60 cartas possuem ícones SVG correspondentes, locais e disponíveis offline',()=>{
 const cards=JSON.parse(fs.readFileSync(new URL('../assets/cartas.json',import.meta.url),'utf-8'));
 assert.equal(cards.length,60);
 const set=new Set();
 cards.forEach((card,index)=>{
  const expected=`systems/plutofagia/assets/card-icons/${String(index+1).padStart(2,'0')}.svg`;
  assert.equal(card.img,expected);
  assert(!set.has(card.img));
  set.add(card.img);
  const svg=fs.readFileSync(new URL('../'+card.img.replace('systems/plutofagia/',''),import.meta.url),'utf-8');
  assert.match(svg,/<svg\b/);
 });
});
test('mural de cartas expansível na aba combate e sem duplicação de lista',()=>{
 const hbs=fs.readFileSync(new URL('../templates/actor.hbs',import.meta.url),'utf-8');
 assert.match(hbs,/data-pluto-cards-panel/);
 assert.match(hbs,/<details/);
 assert.equal((hbs.match(/data-pluto-collection="cartas"/g)||[]).length,1);
 assert.match(hbs,/data-action="go-cards"/);
});
test('inventário reescreve somente a coleção de cartas, preservando o estado da aba e o painel',()=>{
 const js=fs.readFileSync(new URL('../module/inventory-ui.mjs',import.meta.url),'utf-8');
 assert.match(js,/host\.replaceChildren\(fragment\)/);
 assert.match(js,/cardsOpen/);
 assert.match(js,/pluto-card-entry/);
});
