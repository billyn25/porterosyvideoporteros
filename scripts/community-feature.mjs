import {escapeHtml as e,hash} from './utils.mjs';
import {textLink} from './components.mjs';

export const communityPanels=[
  {id:'tegui-sfera-new',name:'Tegui · Sfera New',image:'/assets/communities/tegui-sfera-new.webp',width:234,height:721,alt:'Placa exterior modular Sfera New con cámara y varias filas de pulsadores para un portal de viviendas',description:'Composición modular para organizar la llamada a las viviendas.',sourceUrl:'https://www.tegui.es/videoporteros/placas-exteriores/sfera-new',imageSourceUrl:'https://tegui-distel.com/cdn/shop/collections/Placas_sfera_new.png?v=1792140391&width=1200',credit:'Imagen de catálogo BTicino / Tegui publicada por Distel; detalle de la placa Sfera New.'},
  {id:'golmar-supra',name:'Golmar · Supra',image:'/assets/communities/golmar-supra.webp',width:760,height:902,alt:'Placa exterior Golmar Supra de un edificio con varias filas de pulsadores y tarjeteros iluminados',description:'Placa modular con pulsadores para identificar cada vivienda.',sourceUrl:'https://www.golmar.es/news/supra-the-door-panel-that-eclipses-all-expectations',imageSourceUrl:'https://www.golmar.es/media/202840/supra-web-2.png',credit:'Fotografía de producto de Golmar; detalle de la placa Supra.'}
];

const localCopy=[
  {title:'Una renovación para todo el portal',intro:'Para cambiar la placa de una comunidad, revisamos la instalación común y los equipos de cada vivienda. La propuesta concreta qué se conserva, qué se sustituye y cómo se organiza el acceso a los pisos.',checks:['Placa, pulsadores, alimentación y terminales compatibles.','Pruebas de llamada, conversación y apertura en las viviendas.']},
  {title:'Videoporteros para comunidades de propietarios',intro:'Un edificio necesita una solución conjunta: relacionar los pulsadores con cada vivienda, valorar el cableado y coordinar la sustitución de telefonillos o monitores con la comunidad o su administrador.',checks:['Número de viviendas, locales y entradas del edificio.','Opciones de audio o vídeo y acabados alrededor de la placa.']},
  {title:'Renovar la entrada de tu comunidad',intro:'Si la placa está deteriorada o la comunidad quiere incorporar vídeo, estudiamos el conjunto antes de elegir equipos. Separamos los elementos comunes de los terminales interiores para comparar propuestas con el mismo alcance.',checks:['Revisión del sistema y del estado del cableado existente.','Coordinación de los trabajos y comprobación de cada llamada.']}
];

export function communityFeature({town=null,province=null}={}){
  const seed=town?hash(town.code+':community'):province?hash(province.slug+':community'):0;
  const copy=localCopy[seed%localCopy.length];
  const panels=seed%2?[...communityPanels].reverse():communityPanels;
  return `<div class="community-feature" id="comunidades"><div class="community-copy"><p class="eyebrow">Comunidades de propietarios${town?` · ${e(town.name)}`:province?` · Provincia de ${e(province.name)}`:''}</p><h3>${e(town||province?copy.title:'El videoportero de toda tu comunidad.')}</h3><p>${e(copy.intro)}</p><ul>${copy.checks.map(item=>`<li>${e(item)}</li>`).join('')}</ul>${textLink('Ver servicio para comunidades','/servicios/videoporteros-comunidades-vecinos/')}</div><div class="community-panels">${panels.map(p=>`<figure class="community-panel community-panel--${p.id}"><div class="community-panel-photo"><img src="${e(p.image)}" alt="${e(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"></div><figcaption><h4>${e(p.name)}</h4><p>${e(p.description)}</p></figcaption></figure>`).join('')}<p class="community-credit">Imágenes de catálogo de los fabricantes. Ejemplos de placas; la composición y compatibilidad se confirman para cada edificio. <a href="/fuentes/#placas-comunidades">Fuentes de las imágenes</a>.</p></div></div>`;
}
