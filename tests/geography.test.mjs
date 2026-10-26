import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {localReferences,localNameKey} from '../scripts/local-geography.mjs';
import {featuredTownsForProvince} from '../scripts/featured-towns.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
const towns=read('municipalities');
const streets=read('streets');
const localities=read('localities');
const streetMunicipalities=Object.assign({},...Object.entries(streets.files).map(([slug,file])=>{
  assert.equal(file,`streets/${slug}.json`);
  const province=read(file.slice(0,-5));
  assert.equal(province.provinceSlug,slug);
  for(const code of Object.keys(province.municipalities))assert.equal(towns.find(town=>town.code===code)?.provinceSlug,slug);
  return province.municipalities;
}));

test('the street selection preserves municipality identity, official source types and auditable totals',()=>{
  assert.equal(streets.schemaVersion,1);
  assert.equal(streets.source.referenceDate,'2026-06-30');
  assert.equal(new URL(streets.source.downloadUrl).hostname,'www.ine.es');
  assert.match(streets.source.sha256,/^[a-f\d]{64}$/);
  assert.deepEqual(Object.keys(streets.source.membersRead).sort(),['TRAM','VIAS']);
  assert.equal(Object.keys(streetMunicipalities).length,towns.length);
  let total=0,withStreets=0;
  const exceptions=new Set(streets.stats.exceptions.map(town=>town.code));
  for(const town of towns){
    const record=streetMunicipalities[town.code];
    assert.ok(record,town.code);assert.equal(record.name,town.name);
    assert.ok(record.streets.length<=streets.selection.maxPerMunicipality);
    assert.ok(record.availableStreetCount>=record.streets.length);
    assert.equal(new Set(record.streets.map(street=>street.code)).size,record.streets.length);
    assert.equal(exceptions.has(town.code),record.streets.length===0);
    for(const street of record.streets){
      assert.match(street.code,/^\d{5}$/);
      assert.ok(streets.selection.acceptedSourceTypes[street.sourceType]);
      assert.ok(street.sourceName.trim());assert.ok(street.name.trim());
      assert.doesNotMatch(street.name,/pol[ií]gono|industrial|camping|aeropuerto|sin nombre|diseminad/i);
      assert.equal(new Set(street.postalCodes).size,street.postalCodes.length);
      for(const code of street.postalCodes)assert.match(code,/^\d{5}$/);
    }
    total+=record.streets.length;
    if(record.streets.length)withStreets++;
  }
  assert.equal(total,streets.stats.selectedStreetCount);
  assert.equal(withStreets,streets.stats.municipalitiesWithStreets);
  assert.equal(towns.length-withStreets,streets.stats.municipalitiesWithoutStreets);
  assert.equal(exceptions.size,streets.stats.municipalitiesWithoutStreets);
});

test('known municipal street codes are matched to the right town, including small villages',()=>{
  const castilnuevo=streetMunicipalities['19079'];
  assert.equal(castilnuevo.name,'Castilnuevo');
  assert.ok(castilnuevo.streets.some(street=>street.code==='00002' && street.sourceName==='REAL'));
  assert.ok(castilnuevo.streets.some(street=>street.code==='00005' && street.sourceName==='CASTILLO (DEL)'));
  assert.ok(streetMunicipalities['31001'].streets.some(street=>street.sourceName==='CALLEJA' && street.postalCodes.includes('31280')));
  assert.ok(streetMunicipalities['28130'].streets.some(street=>street.code==='00024' && street.sourceName==='CONSTITUCION (DE LA)'));
  const siero=localReferences({streets,localities,streetMunicipalities},{code:'33066'});
  assert.ok(siero.streets.some(street=>street.code==='02684' && street.postalCodes.includes('33186')));
  assert.ok(siero.streets.some(street=>street.code==='02692' && street.postalCodes.includes('33580')));
});

test('municipal spellings take precedence without merging a street and an avenue of the same name',()=>{
  const context={streets:{source:{id:'official-streets'}},localities:{sources:{municipal:{id:'municipal'}},municipalities:{'00001':{areas:[
    {name:'Parque Henares',type:'neighborhood',sourceId:'municipal'},
    {name:'Calle de Álava',type:'street',sourceId:'municipal'},
  ]}}},streetMunicipalities:{'00001':{streets:[
    {name:'Calle Alava (De)'},{name:'Avenida Alava (De)'},
  ]},'00002':{streets:[{name:'Calle Madrid'}]}}};
  const result=localReferences(context,{code:'00001'});
  assert.deepEqual(result.areas.map(place=>place.name),['Parque Henares']);
  assert.deepEqual(result.streets.map(place=>place.name),['Calle de Álava','Avenida Alava (De)']);
  assert.equal(result.heading,'Barrios y calles');
  assert.equal(result.sources.length,2);
  assert.equal(localReferences(context,{code:'00003'}).count,0);
  assert.notEqual(localNameKey('Calle Madrid'),localNameKey('Avenida Madrid'));
});

test('parishes and localities never acquire a neighborhood label merely by appearing on a town page',()=>{
  const context={localities:{sources:{town:{id:'town'}},municipalities:{'00001':{areas:[{name:'Lugar documentado',type:'locality',sourceId:'town'}]},'00002':{areas:[{name:'Parroquia documentada',type:'parish',sourceId:'town'}]}}}};
  assert.equal(localReferences(context,{code:'00001'}).heading,'Localidades');
  assert.equal(localReferences(context,{code:'00002'}).heading,'Parroquias');
});

test('homepage coverage links include more towns across all provinces and retain the Corredor del Henares',()=>{
  const slugs=[...new Set(towns.map(town=>town.provinceSlug))];
  const selected=slugs.flatMap(slug=>{
    const members=towns.filter(town=>town.provinceSlug===slug);
    const featured=featuredTownsForProvince({slug,towns:members});
    assert.ok(featured.length>=10);
    assert.ok(featured.every(town=>town.provinceSlug===slug));
    return featured;
  });
  assert.equal(selected.length,192);
  assert.equal(new Set(selected.map(town=>town.code)).size,192);
  for(const code of ['28130','28049','28148'])assert.ok(selected.some(town=>town.code===code));
});

test('all displayed references retain an attributable source and a category independent of their name',()=>{
  const ctx={streets,streetMunicipalities,localities};
  for(const town of towns){
    const data=localReferences(ctx,town);
    assert.ok(data.count>0,`${town.name}: faltan referencias locales documentadas`);
    assert.ok(data.sources.every(source=>source?.id && source.url),town.code);
    assert.equal(new Set(data.streets.map(street=>street.name.normalize('NFC').toLocaleLowerCase('es').replace(/\s+/g,' ').trim())).size,data.streets.length,town.code);
    assert.ok(data.areas.every(place=>place.type!=='street'));
  }
});
