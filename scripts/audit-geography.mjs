import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {escapeHtml,townPath} from './utils.mjs';
import {localReferences} from './local-geography.mjs';
import {featuredTownsForProvince} from './featured-towns.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',`${name}.json`),'utf8'));
const towns=read('municipalities'),streets=read('streets'),localities=read('localities');
const ctx={streets,localities,streetMunicipalities:Object.assign({},...Object.values(streets.files).map(file=>read(file.slice(0,-5)).municipalities))};
const report={auditedAt:new Date().toISOString(),source:streets.source,summary:{municipalities:towns.length,municipalitiesWithReferences:0,municipalitiesWithStreetSelection:0,municipalitiesWithLocalAreaSelection:0,displayedStreets:0,displayedAreas:0,displayedReferences:0,homepageMunicipalityLinks:0},byProvince:{},byType:{},missing:[],errors:[],municipalities:[]};
for(const town of towns){
  const data=localReferences(ctx,town);
  const filename=path.join(root,'dist',townPath(town),'index.html');
  const html=fs.readFileSync(filename,'utf8');
  const block=html.match(/<section\b[^>]*\bdata-audit-geography\b[^>]*>([\s\S]*?)<\/section>/)?.[0] || '';
  const error=message=>report.errors.push({code:town.code,town:town.name,message});
  if(data.count){
    report.summary.municipalitiesWithReferences++;
    if(!block)error('No se muestra el bloque local documentado.');
    if([...block.matchAll(/data-locality-choice=/g)].length!==data.count)error('El número de enlaces visibles o desplegables no coincide con las referencias.');
    for(const place of data.places){
      const attrs=`data-locality-choice="${escapeHtml(place.name)}" data-locality-town="${escapeHtml(town.name)}" data-locality-province="${escapeHtml(town.provinceSlug)}"`;
      if(!block.includes(attrs))error(`No aparece la referencia con su municipio: ${place.name}`);
      report.byType[place.type]=(report.byType[place.type] || 0)+1;
    }
    for(const source of data.sources)if(!block.includes(`href="${escapeHtml(source.url)}"`))error(`No aparece la fuente: ${source.id}`);
    if(!html.includes(`href="#barrios">${escapeHtml(data.jumpLabel)}`))error('Falta el acceso al bloque local desde la presentación.');
  }else{
    report.missing.push({code:town.code,name:town.name,province:town.province});
    if(block)error('Aparece un bloque sin referencias documentadas.');
  }
  if(data.streets.length)report.summary.municipalitiesWithStreetSelection++;
  if(data.areas.length)report.summary.municipalitiesWithLocalAreaSelection++;
  report.summary.displayedStreets+=data.streets.length;
  report.summary.displayedAreas+=data.areas.length;
  report.summary.displayedReferences+=data.count;
  const province=report.byProvince[town.provinceSlug] ||= {name:town.province,municipalities:0,withReferences:0,withStreets:0,withAreas:0,references:0};
  province.municipalities++;province.withReferences+=Number(data.count>0);province.withStreets+=Number(data.streets.length>0);province.withAreas+=Number(data.areas.length>0);province.references+=data.count;
  report.municipalities.push({code:town.code,name:town.name,provinceSlug:town.provinceSlug,streets:data.streets.length,areas:data.areas.length,total:data.count,route:townPath(town)});
}
const home=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const homeBlock=home.match(/<div class="coverage-index"[\s\S]*?(?=<\/div><\/section>)/)?.[0] || '';
const expected=[...new Set(towns.map(town=>town.provinceSlug))].flatMap(slug=>featuredTownsForProvince({slug,towns:towns.filter(town=>town.provinceSlug===slug)}));
for(const town of expected)if(!homeBlock.includes(`href="${townPath(town)}"`))report.errors.push({code:town.code,town:town.name,message:'El municipio destacado no aparece enlazado en el directorio de portada.'});
const actualLinks=[...homeBlock.matchAll(/href="(\/porteros-videoporteros\/[^/]+\/[^/]+\/)"/g)].map(match=>match[1]);
report.summary.homepageMunicipalityLinks=new Set(actualLinks).size;
if(actualLinks.length!==new Set(actualLinks).size)report.errors.push({message:'El directorio de portada repite enlaces municipales.'});
if(actualLinks.length!==expected.length)report.errors.push({message:'La cantidad de enlaces municipales de portada no coincide con la selección.'});
report.summary.incompleteMunicipalities=report.missing.length;
report.success=report.errors.length===0 && report.missing.length===0;
fs.mkdirSync(path.join(root,'qa'),{recursive:true});
fs.writeFileSync(path.join(root,'qa/geography-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({success:report.success,...report.summary,errors:report.errors.length},null,2));
if(report.errors.length)console.error(JSON.stringify(report.errors.slice(0,12),null,2));
if(!report.success)process.exitCode=1;
