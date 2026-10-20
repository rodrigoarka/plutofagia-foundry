import {diceTape,explosionStamps} from './chat-ui.mjs';
import {ATTRS,SKILLS,REGION_KEYS,REGION_NAME,DMG_AREA,OFFICES,escapeHTML,clamp,absent,SIZE} from './config.mjs';
const speaker=a=>ChatMessage.getSpeaker({actor:a});
const notify=(s)=>ui.notifications?.warn(s);
const active=(a)=>{const c=game.combat;if(!c?.started)return null;return c.combatants.find(x=>x.actor?.id===a.id&&x.id===c.combatant?.id)||null;};
const tx=(actor,opts={})=>opts.token??canvas.tokens?.controlled?.find(t=>t.actor?.id===actor.id)??actor.getActiveTokens?.()[0]??null;
export const GRID = {
 distance(a,b){const p=a?.center,q=b?.center;if(!p||!q)return null;const n=canvas.scene?.grid?.size??100;return Math.ceil(Math.max(Math.abs(p.x-q.x),Math.abs(p.y-q.y))/n-0.0001);},
 position(attacker,target){
   const a=attacker?.center,t=target?.center;if(!a||!t)return 'frente';
   const angle=((target.document.rotation??0)*Math.PI/180);
   const dx=a.x-t.x,dy=a.y-t.y;
   const y=dy*Math.cos(angle)-dx*Math.sin(angle);
   // Frente do token = acima em ângulo 0°, girando com o token.
   const x=dx*Math.cos(angle)+dy*Math.sin(angle);
   if(y>Math.abs(x)*0.38)return 'costas';
   if(y< -Math.abs(x)*0.38)return 'frente';
   return 'flanco';
 },
 tokens(actor){return tx(actor);}
};
export async function rollPool(actor,attr,skill='',modifier=0,difficulty=7,opts={}){
  if(!ATTRS[attr])throw new Error('Atributo desconhecido');
  const die=Number(actor.system.attributes[attr])||1;
  const trained=SKILLS[skill]&&actor.system.skills[skill]?1:0;
  const wanted=Math.max(1,die+trained+Number(modifier||0));
  const count=Math.min(6,wanted);
  const roll=await(new Roll(`${count}d10`)).evaluate();
  const term=roll.dice.find(d=>d.faces===10);
  const values=(term?.results||[]).filter(d=>d.active).map(d=>d.result);
  const highest=Math.max(...values);
  let top=highest,rerollValue=null,replaceIndex=null;
  if(wanted>6){
   replaceIndex=values.findIndex(v=>v!==highest);
   if(replaceIndex>=0){
    const reroll=await(new Roll('1d10')).evaluate();
    rerollValue=reroll.total;
    top=Math.max(top,rerollValue);
   }
  }
  const success=top>=difficulty;
  const flavor=`${ATTRS[attr]}${trained?' + '+SKILLS[skill]:''}${modifier?` (${modifier>0?'+':''}${modifier}D10)`:''} · dificuldade ${difficulty}`;
  const note=replaceIndex!==null&&rerollValue!==null?`<p>Excesso de 6D10: substituição do dado ${values[replaceIndex]} por ${rerollValue}; maior mantido.</p>`:'';
  const shown=diceTape(values,'DADOS DO TESTE')+(rerollValue!==null?diceTape([rerollValue],'DADO EXCEDENTE'):'');
  await roll.toMessage({speaker:speaker(actor),flavor,content:`<section class="pluto-chat" data-pluto-chat="teste"><b>${escapeHTML(actor.name)}</b> · ${escapeHTML(flavor)}<div class="pluto-zine-total ${success?'is-success':'is-failure'}">${success?'SUCESSO':'FALHA'} <span>${top} / ${difficulty}</span></div>${shown}${note}<small>10 no teste não gera crítico ou explosão.</small></section>`});
  return {highest:top,success,values,difficulty,wanted,count};
}
export async function rollExploding(formula,actor,meta={}){
 const cleaned=String(formula||'1d10').trim().toLowerCase().replace(/\s+/g,'');
 if(!/^[0-9d+\-x]+$/.test(cleaned)||!/(?:\d*)d10/.test(cleaned)) throw new Error('Fórmula de dano inválida');
 const exploding=cleaned.replace(/(\d*d10)(?!x)/g,'$1x');
 const roll=await(new Roll(exploding)).evaluate();
 const total=Math.max(1,roll.total);
 const region=meta.region||'torso';
 const actorName=escapeHTML(actor?.name||'Operário');
 const extra=`<div class="pluto-apply-ui"><label>Região: <select class="pluto-damage-region">${REGION_KEYS.map(k=>`<option value="${k}" ${k===region?'selected':''}>${REGION_NAME[k]}</option>`).join('')}</select></label><button type="button" class="pluto-apply-damage" data-damage="${total}">Aplicar ao token selecionado (GM/prop.)</button></div>`;
 await roll.toMessage({speaker:actor?speaker(actor):{},flavor:`Dano · ${meta.weapon||'Teste'}`,content:`<section class="pluto-chat" data-pluto-chat="dano"><b>${actorName}</b> · ${escapeHTML(meta.weapon||'Dano explosivo')}<div class="pluto-zine-total is-damage"><span>DANO</span> ${total} PV</div>${diceTape(roll,'DADOS DE DANO')}${explosionStamps(roll)}${extra}<small>D10 explodem exclusivamente em dano; total antes da proteção.</small></section>`});
 return {total,roll};
}
export function combatStatus(actor){
 const combat=game.combat,combatant=active(actor);
 if(!combatant)return {inCombat:!!combat?.started,current:false,used:0,attacked:false,reacted:false,max:2};
 const f=combatant.getFlag('plutofagia','turn')??{};
 const stamp=`${combat.id}:${combat.round}:${combat.turn}`;
 return {inCombat:true,current:true,used:f.stamp===stamp?(f.used||0):0,attacked:f.stamp===stamp?!!f.attacked:false,reacted:f.reactionRound===combat.round,max:clamp(Number(f.max)||2,2,3)};
}
export async function spendAction(actor,{cost=1,attack=false,reaction=false}={}){
 const c=game.combat;if(!c?.started)return true;
 const combatant=active(actor);
 if(!combatant){notify('Somente o personagem no turno ativo pode usar essa ação automatizada.');return false;}
 const f=combatant.getFlag('plutofagia','turn')??{};
 const stamp=`${c.id}:${c.round}:${c.turn}`;
 const used=f.stamp===stamp?(f.used||0):0;
 const attacked=f.stamp===stamp?!!f.attacked:false;
 const reacted=f.reactionRound===c.round;
 if(reaction){if(reacted){notify('Você já gastou a reação nesta rodada.');return false;}}
 else if(used+cost>clamp(Number(f.max)||2,2,3)||attack&&attacked){notify('Limite de ações ou de um ataque por turno atingido.');return false;}
 const updates={...f,stamp,used:used+(reaction?0:cost),attacked:attacked||attack,reactionRound:reaction?c.round:f.reactionRound};
 await combatant.setFlag('plutofagia','turn',updates);
 return true;
}
export async function resetAction(combatant){
 if(!combatant)return;
 await combatant.setFlag('plutofagia','turn',{stamp:'',used:0,attacked:false,reactionRound:-1,max:2});
}
export async function executeAttack(actor,item,options={}){
 const attackerToken=tx(actor),target=Array.from(game.user.targets??[])[0];
 if(!item){notify('Escolha uma arma ou ataque desarmado.');return;}
 const range=Number(item.system?.range||1);
 let distance=null,penalty=0,position='frente';
 if(target&&attackerToken){
  distance=GRID.distance(attackerToken,target);
  if(distance>range*2){notify(`Fora de alcance (${distance} quadrados; máximo ${range*2}).`);return;}
  if(distance>range)penalty--;
  if(range===1 && distance>1){notify('Ataque corpo a corpo requer adjacência.');return;}
  if(range===1)position=GRID.position(attackerToken,target);
 }
 const region=options.region||'torso',aimed=region!=='torso';
 const targetDefense=target?.actor?.system?.defense?.value??6;
 const cover=Number(options.cover||0);
 if(cover===100){notify('Cobertura total: alvo sem linha de ataque direto.');return;}
 const coverMod={0:0,25:2,50:3,75:4}[cover]??0;
 const aimedPenalty=aimed?(DMG_AREA[region]??0):0;
 const defense=clamp(targetDefense+coverMod+aimedPenalty,1,10);
 const skill=item.system?.skill || (range===1?'':'pontaria');
 const attribute=item.system?.attribute || (range===1?'brutalidade':'tecnica');
 if(!ATTRS[attribute]){notify('Atributo da arma inválido.');return;}
 if(!await spendAction(actor,{cost:aimed?2:1,attack:true}))return;
 const flanking=(range===1&&position!=='frente')?1:0;
 const extra=flanking + (Number(options.extra)||0)+penalty;
 const result=await rollPool(actor,attribute,skill,extra,defense);
 if(!result.success){if(cover===75)await hostageMiss(actor,target);return;}
 let damage=item.system?.damage||'1d10';
 // Costas aplicam +2 de dano corpo a corpo.
 if(range===1&&position==='costas')damage=`${damage}+2`;
 await rollExploding(damage,actor,{weapon:item.name,region});
 // Consume fictional reload and consumable charges.
 if(item.system?.properties?.toLowerCase().includes('recarga'))await item.setFlag('plutofagia','needsReload',true);
 if(item.type==='consumivel' && item.system.quantity>0)await item.update({'system.quantity':item.system.quantity-1});
}
async function hostageMiss(actor,target){
 const r=await(new Roll('1d10')).evaluate();
 await r.toMessage({speaker:speaker(actor),flavor:'Risco de refém (cobertura 75%)',content:`<div class="pluto-chat"><b>${r.total<=2?'Refém atingido!':'Disparo não atinge ninguém.'}</b><p>1–2: refém atingido; 3–10: erro comum.</p></div>`});
}
export async function executeSkill(actor,attr,skill='',diff=7,bonus=0){return rollPool(actor,attr,skill,bonus,diff);}
export async function executeHeal(actor,target,region,usesKit=true){
 if(!target){notify('Selecione um token alvo.');return;}
 if(!await spendAction(actor,{cost:1}))return;
 if(usesKit&&actor.system.resources.kit.value<=0){notify('O kit médico ficou sem usos.');return;}
 const roll=await rollPool(actor,'tecnica','medicina',0,7);
 if(!roll.success)return;
 const points=await(new Roll('1d10')).evaluate();
 if(target.actor?.isOwner || game.user.isGM){
  await target.actor.healRegion(region,points.total);
  if(usesKit)await actor.update({'system.resources.kit.value':actor.system.resources.kit.value-1});
 }
 await points.toMessage({flavor:`Atendimento • ${actor.name} → ${target.name}: ${REGION_NAME[region]}`,speaker:speaker(actor),content:`<div class="pluto-chat"><b>Cura ${points.total} PV</b><small>Sem explosão, uma vez por região por cena; controle no registro da mesa.</small></div>`});
}
export async function organizeAlternation(combat=game.combat){
 if(!game.user.isGM){notify('Somente o GM prepara a alternância.');return;}
 if(!combat||!combat.combatants.size){notify('Coloque os tokens no Rastreador de Combate primeiro.');return;}
 const groups={sindicato:[],corporacao:[]};
 for(const cb of combat.combatants){
  const key=cb.actor?.system?.faction==='corporacao'?'corporacao':'sindicato';
  groups[key].push(cb);
 }
 const r1=await(new Roll('1d10')).evaluate(),r2=await(new Roll('1d10')).evaluate();
 let winner='sindicato';
 if(r1.total!==r2.total)winner=r2.total>r1.total?'corporacao':'sindicato';
 else winner=groups.corporacao.length>groups.sindicato.length?'corporacao':'sindicato';
 let a=[...groups[winner]],b=[...groups[winner==='sindicato'?'corporacao':'sindicato']];
 const ordered=[];
 while(a.length||b.length){if(a.length)ordered.push(a.shift());if(b.length)ordered.push(b.shift());}
 await combat.updateEmbeddedDocuments('Combatant',ordered.map((c,i)=>({_id:c.id,initiative:1000-i})));
 await ChatMessage.create({content:`<div class="pluto-chat"><strong>Alternância sindical</strong><p>Sindicato ${r1.total} × Corporação ${r2.total}. Começa: ${winner==='sindicato'?'Sindicato':'Corporação'}.</p><small>Ordem alternada por facção, com sobras ao final.</small></div>`});
}
export async function reaction(actor,attr='brutalidade',skill='',diff=7){
 const c=game.combat,cb=c?.combatants?.find(e=>e.actor?.id===actor.id);
 if(c?.started&&cb){const f=cb.getFlag('plutofagia','turn')??{};if(f.reactionRound===c.round){notify('Reação já utilizada na rodada.');return;};await cb.setFlag('plutofagia','turn',{...f,reactionRound:c.round});}
 return rollPool(actor,attr,skill,0,diff);
}
export async function moveFacing(actor,degrees=90){
 const token=tx(actor);if(!token){notify('Selecione seu token no mapa para orientar a unidade.');return;}
 await token.document.update({rotation:((token.document.rotation||0)+degrees+360)%360});
}
export async function chatApplyButton(event){
 const button=event.target.closest('.pluto-apply-damage');if(!button)return;
 event.preventDefault();
 const token=canvas.tokens?.controlled?.[0]??Array.from(game.user.targets??[])[0];
 if(!token?.actor){notify('Selecione um token alvo no mapa para aplicar o dano.');return;}
 if(!game.user.isGM&&!token.actor.isOwner){notify('Somente o GM ou proprietário pode alterar os PV deste token.');return;}
 const select=button.closest('.pluto-chat')?.querySelector('.pluto-damage-region');
 const region=select?.value||'torso';
 try{
  const result=await token.actor.applyRegionalDamage(region,Number(button.dataset.damage));
  ui.notifications.info(`${token.name}: ${result.damage} PV na ${result.region}, proteção ${result.armor}, restantes ${result.remaining}.`);
 }catch(e){notify(e.message);}
}
