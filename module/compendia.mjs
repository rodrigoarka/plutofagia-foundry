/** Quatro compêndios mundiais nativos no Foundry 13, sem dependência de compilador. */
export const COLLECTIONS = Object.freeze({
  armas:{name:'plutofagia-armas',label:'PLUTOFAGIA | Arsenal',types:['arma']},
  tecnicas:{name:'plutofagia-tecnicas',label:'PLUTOFAGIA | Técnicas dos Ofícios',types:['tecnica']},
  cartas:{name:'plutofagia-cartas',label:'PLUTOFAGIA | Cartas de Condição',types:['carta']},
  equipamentos:{name:'plutofagia-equipamentos',label:'PLUTOFAGIA | Equipamentos e Proteções',types:['protecao','consumivel','equipamento']}
});
const idOf = def => `world.${def.name}`;
export function getPlutoPack(key){
 const def=COLLECTIONS[key];return def ? game.packs.get(idOf(def)) : null;
}
export async function seedPlutoCompendia({fetchData=fetch}={}){
 if(!game.user?.isGM) return {skipped:true,reason:'Somente GM pode criar compêndios'};
 const collectionClass=foundry.documents.collections.CompendiumCollection;
 const [baseCards, baseItems]=await Promise.all([
  fetchData('systems/plutofagia/assets/cartas.json').then(r=>{if(!r.ok)throw new Error('Cartas não carregadas');return r.json();}),
  fetchData('systems/plutofagia/assets/catalog.json').then(r=>{if(!r.ok)throw new Error('Catálogo não carregado');return r.json();})
 ]);
 const sources=[...baseItems,...baseCards];
 const summary={};
 for(const [key,def] of Object.entries(COLLECTIONS)){
  let pack=getPlutoPack(key);
  if(!pack){
   pack=await collectionClass.createCompendium({name:def.name,label:def.label,type:'Item',package:'world',system:'plutofagia',ownership:{PLAYER:'OBSERVER',TRUSTED:'OBSERVER',ASSISTANT:'OWNER',GAMEMASTER:'OWNER'}});
  }
  await pack.getIndex();
  const existing=new Set(Array.from(pack.index).map(e=>e.name));
  const fresh=sources.filter(e=>def.types.includes(e.type)&&!existing.has(e.name));
  if(fresh.length){
   if(pack.locked)await pack.configure({locked:false});
   const cleaned=fresh.map(e=>{const v=foundry.utils.deepClone(e);delete v._id;return v;});
   await Item.createDocuments(cleaned,{pack:pack.collection});
  }
  summary[key]={added:fresh.length,total:existing.size+fresh.length,pack:pack.collection};
 }
 return summary;
}
/** Técnica inicial: importação de um compêndio, sem exigir prévia cópia no catálogo do mundo. */
export async function initialOfficeTechnique(office){
 if(!office)return null;
 const pack=getPlutoPack('tecnicas');
 if(pack){
  const index=await pack.getIndex({fields:['system.officio','system.level']});
  const match=Array.from(index).find(e=>e.system?.officio===office && e.system?.level==='inicial');
  if(match)return pack.getDocument(match._id);
  // Índices sem system.level: consulta completa como fallback (apenas no momento de escolha).
  const docs=await pack.getDocuments();
  const doc=docs.find(e=>e.system.officio===office&&e.system.level==='inicial');
  if(doc)return doc;
 }
 return game.items?.find(i=>i.type==='tecnica'&&i.system.officio===office&&i.system.level==='inicial')??null;
}
