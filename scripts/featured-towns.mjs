export const FEATURED_TOWNS_PER_PROVINCE=10;
export const VISIBLE_FEATURED_TOWNS=6;

const extraTownCodes={madrid:['28130','28049']};

// La población del catálogo ordena la selección; no representa un ranking actualizado.
export function featuredTownsForProvince(province){
  const ordered=[...province.towns].sort((a,b)=>(Number(b.population)||0)-(Number(a.population)||0) || a.name.localeCompare(b.name,'es') || String(a.code).localeCompare(String(b.code)));
  const seen=new Set();
  const featured=ordered.filter(town=>{
    if(seen.has(town.code))return false;
    seen.add(town.code);
    return true;
  }).slice(0,FEATURED_TOWNS_PER_PROVINCE);
  const selected=new Set(featured.map(town=>town.code));
  for(const code of extraTownCodes[province.slug] || []){
    const town=province.towns.find(item=>item.code===code);
    if(town && !selected.has(code)){
      featured.push(town);
      selected.add(code);
    }
  }
  return featured;
}
