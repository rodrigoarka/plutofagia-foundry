/** Impressão zine para mensagens próprias do sistema; os números reais não são alterados. */
const ANARCHY='Ⓐ';
function d10Values(roll){
 return (Array.isArray(roll?.dice)?roll.dice:[])
 .filter(d=>Number(d.faces)===10)
 .flatMap(d=>(d.results??[]).filter(r=>r.active!==false).map(r=>Number(r.result)).filter(Number.isInteger));
}
export function countDamageExplosions(roll){return d10Values(roll).filter(n=>n===10).length;}
export function diceTape(values,caption='D10'){
 const list=Array.isArray(values)?values:d10Values(values);
 if(!list.length)return '';
 const tiles=list.map(value=>{
  const n=Number(value), ten=n===10,shown=ten?ANARCHY:String(n);
  const label='Resultado '+n;
  return '<span class="pluto-d10'+(ten?' pluto-d10-ten':'')+'" role="img" title="'+label+'" aria-label="'+label+'">'+shown+'</span>';
 }).join('');
 return '<div class="pluto-dice-strip"><span class="pluto-dice-caption">'+caption+
  '</span><div class="pluto-dice-tiles">'+tiles+'</div></div>';
}
export function explosionStamps(roll){
 const count=countDamageExplosions(roll);
 if(!count)return '';
 const marks=Array.from({length:count},()=>'<span class="pluto-anarchy-stamp" role="img" aria-label="Resultado 10 explosivo">'+ANARCHY+'</span>').join('');
 return '<div class="pluto-explosion-report"><b>EXPLOSÃO DE D10</b><div class="pluto-explosion-stamps">'+marks+
  '</div><small>'+count+' resultado(s) 10 geraram dados adicionais de dano.</small></div>';
}
export function decoratePlutoChat(_message,html){
 if(!html?.querySelector?.('.pluto-chat,.pluto-draw-result'))return false;
 html.classList.add('pluto-zine-message');
 for(const die of html.querySelectorAll('.dice-tooltip .die.d10')){
  if(die.textContent?.trim()==='10'){die.textContent=ANARCHY;die.setAttribute('aria-label','Resultado 10');die.title='Resultado 10';}
 }
 return true;
}
