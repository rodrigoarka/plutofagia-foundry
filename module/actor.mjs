import {hpMaximum,absent,REGION_KEYS,clamp,REGION_NAME} from './config.mjs';
export class PlutoActor extends Actor {
 prepareDerivedData(){
  super.prepareDerivedData();
  if(!['operario','npc'].includes(this.type)) return;
  const s=this.system;
  const r=s.attributes.resistencia||2;
  for(const k of REGION_KEYS){
   const data=s.regions[k];
   data.max=hpMaximum(k,r,s.anatomy);
   data.value=clamp(data.value,0,data.max);
   const protections=this.items.filter(item=>item.type==='protecao'&&item.system.equipped&&item.system.region===k);
   if(protections.length)data.armor=Math.max(data.armor,...protections.map(item=>Number(item.system.armor||0)));
  }
  s.defense.value=clamp(s.defense.base,1,10);
  let move=2+(s.attributes.agilidade||1);
  const legKeys=['pernaE','pernaD'].filter(k=>!absent(k,s.anatomy));
  if(legKeys.some(k=>s.regions[k].value===0)) move=1;
  else if((s.anatomy==='normal' && legKeys.some(k=>s.regions[k].value<s.regions[k].max/2)) ||
          (s.anatomy!=='normal' && legKeys.some(k=>s.regions[k].value<=s.regions[k].max*0.75))) {
     move=Math.max(1,Math.floor(move/2));
  }
  if(s.anatomy!=='normal' && legKeys.some(k=>s.regions[k].value<=s.regions[k].max*.5)) move=1;
  s.movement.value=move;s.movement.max=2+(s.attributes.agilidade||1);
 }
 async changeResistance(newValue){
  const prev=this.system.attributes.resistencia;
  const v=clamp(Number(newValue),1,5);
  const update={'system.attributes.resistencia':v};
  for(const k of REGION_KEYS){
   const old=this.system.regions[k];
   const next=hpMaximum(k,v,this.system.anatomy);
   const diff=next-hpMaximum(k,prev,this.system.anatomy);
   update[`system.regions.${k}.value`]=clamp(old.value+diff,0,next);
  }
  return this.update(update);
 }
 async changeAnatomy(next){
  const from=this.system.anatomy;
  const data={'system.anatomy':next};
  const grouped=[['pernaE','pernaD'],['bracoE','bracoD']];
  const r=this.system.attributes.resistencia;
  for(const [left,right] of grouped){
   const oldL=this.system.regions[left].value, oldR=this.system.regions[right].value;
   const oldLM=hpMaximum(left,r,from), oldRM=hpMaximum(right,r,from);
   const newLM=hpMaximum(left,r,next),newRM=hpMaximum(right,r,next);
   const oldPool=oldL+oldR,oldMax=oldLM+oldRM;
   const damage=Math.max(0,oldMax-oldPool);
   if(newRM===0){data[`system.regions.${left}.value`]=clamp(newLM-damage,0,newLM);data[`system.regions.${right}.value`]=0;}
   else if(oldRM===0){
     data[`system.regions.${left}.value`]=clamp(newLM-Math.ceil(damage/2),0,newLM);
     data[`system.regions.${right}.value`]=clamp(newRM-Math.floor(damage/2),0,newRM);
   }
  }
  return this.update(data);
 }
 async applyRegionalDamage(region,amount,opts={}){
  if(!REGION_KEYS.includes(region)) throw new Error('Região inválida');
  const hp=this.system.regions[region];
  if(absent(region,this.system.anatomy)) throw new Error('Região ausente');
  const armor=opts.ignoreArmor?0:Math.max(0,hp.armor);
  const damage=Math.max(0,Math.floor(Number(amount)||0)-armor);
  await this.update({[`system.regions.${region}.value`]:Math.max(0,hp.value-damage)});
  return {region:REGION_NAME[region],damage,armor,remaining:Math.max(0,hp.value-damage)};
 }
 async healRegion(region,amount){
  if(!REGION_KEYS.includes(region)||absent(region,this.system.anatomy)) return null;
  const hp=this.system.regions[region];
  const v=Math.min(hp.max,hp.value+Math.max(0,Math.floor(amount)));
  await this.update({[`system.regions.${region}.value`]:v});
  return v;
 }
}
export class PlutoItem extends Item {}
