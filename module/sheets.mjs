import {ATTRS,SKILLS,OFFICES,REGION_KEYS,REGION_NAME,SIZE,ANATOMY,FACTIONS,clamp,absent,escapeHTML} from './config.mjs';
import {rollPool,rollExploding,executeAttack,executeSkill,executeHeal,GRID,combatStatus,organizeAlternation,moveFacing,reaction,spendAction,resetAction} from './rules.mjs';
const {HandlebarsApplicationMixin}=foundry.applications.api;
const {ActorSheetV2,ItemSheetV2}=foundry.applications.sheets;
const warning=m=>ui.notifications.warn(m);
const numOrString=(el)=>el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;
function buildAttrRows(actor){return Object.entries(ATTRS).map(([key,label])=>({key,label,value:actor.system.attributes[key],pips:[1,2,3,4,5].map(v=>({n:v,on:actor.system.attributes[key]>=v,disabled:v===5 && actor.system.xp===0}))}));}
function buildRegionRows(actor){return REGION_KEYS.map(key=>{const h=actor.system.regions[key];return {key,label:REGION_NAME[key],value:h.value,max:h.max,armor:h.armor,missing:absent(key,actor.system.anatomy)};});}
const itemList=(actor,type)=>actor.items.filter(i=>i.type===type).map(i=>({id:i.id,name:i.name,img:i.img,damage:i.system.damage,range:i.system.range,slots:i.system.slots,properties:i.system.properties,cost:i.system.cost,description:i.system.description,quantity:i.system.quantity,armor:i.system.armor,region:i.system.region,flags:i.flags.plutofagia||{}}));
export class PlutoActorSheet extends HandlebarsApplicationMixin(ActorSheetV2){
 static DEFAULT_OPTIONS={
  classes:['plutofagia','pluto-actor'],window:{title:'O Caderno do Operário',resizable:true},
  position:{width:940,height:760},form:{closeOnSubmit:false,submitOnChange:false}
 };
 static PARTS={body:{template:'systems/plutofagia/templates/actor.hbs',classes:['pluto-scroll']}};
 async _prepareContext(options){
  const context=await super._prepareContext(options),actor=this.actor,sys=actor.system;
  const sum=Object.values(sys.attributes??{}).reduce((s,n)=>s+(Number(n)||0),0);
  const trained=Object.values(sys.skills??{}).filter(Boolean).length;
  return {...context,actor,sys,attrs:buildAttrRows(actor),skills:Object.entries(SKILLS).map(([key,label])=>({key,label,trained:sys.skills[key]})),
  regions:buildRegionRows(actor),oficios:OFFICES.map(s=>({value:s,label:s,selected:sys.office===s})),
  sizes:Object.entries(SIZE).map(([value,label])=>({value,label,selected:sys.size===value})),
  anatomyOptions:Object.entries(ANATOMY).map(([value,label])=>({value,label,selected:sys.anatomy===value})),
  factions:Object.entries(FACTIONS).map(([value,label])=>({value,label,selected:sys.faction===value})),
  aPoints:sum,aRemaining:12-sum,trained,remainingSkills:3-trained,
  area:sys.defense.value,move:sys.movement.value,status:combatStatus(actor),
  weapons:itemList(actor,'arma'),protections:itemList(actor,'protecao'),techniques:itemList(actor,'tecnica'),
  consumables:itemList(actor,'consumivel'),equipment:itemList(actor,'equipamento'),
  canEdit:this.isEditable,gm:game.user.isGM,
  tabs:[{id:'pessoa',label:'Pessoa'},{id:'combate',label:'Combate'},{id:'bagagem',label:'Bagagem'},{id:'revolucao',label:'Revolução'}]};
 }
 async _onRender(context,options){
  await super._onRender(context,options);
  const el=this.element;
  el.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{
   for(const t of el.querySelectorAll('[data-tab-panel]'))t.hidden=t.dataset.tabPanel!==button.dataset.page;
   for(const b of el.querySelectorAll('[data-page]'))b.classList.toggle('active',b===button);
  }));
  el.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',(event)=>this._act(event,button).catch(err=>{console.error(err);warning(err.message)})));
  el.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('change',(event)=>this._change(event,input).catch(err=>{console.error(err);warning(err.message)})));
 }
 async _change(_event,input){
  if(!this.actor.isOwner)return;
  const path=input.dataset.field;
  if(!path)return;
  const value=numOrString(input);
  if(path==='system.anatomy'){await this.actor.changeAnatomy(value);return;}
  if(path==='system.attributes.resistencia'){await this.actor.changeResistance(value);return;}
  if(path.startsWith('system.attributes.')){
    const old=this.actor.system.attributes[path.split('.').pop()];
    const n=Number(value);
    if(n>5||n<1)return;
    const sum=Object.values(this.actor.system.attributes).reduce((s,v)=>s+Number(v||0),0);
    if(n>old && sum+n-old>12 && this.actor.system.xp===0){warning('Criação: exatamente 12 pontos, 1–4 por atributo.');this.render();return;}
  }
  if(path.startsWith('system.skills.')&&value){
   const count=Object.values(this.actor.system.skills).filter(Boolean).length;
   if(count>=3&&this.actor.system.xp===0){warning('Na criação selecione 3 perícias.');this.render();return;}
  }
  await this.actor.update({[path]:value});
  if(path==='system.office'&&value){
    const seed=game.items.find(i=>i.type==='tecnica'&&i.system.officio===value&&i.system.level==='inicial');
    const obsolete=this.actor.items.filter(i=>i.type==='tecnica'&&i.system.level==='inicial'&&i.system.officio!==value);
    if(obsolete.length)await this.actor.deleteEmbeddedDocuments('Item',obsolete.map(i=>i.id));
    if(seed&&!this.actor.items.some(i=>i.type==='tecnica'&&i.name===seed.name)){
      const data=seed.toObject();delete data._id;await this.actor.createEmbeddedDocuments('Item',[data]);
    }
  }
  if(path.startsWith('system.conditions.') && ['suprimido','contido','refem'].includes(path.split('.').pop())){
    await this.actor.toggleStatusEffect('pluto-'+path.split('.').pop(),{active:value});
  }
 }
 async _act(event,button){
  event.preventDefault();
  const action=button.dataset.action,actor=this.actor;
  const c=game.combat;
  const selected=Array.from(game.user.targets??[])[0]??canvas.tokens?.controlled?.[0];
  if(action==='pip'){
   const key=button.dataset.attr,amount=Number(button.dataset.value),old=actor.system.attributes[key];
   if(!ATTRS[key]||!actor.isOwner)return;
   const sum=Object.values(actor.system.attributes).reduce((s,v)=>s+Number(v),0);
   if(amount===5&&actor.system.xp===0){warning('O atributo 5 exige evolução; registre XP antes de elevar.');return;}
   if(amount>4&&actor.system.xp===0){warning('Máximo 4 na criação.');return;}
   if(amount>old&&sum+amount-old>12&&actor.system.xp===0){warning('Criação utiliza exatamente 12 pontos.');return;}
   if(key==='resistencia')await actor.changeResistance(amount);else await actor.update({[`system.attributes.${key}`]:amount});return;
  }
  if(action==='roll'){
   await executeSkill(actor,button.dataset.attr||'tecnica',button.dataset.skill||'',Number(button.dataset.diff||7),Number(button.dataset.bonus||0));return;
  }
  if(action==='roll-selected'){
   const a=this.element.querySelector('[data-roll-attribute]')?.value||'tecnica',s=this.element.querySelector('[data-roll-skill]')?.value||'',
   diff=Number(this.element.querySelector('[data-roll-diff]')?.value||7),bonus=Number(this.element.querySelector('[data-roll-bonus]')?.value||0);
   await executeSkill(actor,a,s,diff,bonus);return;
  }
  if(action==='weapon'){
   const id=button.dataset.id,item=id==='unarmed'?{name:'Ataque desarmado',system:{damage:'1d10-3',range:1,skill:'',attribute:'brutalidade'}}:actor.items.get(id);
   if(!item)return;
   if(id!=='unarmed'&&item.getFlag?.('plutofagia','needsReload')){warning('Recarga pendente: use a ação Recarregar.');return;}
   const region=this.element.querySelector('[data-attack-region]')?.value||'torso';
   const cover=Number(this.element.querySelector('[data-cover]')?.value||0);
   const extra=Number(this.element.querySelector('[data-attack-bonus]')?.value||0);
   await executeAttack(actor,item,{region,cover,extra});return;
  }
  if(action==='reload'){
   const item=actor.items.get(button.dataset.id);if(!item)return;
   if(!await spendAction(actor,{cost:1}))return;
   await item.unsetFlag('plutofagia','needsReload');ui.notifications.info(`${item.name}: recarga concluída.`);return;
  }
  if(action==='heal'){
   const region=this.element.querySelector('[data-heal-region]')?.value||'torso';
   await executeHeal(actor,selected,region,true);return;
  }
  if(action==='item-sheet'){actor.items.get(button.dataset.id)?.sheet?.render(true);return;}
  if(action==='item-remove'){if(!actor.isOwner)return;await actor.deleteEmbeddedDocuments('Item',[button.dataset.id]);return;}
  if(action==='item-create'){
   if(!actor.isOwner)return;
   const type=button.dataset.kind||'equipamento';
   await actor.createEmbeddedDocuments('Item',[{name:'Novo registro',type,img:'icons/svg/item-bag.svg'}]);return;
  }
  if(action==='catalog'){
   const items=game.items.filter(i=>i.getFlag('plutofagia','catalogItem'));
   if(!items.length){warning('O catálogo ainda não foi carregado pelo GM.');return;}
   const rows=items.map(i=>`<option value="${i.id}">${escapeHTML(i.name)} [${i.type}]</option>`).join('');
   const result=await foundry.applications.api.DialogV2.prompt({window:{title:'Catálogo coletivo'},content:`<label>Escolha um item do catálogo:<select name="item">${rows}</select></label>`,ok:{label:'Adicionar à ficha',callback:(event,button,dialog)=>dialog.element.querySelector('select[name=item]')?.value}});
   if(result){
     const entry=game.items.get(result);
     if(entry){
       if(entry.type==='tecnica'){
         const price=entry.system.level==='basica'?6:entry.system.level==='avancada'?9:0;
         if(entry.system.officio && entry.system.officio!==actor.system.office){warning('Esta técnica pertence a outro Ofício.');return;}
         if(entry.system.level==='avancada'&&actor.items.filter(i=>i.type==='tecnica'&&i.system.level==='basica').length<2){warning('É necessário possuir duas técnicas básicas antes de comprar uma avançada.');return;}
         if(actor.items.some(i=>i.name===entry.name&&i.type==='tecnica')){warning('Esta técnica já está na ficha.');return;}
         if(price>actor.system.xp){warning(`XP insuficiente: ${price} XP necessários.`);return;}
         const data=entry.toObject();delete data._id;
         await actor.createEmbeddedDocuments('Item',[data]);
         if(price>0)await actor.update({'system.xp':actor.system.xp-price,'system.xpSpent':actor.system.xpSpent+price});
       }else{
         const data=entry.toObject();delete data._id;await actor.createEmbeddedDocuments('Item',[data]);
       }
     }
   }return;
  }
  if(action==='prepare-combat'){await organizeAlternation();return;}
  if(action==='area-template'){
    const t=canvas.tokens?.controlled?.find(t=>t.actor?.id===actor.id);
    if(!t){warning('Selecione o token no mapa para marcar a área.');return;}
    await canvas.scene.createEmbeddedDocuments('MeasuredTemplate',[{t:'circle',x:t.center.x,y:t.center.y,distance:1,fillColor:'#9b2428',borderColor:'#3a1616',flags:{plutofagia:{nature:'zona-de-efeito'}}}]);
    return;
  }
  if(action==='bonus-action'){
    const cb=c?.combatants?.find(e=>e.actor?.id===actor.id);
    if(!cb){warning('Use em combate, durante seu turno.');return;}
    const state=cb.getFlag('plutofagia','turn')??{};
    await cb.setFlag('plutofagia','turn',{...state,max:3});this.render();return;
  }
  if(action==='take-hostage'){
    const myToken=canvas.tokens?.controlled?.find(t=>t.actor?.id===actor.id);
    const hostage=Array.from(game.user.targets??[])[0];
    if(!myToken || !hostage || !hostage.actor){warning('Selecione seu token e marque um alvo adjacente.');return;}
    if(GRID.distance(myToken,hostage)>1){warning('Conter exige adjacência no grid.');return;}
    if(!await spendAction(actor,{cost:1,attack:true}))return;
    const attacker=await rollPool(actor,'brutalidade','',0,1);
    const defender=await rollPool(hostage.actor,'agilidade','',0,1);
    const success=attacker.highest>defender.highest;
    await ChatMessage.create({content:`<div class="pluto-chat"><b>${escapeHTML(actor.name)}</b> tenta conter <b>${escapeHTML(hostage.actor.name)}</b>: ${success?'SUCESSO':'RESISTIU'}.<p>${attacker.highest} × ${defender.highest}. Empate favorece defensor.</p><small>Manter custa 1 ação/turno; não é permitido atacar enquanto mantém o refém.</small></div>`});
    if(success){if(game.user.isGM||hostage.actor.isOwner){await hostage.actor.update({'system.conditions.refem':true});await hostage.actor.toggleStatusEffect('pluto-refem',{active:true});}else warning('Solicite ao GM que marque o estado Refém no alvo.');}
    return;
  }
  if(action==='escape-hostage'){
    const captor=Array.from(game.user.targets??[])[0];
    if(!captor?.actor){warning('Marque o captor como alvo.');return;}
    if(!await spendAction(actor,{cost:1}))return;
    const atk=await rollPool(actor,'agilidade','',0,1),def=await rollPool(captor.actor,'brutalidade','',0,1);
    const success=atk.highest>def.highest;
    await ChatMessage.create({content:`<div class="pluto-chat">Tentativa de fuga: <b>${success?'LIVRE':'MANTIDO'}</b> (${atk.highest} × ${def.highest}).</div>`});
    if(success){await actor.update({'system.conditions.refem':false});await actor.toggleStatusEffect('pluto-refem',{active:false});}
    return;
  }
  if(action==='reaction'){await reaction(actor,button.dataset.attr||'brutalidade','',Number(button.dataset.diff||7));return;}
  if(action==='spend'){await spendAction(actor,{cost:Number(button.dataset.cost||1)});this.render();return;}
  if(action==='guard'){if(await spendAction(actor,{cost:1}))await ChatMessage.create({content:`<div class="pluto-chat">${escapeHTML(actor.name)} assume <b>Guardar posição</b>: reduz 4 do próximo dano (antes do turno seguinte). Marcar consumo manual.</div>`});return;}
  if(action==='rotate'){await moveFacing(actor,Number(button.dataset.degrees||90));return;}
  if(action==='actions-reset'){
   const cb=c?.combatants?.find(e=>e.actor?.id===actor.id);if(cb){await resetAction(cb);this.render();}return;
  }
  if(action==='skill-use'){
   const item=actor.items.get(button.dataset.id);if(!item)return;
   const spent=await spendAction(actor,{cost:Number(item.system.cost||1)});if(!spent)return;
   await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:`<div class="pluto-chat"><b>${escapeHTML(actor.name)}</b> usa <b>${escapeHTML(item.name)}</b><p>${escapeHTML(item.system.effect||item.system.description)}</p><small>Aplicação conforme a descrição; ações e limites exclusivos continuam valendo.</small></div>`});return;
  }
 }
 async _onDrop(event){
  if(!this.actor.isOwner)return super._onDrop(event);
  try{
   const data=TextEditor.getDragEventData(event);
   if(data.type==='Item'){
     const item=await fromUuid(data.uuid);
     if(item&&item.documentName==='Item'){
       await this.actor.createEmbeddedDocuments('Item',[item.toObject()]);return;
     }
   }
  }catch(e){console.warn('Plutofagia drag-drop',e)}
  return super._onDrop(event);
 }
}
export class PlutoItemSheet extends HandlebarsApplicationMixin(ItemSheetV2){
 static DEFAULT_OPTIONS={classes:['plutofagia','pluto-item'],window:{title:'Registro de Arsenal e Ofício',resizable:true},position:{width:560,height:650},form:{closeOnSubmit:false,submitOnChange:false}};
 static PARTS={body:{template:'systems/plutofagia/templates/item.hbs'}};
 async _prepareContext(opts){const c=await super._prepareContext(opts);return {...c,item:this.item,sys:this.item.system,kind:this.item.type,regions:Object.entries(REGION_NAME).map(([key,label])=>({key,label,selected:this.item.system.region===key})),attrOptions:Object.entries(ATTRS).map(([key,label])=>({key,label,selected:this.item.system.attribute===key})),skillOptions:[{key:'',label:'— Sem perícia —'}].concat(Object.entries(SKILLS).map(([key,label])=>({key,label,selected:this.item.system.skill===key}))),editable:this.isEditable,isWeapon:this.item.type==='arma',isArmor:this.item.type==='protecao',isTechnique:this.item.type==='tecnica'};}
 async _onRender(context,opts){await super._onRender(context,opts);this.element.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('change',async()=>{if(!this.item.isOwner)return;let value=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;await this.item.update({[el.dataset.field]:value});}));}
}

export class PlutoCommunitySheet extends HandlebarsApplicationMixin(ActorSheetV2){
 static DEFAULT_OPTIONS={classes:['plutofagia','pluto-community'],window:{title:'Livro do Bairro',resizable:true},position:{width:660,height:640},form:{closeOnSubmit:false,submitOnChange:false}};
 static PARTS={body:{template:'systems/plutofagia/templates/community.hbs'}};
 async _prepareContext(opts){const ctx=await super._prepareContext(opts);return {...ctx,actor:this.actor,sys:this.actor.system};}
 async _onRender(ctx,opts){await super._onRender(ctx,opts);this.element.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('change',async()=>{if(!this.actor.isOwner)return;const v=el.type==='number'?Number(el.value):el.value;await this.actor.update({[el.dataset.field]:v});}));}
}
