/** Atualização de listas com DOM nativo: preserva formulário, aba ativa, foco e rolagem. */
const descriptions={
 ataques:i=>`${i.system.damage} · alcance ${i.system.range} · ${i.system.properties||''}`,
 armas:i=>`${i.system.damage} · alcance ${i.system.range} · ${i.system.properties||''}`,
 protecoes:i=>`${i.system.region} · proteção ${i.system.armor}`,
 consumiveis:i=>`Quantidade ${i.system.quantity} · ${i.system.description||''}`,
 equipamentos:i=>`${i.system.slots} espaço(s) · ${i.system.description||''}`,
 tecnicas:i=>i.system.description||i.system.effect||'Técnica do Ofício',
 cartas:i=>`${i.system.category||''} · ${i.system.activation||''} · ${i.system.effect||''}`
};
const types={ataques:'arma',armas:'arma',protecoes:'protecao',consumiveis:'consumivel',equipamentos:'equipamento',tecnicas:'tecnica',cartas:'carta'};
function actionButton(name,action,id){const b=document.createElement('button');b.type='button';b.dataset.action=action;b.dataset.id=id;b.textContent=name;return b;}
export function patchItemLists(root,items){
 if(!root)return 0;
 let count=0;
 for(const [key,kind] of Object.entries(types)){
  const host=root.querySelector(`[data-pluto-collection="${key}"]`);
  if(!host)continue;
  const fragment=document.createDocumentFragment();
  const entries=Array.from(items).filter(i=>i.type===kind);
  for(const entry of entries){
   const article=document.createElement('article');article.className='pluto-item-row';
   if(key==='cartas'){
    article.className='pluto-card-entry';
    article.dataset.plutoCard=entry.id;
    const img=document.createElement('img');img.className='pluto-card-icon';img.alt='';img.loading='lazy';
    img.src=entry.img||'icons/svg/book.svg';article.append(img);
    const copy=document.createElement('div');copy.className='pluto-card-copy';
    const n=document.createElement('strong');n.textContent=entry.name;
    const body=document.createElement('small');body.textContent=entry.system.effect||entry.system.description||'';
    copy.append(n,body);article.append(copy);
    const actions=document.createElement('div');actions.className='pluto-card-actions';
    actions.append(actionButton('Mostrar','card-use',entry.id),actionButton('Editar','item-sheet',entry.id),actionButton('×','item-remove',entry.id));
    article.append(actions);fragment.append(article);continue;
   }
   const title=document.createElement('b');title.textContent=entry.name;article.append(title);
   const desc=document.createElement('span');desc.textContent=descriptions[key](entry);article.append(desc);
   if(key==='armas'||key==='ataques'){
    article.append(actionButton('Atacar','weapon',entry.id));
    if(entry.getFlag?.('plutofagia','needsReload'))article.append(actionButton('Recarga','reload',entry.id));
   }
   if(key==='tecnicas')article.append(actionButton('Usar','skill-use',entry.id));
   if(key==='cartas')article.append(actionButton('Mostrar','card-use',entry.id));
   article.append(actionButton('Editar','item-sheet',entry.id));
   if(key!=='ataques')article.append(actionButton('×','item-remove',entry.id));
   fragment.append(article);
  }
  if(!entries.length){
   const empty=document.createElement('p');empty.className='pluto-empty-collection';
   empty.textContent='Arraste um registro do compêndio para cá.';fragment.append(empty);
  }
  host.replaceChildren(fragment);count++;
  if(key==='cartas'){const label=root.querySelector('[data-pluto-card-count]');if(label)label.textContent=entries.length+' carta(s) · clique para expandir ou recolher';}
 }
 return count;
}
export function preserveSheetState(root){
 const scroll=root?.querySelector('.pluto-scroll');
 return {tab:root?.querySelector('[data-page].active')?.dataset.page||'pessoa',scrollTop:scroll?.scrollTop??0,cardsOpen:root?.querySelector('[data-pluto-cards-panel]')?.open??true};
}
export function restoreSheetState(root,state){
 if(!root || !state)return;
 for(const p of root.querySelectorAll('[data-tab-panel]'))p.hidden=p.dataset.tabPanel!==state.tab;
 for(const b of root.querySelectorAll('[data-page]'))b.classList.toggle('active',b.dataset.page===state.tab);
 const panel=root.querySelector('[data-pluto-cards-panel]');if(panel)panel.open=state.cardsOpen!==false;
 const sc=root.querySelector('.pluto-scroll');if(sc)sc.scrollTop=state.scrollTop;
}
