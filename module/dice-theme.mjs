/** Integração opcional com Dice So Nice para D10 preto e face 10 com Ⓐ.
 * Sem Dice So Nice, o sistema permanece compatível e mostra os D10 no chat.
 */
export const PLUTO_DICE_SYSTEM='plutofagia-d10';
export const PLUTO_DICE_COLOR='plutofagia-ink';
export function registerPlutoDice(dice3d){
 if(!dice3d || typeof dice3d.addSystem!=='function' || typeof dice3d.addDicePreset!=='function' || typeof dice3d.addColorset!=='function')return false;
 dice3d.addColorset({
  name:PLUTO_DICE_COLOR,description:'PLUTOFAGIA · Tinta Preta',category:'Plutofagia',
  foreground:'#f4eee1',background:'#0b0c0e',edge:'#472227',outline:'#0b0c0e',material:'plastic'
 });
 // Preferência inicial. Nunca altera configurações que o jogador já salvou.
 dice3d.addSystem({id:PLUTO_DICE_SYSTEM,name:'PLUTOFAGIA · D10 da Anarquia'},'preferred');
 dice3d.addDicePreset({type:'d10',labels:['1','2','3','4','5','6','7','8','9','Ⓐ'],system:PLUTO_DICE_SYSTEM,colorset:PLUTO_DICE_COLOR,fontScale:0.95});
 return true;
}
