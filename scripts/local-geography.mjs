// Las referencias municipales y el callejero conservan fuentes y categorías distintas.
export function localNameKey(name){
  return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/^(?:c\.|c\/|cl\.?)(?=\s)/,'calle')
    .replace(/^(?:av\.?|avda\.?)(?=\s)/,'avenida')
    .replace(/^(?:pza\.?|pz\.?)(?=\s)/,'plaza')
    .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)
    .filter(word=>!['de','del','la','el','los','las'].includes(word)).join(' ');
}

export function localReferences(ctx,town){
  const municipal=ctx.localities?.municipalities?.[town.code]?.areas || [];
  const areas=municipal.filter(place=>place.type!=='street');
  const imported=ctx.streetMunicipalities?.[town.code]?.streets || [];
  const manualStreets=municipal.filter(place=>place.type==='street');
  const manualKeys=new Set(manualStreets.map(place=>localNameKey(place.name)));
  const streets=[],seen=new Set();
  // Una variante documentada por el ayuntamiento puede sustituir la grafía
  // del callejero. Entre vías importadas se conserva cualquier diferencia
  // de nombre: quitar artículos podría ocultar calles de núcleos distintos.
  const importedStreets=imported.filter(place=>!manualKeys.has(localNameKey(place.name)))
    .map(place=>({...place,type:'street',sourceId:ctx.streets.source.id}));
  for(const place of [...manualStreets,...importedStreets]){
    const key=place.name.normalize('NFC').toLocaleLowerCase('es').replace(/\s+/g,' ').trim();
    if(seen.has(key))continue;
    seen.add(key);streets.push(place);
  }
  const sourceIds=[...new Set([...areas,...streets].map(place=>place.sourceId))];
  const sources=sourceIds.map(id=>id===ctx.streets?.source?.id?ctx.streets.source:ctx.localities.sources[id]);
  const hasNeighborhoods=areas.some(place=>place.type==='neighborhood');
  const onlyLocalities=areas.length>0 && areas.every(place=>place.type==='locality');
  const onlyParishes=areas.length>0 && areas.every(place=>place.type==='parish');
  const hasRuralAreas=areas.some(place=>['locality','parish'].includes(place.type));
  const areaLabel=hasNeighborhoods&&!hasRuralAreas?'barrios':onlyLocalities?'localidades':onlyParishes?'parroquias':'zonas';
  const label=streets.length?(areas.length?`${areaLabel} y calles`:'calles y plazas'):(hasNeighborhoods&&!hasRuralAreas?'barrios y zonas':areaLabel);
  const heading=label.charAt(0).toUpperCase()+label.slice(1);
  return {areas,streets,places:[...areas,...streets],sources,count:areas.length+streets.length,heading,jumpLabel:`Ver ${label}`};
}
