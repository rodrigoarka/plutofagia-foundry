import {ATTRS, SKILLS, REGION_BASE} from './config.mjs';
const f = foundry.data.fields;
const int = (init=0, max=999) => new f.NumberField({required:true,nullable:false,integer:true,min:0,max,initial:init});
const str = (init='') => new f.StringField({required:true,nullable:false,blank:true,initial:init});
const flag = (init=false)=>new f.BooleanField({required:true,initial:init});
const resource = (v,m)=>new f.SchemaField({value:int(v,999),max:int(m,999)});
const region = (max)=>new f.SchemaField({value:int(max,999),max:int(max,999),armor:int(0,9)});
const attributes = () =>new f.SchemaField(Object.fromEntries(Object.keys(ATTRS).map(k=>[k,new f.NumberField({required:true,integer:true,min:1,max:5,initial:2})])));
const skills = ()=> new f.SchemaField(Object.fromEntries(Object.keys(SKILLS).map(k=>[k,flag(false)])));
const regions = ()=>new f.SchemaField(Object.fromEntries(Object.entries(REGION_BASE).map(([k,n])=>[k,region(n)])));
const cond=()=>new f.SchemaField({suprimido:flag(),contido:flag(),refem:flag(),abatido:flag(),pernaFerida:flag()});
export class PlutoActorModel extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {
  attributes:attributes(),skills:skills(),regions:regions(),conditions:cond(),
  species:str('Livre'),size:str('M'),anatomy:str('normal'),office:str(''),faction:str('sindicato'),
  background:str(''),purpose:str(''),contradiction:str(''),collective:str(''),notes:str(''),
  xp:int(0),xpSpent:int(0),defense:new f.SchemaField({base:int(6,10),value:int(6,10)}),
  movement:resource(4,4),resources:new f.SchemaField({pr:resource(0,3),ap:resource(0,99),kit:resource(3,3)}),
  injuryNotes:str(''),turnNotes:str('')
 };}
}
export class PlutoCommunityModel extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {apoio:int(0,4),pressao:int(0,4),estrutura:int(0,4),ap:int(0,99),pr:int(0,3),acordo:int(0,3),complicacoes:int(0,2),notas:str(''),objetivo:str('')};}
}
export class PlutoItemModel extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {
  description:str(''),category:str(''),damage:str('1d10'),splash:str(''),
  range:int(1,99),area:int(0,99),slots:int(1,9),properties:str(''),
  skill:str(''),attribute:str(''),cost:int(0,99),difficulty:int(7,10),
  effect:str(''),officio:str(''),level:str('basica'),
  uses:resource(0,99),equipped:flag(false),quantity:int(1,999),
  region:str('torso'),armor:int(0,9),rarity:str('comum')
 };}
}
