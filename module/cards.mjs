/**
 * Cartas de Condição — classificação canônica do Livro do Sindicato.
 * Mantém as 60 entradas originais; os tipos controlam apresentação e sorteio.
 */
export const CARD_TONES=Object.freeze({
 favoravel:Object.freeze({label:'Favorável',name:'Favoráveis',css:'favoravel'}),
 dubia:Object.freeze({label:'Dúbia',name:'Dúbias',css:'dubia'}),
 ruim:Object.freeze({label:'Ruim',name:'Ruins',css:'ruim'})
});
export function cardTone(category){
 const val=String(category??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 if(val.includes('desfavor')||val==='ruim'||val==='ruins'||val==='negativa'||val==='negativo')return 'ruim';
 if(val.includes('favor')||val==='boa'||val==='positiva'||val==='positivo')return 'favoravel';
 if(val.includes('dubi')||val.includes('ambig')||val==='amarela')return 'dubia';
 return 'desconhecida';
}
export function cardsForDraw(cards,choice='todas'){
 const category=['todas','favoravel','dubia','ruim'].includes(choice)?choice:null;
 if(!category)throw new Error('Categoria de sorteio inválida.');
 const entries=Array.from(cards).filter(c=>c?.type==='carta');
 const filtered=category==='todas'?entries:entries.filter(c=>cardTone(c.system?.category??c.flags?.plutofagia?.cardType)===category);
 return filtered.sort((a,b)=>Number(a.flags?.plutofagia?.cardNumber??0)-Number(b.flags?.plutofagia?.cardNumber??0));
}
export function cardAtRoll(cards,choice,total){
 const pool=cardsForDraw(cards,choice);
 if(!pool.length)throw new Error('Nenhuma carta disponível na categoria selecionada.');
 if(!Number.isInteger(total)||total<1||total>pool.length)throw new RangeError('Resultado de sorteio inválido.');
 return {card:pool[total-1],count:pool.length,tone:cardTone(pool[total-1].system?.category)};
}
export async function loadCardDeck({getPack,fetchData=fetch}={}){
 const pack=getPack?.();
 if(pack){
  try{
   const docs=(await pack.getDocuments()).filter(doc=>doc.type==='carta');
   const nums=docs.map(doc=>Number(doc.flags?.plutofagia?.cardNumber));
   if(docs.length===60&&new Set(nums).size===60&&nums.every(n=>Number.isInteger(n)&&n>=1&&n<=60))return docs;
  }catch(err){console.warn('[Plutofagia] Compêndio de cartas indisponível, usando catálogo do sistema.',err);}
 }
 const response=await fetchData('systems/plutofagia/assets/cartas.json');
 if(!response.ok)throw new Error('Não foi possível abrir as 60 cartas do catálogo.');
 const deck=await response.json();
 if(deck.length!==60)throw new Error('O catálogo não contém exatamente 60 cartas.');
 return deck;
}
