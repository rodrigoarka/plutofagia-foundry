/** Iconografia local do catálogo fictício; prioriza imagens escolhidas pelo jogador. */
export const ITEM_ARTWORK=Object.freeze({
  "Tralha improvisada": "systems/plutofagia/assets/card-icons/49.svg",
  "Bastão encantado": "systems/plutofagia/assets/card-icons/43.svg",
  "Ferramenta fantástica de impacto": "systems/plutofagia/assets/card-icons/14.svg",
  "Projetor arcano compacto": "systems/plutofagia/assets/card-icons/53.svg",
  "Orbe de rajada": "systems/plutofagia/assets/card-icons/33.svg",
  "Emissor fantástico de área": "systems/plutofagia/assets/card-icons/01.svg",
  "Lança-raios cerimonial": "systems/plutofagia/assets/card-icons/25.svg",
  "Instrumento mágico de longo alcance": "systems/plutofagia/assets/card-icons/24.svg",
  "Chave de oficina improvisada": "systems/plutofagia/assets/card-icons/56.svg",
  "Martelo de manutenção": "systems/plutofagia/assets/card-icons/36.svg",
  "Gambiarra goblin de molas": "systems/plutofagia/assets/card-icons/16.svg",
  "Corneta de Chiado Arcano": "systems/plutofagia/assets/card-icons/08.svg",
  "Cápsula de Luz de Rua": "systems/plutofagia/assets/card-icons/18.svg",
  "Escudo de panela de sindicato": "systems/plutofagia/assets/card-icons/31.svg",
  "Capacete simples": "systems/plutofagia/assets/card-icons/14.svg",
  "Colete leve": "systems/plutofagia/assets/card-icons/35.svg",
  "Colete reforçado": "systems/plutofagia/assets/card-icons/30.svg",
  "Braçadeira de trabalho": "systems/plutofagia/assets/card-icons/23.svg",
  "Kit médico comunitário": "systems/plutofagia/assets/card-icons/59.svg",
  "Kit de ferramentas": "systems/plutofagia/assets/card-icons/56.svg",
  "Pacote de suprimentos": "systems/plutofagia/assets/card-icons/13.svg",
  "Mochila comunitária": "systems/plutofagia/assets/card-icons/32.svg",
  "Caderno de assembleia": "systems/plutofagia/assets/card-icons/15.svg",
  "Pastel restaurador de Dona Graça": "systems/plutofagia/assets/card-icons/42.svg",
  "Caldo da Resistência": "systems/plutofagia/assets/card-icons/06.svg",
  "Marmita de mutirão": "systems/plutofagia/assets/card-icons/03.svg"
});
export const LEGACY_ARTWORK=new Set(['icons/svg/sword.svg','icons/svg/shield.svg','icons/svg/item-bag.svg','icons/svg/potion.svg']);
export function getItemArtwork(item){
 const original=String(item?.img??'');
 const replacement=ITEM_ARTWORK[item?.name];
 return replacement && (!original || LEGACY_ARTWORK.has(original)) ? replacement : original || 'icons/svg/item-bag.svg';
}
