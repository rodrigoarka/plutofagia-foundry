import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cardTone,cardsForDraw,cardAtRoll,CARD_TONES,loadCardDeck} from '../module/cards.mjs';

const deck=JSON.parse(fs.readFileSync(new URL('../assets/cartas.json',import.meta.url),'utf8'));
test('O catálogo original possui 60 cartas divididas em 20/20/20',()=>{
 assert.equal(cardsForDraw(deck,'todas').length,60);
 for(const category of ['favoravel','dubia','ruim'])assert.equal(cardsForDraw(deck,category).length,20);
 assert.equal(new Set(deck.map(c=>c.name)).size,60);
});
test('Desfavoráveis não são classificadas como favoráveis',()=>{
 assert.equal(cardTone('desfavoráveis'),'ruim');
 assert.equal(cardTone('favoráveis'),'favoravel');
 assert.equal(cardTone('dúbias'),'dubia');
 assert.equal(cardTone('não informada'),'desconhecida');
});
test('Cada posição do D60 e dos três D20 mapeia para uma carta distinta',()=>{
 for(const kind of ['todas','favoravel','dubia','ruim']){
  const pool=cardsForDraw(deck,kind);
  const names=new Set();
  for(let pos=1;pos<=pool.length;pos++){
   const result=cardAtRoll(deck,kind,pos);
   assert.equal(result.count,pool.length);
   names.add(result.card.name);
   if(kind!=='todas')assert.equal(result.tone,kind);
  }
  assert.equal(names.size,pool.length);
 }
});
test('Sorteio falha corretamente para índices inválidos',()=>{
 assert.throws(()=>cardAtRoll(deck,'favoravel',0),RangeError);
 assert.throws(()=>cardAtRoll(deck,'todas',61),RangeError);
 assert.throws(()=>cardsForDraw(deck,'inventado'),/inválida/);
});
test('Leitura do catálogo pode ocorrer sem compêndio',async()=>{
 const cards=await loadCardDeck({getPack:()=>null,fetchData:async()=>({ok:true,json:async()=>deck})});
 assert.equal(cards.length,60);
});
test('Cartas coloridas e sorteio são disponíveis na ficha e no chat',()=>{
 const h=fs.readFileSync(new URL('../templates/actor.hbs',import.meta.url),'utf8');
 const sheet=fs.readFileSync(new URL('../module/sheets.mjs',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../styles/plutofagia.css',import.meta.url),'utf8');
 const inventory=fs.readFileSync(new URL('../module/inventory-ui.mjs',import.meta.url),'utf8');
 assert.match(h,/data-action="card-draw"/);
 assert.match(h,/data-pluto-card-choice/);
 assert.match(h,/data-pluto-card-keep/);
 assert.match(h,/data-card-tone="{{cardTone}}"/);
 assert.match(sheet,/new Roll\('1d'\+pool.length\)/);
 assert.match(sheet,/roll.toMessage\(/);
 assert.match(inventory,/article.dataset.cardTone=tone/);
 for(const kind of ['favoravel','dubia','ruim'])assert.match(css,new RegExp('data-card-tone="'+kind+'"'));
});
