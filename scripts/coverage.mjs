import {distanceKm} from './utils.mjs';

export const coveragePolicy={minimumPopulation:5000,minimumPerProvince:8,maxDistanceKm:25};
const order=(a,b)=>(b.population||0)-(a.population||0)||a.code.localeCompare(b.code);
const pathFor=t=>`/porteros-videoporteros/${t.provinceSlug}/${t.slug}/`;
// Approximate distances between municipal coordinates, never road distances.
export function buildCoverage(towns){
  const selected=[];const assignments=new Map();const groups=new Map();
  for(const slug of new Set(towns.map(t=>t.provinceSlug))){
    const members=towns.filter(t=>t.provinceSlug===slug).sort(order);
    for(const town of members)if(!Number.isFinite(town.lat)||!Number.isFinite(town.lon)||!Number.isFinite(town.population))throw new Error(`Datos geográficos incompletos: ${town.code}`);
    const hubs=members.filter((t,i)=>t.population>=coveragePolicy.minimumPopulation||i<coveragePolicy.minimumPerProvince);
    for(const town of members)if(!hubs.includes(town)&&hubs.every(h=>distanceKm(town,h)>coveragePolicy.maxDistanceKm))hubs.push(town);
    selected.push(...hubs);
    for(const town of members){
      const hub=hubs.includes(town)?town:[...hubs].sort((a,b)=>distanceKm(town,a)-distanceKm(town,b)||order(a,b))[0];
      const distance=distanceKm(town,hub);
      assignments.set(town.code,{town,hub,distanceKm:distance});
      if(!groups.has(hub.code))groups.set(hub.code,[]);
      groups.get(hub.code).push(town);
    }
  }
  for(const town of towns){
    const {hub}=assignments.get(town.code);
    town.coverageUrl=pathFor(hub)+(town.code===hub.code?'':`#cobertura-${town.slug}`);
  }
  return {selected:selected.sort(order),assignments,groups};
}
