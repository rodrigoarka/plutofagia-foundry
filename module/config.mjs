export const ATTRS = {
  brutalidade: 'Brutalidade', agilidade: 'Agilidade', resistencia: 'Resistência',
  tecnica: 'Técnica', labia: 'Lábia', articulacao: 'Articulação'
};
export const SKILLS = {
  pontaria: 'Pontaria', explosivos: 'Explosivos', mecanica: 'Mecânica',
  medicina: 'Medicina', furtividade: 'Furtividade', pilotagem: 'Pilotagem',
  intimidacao: 'Intimidação', negociacao: 'Negociação', mobilizacao: 'Mobilização',
  sobrevivencia: 'Sobrevivência'
};
export const OFFICES = [
  'Técnico do TI Revolucionário','CLT Indestrutível','Fiscal de CPF',
  'Socorrista de Barricada','Batedor de Ocupação','Agitador Sindical'
];
export const REGION_BASE = {cabeca:12, torso:24, bracoE:14, bracoD:14, pernaE:16, pernaD:16};
export const REGION_NAME = {cabeca:'Cabeça',torso:'Tronco',bracoE:'Braço E',bracoD:'Braço D',pernaE:'Perna E',pernaD:'Perna D'};
export const REGION_KEYS = Object.keys(REGION_BASE);
export const CONDITIONS = ['suprimido','contido','refem','abatido','pernaFerida'];
export const SIZE = {P:'Pequeno',M:'Médio',G:'Grande'};
export const ANATOMY = {normal:'Duas pernas e dois braços',pernaUnica:'Uma perna',cauda:'Cauda única',bracoUnico:'Um braço'};
export const FACTIONS = {sindicato:'Sindicato',corporacao:'Corporação',neutro:'Neutro'};
export const DMG_AREA = {cabeca:2,torso:0,bracoE:1,bracoD:1,pernaE:1,pernaD:1};
export function hpMaximum(region, resistance, anatomy='normal') {
  const base = REGION_BASE[region] + 2 * (resistance - 2);
  if ((anatomy === 'pernaUnica'||anatomy === 'cauda') && region === 'pernaD') return 0;
  if ((anatomy === 'pernaUnica'||anatomy === 'cauda') && region === 'pernaE') return base * 2;
  if (anatomy === 'bracoUnico' && region === 'bracoD') return 0;
  if (anatomy === 'bracoUnico' && region === 'bracoE') return base * 2;
  return base;
}
export function absent(region,anatomy='normal') {
  return (region === 'pernaD' && ['pernaUnica','cauda'].includes(anatomy)) || (region==='bracoD' && anatomy==='bracoUnico');
}
export function escapeHTML(value='') {return String(value).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
export function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
export const ITEMS_PATH='systems/plutofagia/assets/catalog.json';
