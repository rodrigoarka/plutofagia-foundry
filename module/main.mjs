import {PlutoActorModel,PlutoCommunityModel,PlutoItemModel} from './models.mjs';
import {PlutoActor,PlutoItem} from './actor.mjs';
import {PlutoActorSheet,PlutoItemSheet,PlutoCommunitySheet} from './sheets.mjs';
import {ATTRS,SKILLS,ITEMS_PATH,REGION_KEYS} from './config.mjs';
import {organizeAlternation,chatApplyButton,rollPool,rollExploding,GRID} from './rules.mjs';
Hooks.once('init',()=>{
 CONFIG.Actor.documentClass=PlutoActor;
 CONFIG.Item.documentClass=PlutoItem;
 CONFIG.Actor.dataModels={operario:PlutoActorModel,npc:PlutoActorModel,comunidade:PlutoCommunityModel};
 CONFIG.Item.dataModels={arma:PlutoItemModel,protecao:PlutoItemModel,tecnica:PlutoItemModel,consumivel:PlutoItemModel,equipamento:PlutoItemModel};
 CONFIG.Actor.trackableAttributes={operario:{bar:['regions.torso','resources.pr'],value:['regions.cabeca.value','movement.value','defense.value']},npc:{bar:['regions.torso','resources.pr'],value:['regions.cabeca.value','movement.value','defense.value']},comunidade:{bar:[],value:['apoio','pressao','estrutura']}};
 const sheetConfig=foundry.applications.apps.DocumentSheetConfig;
 // Em Foundry V13, preserve o receiver `DocumentSheetConfig` da API estática.
 sheetConfig.registerSheet(foundry.documents.Actor,game.system.id,PlutoActorSheet,{types:['operario','npc'],makeDefault:true,label:'Ficha do Sindicato'});
 sheetConfig.registerSheet(foundry.documents.Actor,game.system.id,PlutoCommunitySheet,{types:['comunidade'],makeDefault:true,label:'Ficha do Bairro'});
 sheetConfig.registerSheet(foundry.documents.Item,game.system.id,PlutoItemSheet,{types:['arma','protecao','tecnica','consumivel','equipamento'],makeDefault:true,label:'Ficha de Inventário'});
 console.info('[PLUTOFAGIA] Fichas V13 registradas: operário, NPC, comunidade e itens.');
 game.settings.register('plutofagia','catalogSeeded',{name:'Catálogo importado',hint:'Importar itens básicos apenas uma vez no mundo.',scope:'world',config:false,type:Boolean,default:false});
 game.settings.register('plutofagia','showMoveHints',{name:'Avisar deslocamento acima do máximo',hint:'Avisos opcionais sobre deslocamento de tokens em combate. Não bloqueia os movimentos.',scope:'world',config:true,type:Boolean,default:true});
 game.settings.register('plutofagia','initiativeMode',{name:'Iniciativa de combate',hint:'Use o botão na ficha para distribuir turnos alternados entre facções.',scope:'world',config:true,type:String,choices:{alternada:'Alternada por facção (manual)',nativa:'Nativa do Foundry'},default:'alternada'});
 CONFIG.statusEffects=[...CONFIG.statusEffects,...[
   {id:'pluto-suprimido',name:'Suprimido',img:'icons/svg/daze.svg'},
   {id:'pluto-contido',name:'Contido',img:'icons/svg/net.svg'},
   {id:'pluto-refem',name:'Refém',img:'icons/svg/target.svg'}
 ]];
});
Hooks.once('ready',async()=>{
  game.plutofagia={versao:'0.9.0',organizarCombate:organizeAlternation,rolarTeste:rollPool,rolarDano:rollExploding,grid:GRID};
  document.addEventListener('click',chatApplyButton);
  if(game.user.isGM&&!game.settings.get('plutofagia','catalogSeeded')){
    try{
      const reply=await fetch(ITEMS_PATH);
      if(!reply.ok)throw new Error(`Falha no arquivo ${ITEMS_PATH}`);
      const entries=await reply.json();
      const existing=new Set(game.items.filter(i=>i.getFlag('plutofagia','catalogItem')).map(i=>i.name));
      const fresh=entries.filter(i=>!existing.has(i.name));
      if(fresh.length)await Item.createDocuments(fresh);
      await game.settings.set('plutofagia','catalogSeeded',true);
      ui.notifications.info(`O Sindicato registrou ${fresh.length} novos itens no catálogo mundial.`);
    }catch(e){console.error('Importação do catálogo Plutofagia',e);ui.notifications.error('Não foi possível carregar o catálogo inicial. Veja o console do navegador.');}
  }
});
Hooks.on('preUpdateToken',(document,update,options,userId)=>{
  if(!game.settings?.get('plutofagia','showMoveHints'))return;
  if(game.user?.id!==userId || !game.combat?.started)return;
  if(update.x===undefined && update.y===undefined)return;
  const actor=document.actor;
  if(!actor || !['operario','npc'].includes(actor.type))return;
  const size=document.parent?.grid?.size||100;
  const tiles=Math.max(Math.abs((update.x??document.x)-document.x),Math.abs((update.y??document.y)-document.y))/size;
  const max=actor.system.movement?.value||2;
  if(tiles>max+0.01)ui.notifications.warn(`${actor.name}: movimento de ${tiles.toFixed(1)} quadrados ultrapassa ${max}; confirme ação, movimentações gratuitas e terreno com o narrador.`);
});
Hooks.on('createActor',async(actor)=>{
 if(!game.user.isGM||!['operario','npc'].includes(actor.type))return;
 // Tokens sempre ocupam uma célula, inclusive personagens grandes, para preservar a simplicidade do grid.
 const u={};if(actor.prototypeToken?.width!==1 || actor.prototypeToken?.height!==1){u['prototypeToken.width']=1;u['prototypeToken.height']=1;}
 if(actor.type==='npc'&&actor.system.faction==='sindicato'){u['system.faction']='corporacao';u['prototypeToken.disposition']=-1;}
 if(Object.keys(u).length)await actor.update(u);
});
