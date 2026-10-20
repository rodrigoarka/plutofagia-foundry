// Mock minimalista da API de inicializacao do Foundry V13.
// Detecta especificamente a perda do receiver da chamada DocumentSheetConfig.registerSheet.
import assert from 'node:assert/strict';
const callbacks={};
globalThis.Hooks={once(name,fn){callbacks[name]=fn;},on(){}};
class BaseField {constructor(options){this.options=options;}}
class ActorSheetV2 {async _prepareContext(){return {}} async _onRender() {}}
class ItemSheetV2 {async _prepareContext(){return {}} async _onRender() {}}
const registrations=[];
const SheetConfig={registerSheet(doc,scope,cls,opts){assert.strictEqual(this,SheetConfig,'registerSheet perdeu o contexto da classe');registrations.push({doc,scope,cls,opts});}};
globalThis.foundry={
  abstract:{TypeDataModel:class{}},
  data:{fields:{NumberField:BaseField,StringField:BaseField,BooleanField:BaseField,SchemaField:BaseField}},
  applications:{api:{HandlebarsApplicationMixin:C=>C},sheets:{ActorSheetV2,ItemSheetV2},apps:{DocumentSheetConfig:SheetConfig}},
  documents:{Actor:class{},Item:class{}}
};
globalThis.Actor=class{prepareDerivedData(){}};globalThis.Item=class{};
globalThis.CONFIG={Actor:{},Item:{},statusEffects:[]};
globalThis.game={system:{id:'plutofagia'},settings:{register(){}}};
await import('../module/main.mjs');
assert.equal(typeof callbacks.init,'function');
callbacks.init();
assert.equal(registrations.length,3);
assert.deepEqual(registrations.map(r=>r.opts.types),[['operario','npc'],['comunidade'],['arma','protecao','tecnica','consumivel','equipamento','carta']]);
assert.ok(registrations.every(r=>r.opts.makeDefault),'As fichas devem ser padrão');
assert.ok(CONFIG.Actor.dataModels.operario,'Modelo operário ausente');
assert.ok(CONFIG.Actor.dataModels.comunidade,'Modelo comunidade ausente');
assert.ok(CONFIG.Item.dataModels.arma,'Modelo arma ausente');
console.log('OK: modulo V13 inicializa e registra 3 grupos de fichas com escopo correto.');
