export const escapeHtml = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const jsonScript = value => JSON.stringify(value).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
export const slugify = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const townPath = town => `/porteros-videoporteros/${town.provinceSlug}/${town.slug}/`;
export const provincePath = province => `/porteros-videoporteros/${province.provinceSlug || province.slug}/`;
export const servicePath = service => `/servicios/${service.slug}/`;
export const guidePath = guide => `/guias/${guide.slug}/`;
export const hash = value => {
  let h=2166136261;
  for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  // Mezcla final para que códigos vecinos no produzcan selecciones correlacionadas.
  h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;
  return h>>>0;
};
export function choose(items, seed, count) {
  return items.map(item=>({item,key:hash(`${seed}:${item.id || item.code || item.name}`)})).sort((a,b)=>a.key-b.key).slice(0,count).map(row=>row.item);
}
export function selectDiagnostics(items, focusIds, seed, count=4) {
  const first=choose(items.filter(item=>focusIds.includes(item.id)),`${seed}:focus`,1);
  const selected=[...first];
  const topics=new Set(first.map(item=>item.topic || item.scope));
  const remaining=choose(items.filter(item=>!first.includes(item)),`${seed}:topics`,items.length);
  for(const item of remaining) {
    if(selected.length>=count)break;
    const topic=item.topic || item.scope;
    if(!topics.has(topic)){selected.push(item);topics.add(topic);}
  }
  for(const item of remaining) {
    if(selected.length>=count)break;
    if(!selected.includes(item))selected.push(item);
  }
  return selected;
}
export function distanceKm(a,b){
  const rad=Math.PI/180;const dlat=(b.lat-a.lat)*rad;const dlon=(b.lon-a.lon)*rad;
  const n=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(n),Math.sqrt(1-n));
}
export function nearbyTowns(town,towns,count=8) {
  return towns.filter(other=>other.code!==town.code && Number.isFinite(other.lat) && Number.isFinite(other.lon)).map(other=>({town:other,d:distanceKm(town,other)})).sort((a,b)=>a.d-b.d).slice(0,count).map(row=>row.town);
}
export function normalizeOrigin(value){
  if(!value)return '';
  const url=new URL(value);
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('SITE_URL debe ser un origen absoluto, sin ruta, parámetros ni credenciales.');
  return url.origin.toLowerCase();
}
export const phoneDigits = value => String(value || '').replace(/\D/g,'');
export const esNumber = value => new Intl.NumberFormat('es-ES').format(value);
