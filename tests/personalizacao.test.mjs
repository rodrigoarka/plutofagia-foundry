import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Personalização carrega depois do CSS base no manifesto',()=>{
 const m=JSON.parse(read('system.json'));
 assert.equal(m.version,'0.9.6');
 assert.deepEqual(m.styles,['styles/plutofagia.css','styles/personalizacao.css']);
 assert.match(m.download,/\/v0\.9\.6\/plutofagia\.zip$/);
});

test('Dados d10 do chat são redondos e mantêm Ⓐ vermelho',()=>{
 const css=read('styles/personalizacao.css');
 assert.match(css,/#chat-log \.pluto-zine-message \.pluto-d10\s*\{/);
 assert.match(css,/border-radius:\s*50%/);
 assert.match(css,/clip-path:\s*none/);
 assert.match(css,/\.pluto-d10\.pluto-d10-ten/);
 assert.match(css,/#f0444b/i);
 assert.match(css,/flex-wrap:\s*wrap/);
});

test('Ficha clara usa textura local sem rede externa',()=>{
 const css=read('styles/personalizacao.css');
 assert.match(css,/url\("\.\.\/assets\/muro-velho\.svg"\)/);
 assert.match(css,/background-color:\s*#f8f8f5/);
 assert.match(read('assets/muro-velho.svg'),/<svg/);
 assert.doesNotMatch(css,/https?:\/\//);
});

test('Arquivo do usuário e regra de preservação estão documentados',()=>{
 const guide=read('AGENTS.md');
 assert.match(guide,/personalizacao\.css/);
 assert.match(guide,/Nunca substituir/);
});
