export const FEATURED_TOWNS_PER_PROVINCE=20;
export const VISIBLE_FEATURED_TOWNS=15;

const extraTownCodes={madrid:['28130','28049']};

// La población del catálogo ordena la selección; no representa un ranking actualizado.
export function featuredTownsForProvince(province){
  const ordered=[...province.towns].sort((a,b)=>(Number(b.population)||0)-(Number(a.population)||0) || a.name.localeCompare(b.name,'es') || String(a.code).localeCompare(String(b.code)));
  const extras=(extraTownCodes[province.slug] || []).map(code=>province.towns.find(town=>town.code===code)).filter(Boolean);
  const cutoff=Math.max(0,VISIBLE_FEATURED_TOWNS-extras.length);
  const prioritized=[...ordered.slice(0,cutoff),...extras,...ordered.slice(cutoff)];
  const seen=new Set();
  return prioritized.filter(town=>{
    if(seen.has(town.code))return false;
    seen.add(town.code);
    return true;
  }).slice(0,FEATURED_TOWNS_PER_PROVINCE);
}
