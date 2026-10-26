import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contactForProvince,validateContacts} from '../scripts/contact.mjs';
import {phoneDigits,selectDiagnostics} from '../scripts/utils.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
const config=read('site');
const towns=read('municipalities');
const provinces=[...new Set(towns.map(town=>town.provinceSlug))].map(slug=>({slug}));

test('Madrid, Guadalajara and Toledo route to the central number; every other covered province routes north',()=>{
  validateContacts(config,provinces);
  for(const province of provinces){
    const expected=['madrid','guadalajara','toledo'].includes(province.slug)?'34614789945':'34670042626';
    const contact=contactForProvince(config,province.slug);
    assert.equal(phoneDigits(contact.phone),expected,province.slug);
    assert.equal(phoneDigits(contact.whatsapp),expected,province.slug);
  }
  assert.equal(contactForProvince(config,''),null);
  assert.equal(contactForProvince(config,'una-provincia-no-cubierta'),null);
});

test('contact configuration rejects missing, overlapping or unknown province assignments',()=>{
  const missing=structuredClone(config);missing.contactAreas[0].provinceSlugs.pop();
  assert.throws(()=>validateContacts(missing,provinces),/sin teléfono/);
  const duplicate=structuredClone(config);duplicate.contactAreas[1].provinceSlugs.push('madrid');
  assert.throws(()=>validateContacts(duplicate,provinces),/dos zonas/);
  const unknown=structuredClone(config);unknown.contactAreas[0].provinceSlugs.push('desconocida');
  assert.throws(()=>validateContacts(unknown,provinces),/desconocida/);
});

test('a local diagnostic selection includes a relevant case and distinct symptom types without changing on reload',()=>{
  const cases=read('diagnostics');const focus=read('local-focus')[0];
  const selected=selectDiagnostics(cases,focus.diagnosticIds,'33044:diagnostics',4);
  assert.equal(selected.length,4);
  assert.ok(selected.some(item=>focus.diagnosticIds.includes(item.id)));
  assert.equal(new Set(selected.map(item=>item.id)).size,4);
  assert.equal(new Set(selected.map(item=>item.topic || item.scope)).size,4);
  assert.deepEqual(selected,selectDiagnostics(cases,focus.diagnosticIds,'33044:diagnostics',4));
});

test('local geographic references belong to the exact municipality and retain their source identity',()=>{
  const data=read('localities');
  assert.equal(data.schemaVersion,2);
  const types=new Set(['neighborhood','district','residential-area','parish']);
  for(const [code,record] of Object.entries(data.municipalities)){
    const town=towns.find(item=>item.code===code);assert.ok(town,code);
    assert.equal(record.name,town.name);assert.equal(record.provinceSlug,town.provinceSlug);
    assert.ok(record.areas.length>0);
    assert.equal(new Set(record.areas.map(item=>item.name.toLocaleLowerCase('es'))).size,record.areas.length);
    for(const area of record.areas){
      assert.ok(types.has(area.type),`${code}: ${area.type}`);
      assert.ok(area.name.trim());
      const source=data.sources[area.sourceId];assert.ok(source,area.sourceId);
      assert.ok(source.municipalityCodes.includes(code),`${code}: fuente de otro municipio`);
      assert.ok(source.publisher.startsWith('Ayuntamiento de '));
      assert.equal(new URL(source.url).protocol,'https:');
      assert.ok(source.evidence && source.retrievedAt);
      assert.doesNotMatch(source.url,/ine\.es|nomencl/i);
      assert.doesNotMatch(area.name,/pol[ií]gono|industrial|camping|aeropuerto|campo de golf/i);
    }
  }
  assert.equal(new Set(Object.values(data.municipalities).map(record=>record.provinceSlug)).size,19);
  assert.ok(data.municipalities['33044'].areas.some(area=>area.name==='La Corredoria' && area.type==='neighborhood'));
  assert.ok(data.municipalities['28079'].areas.some(area=>area.name==='Embajadores' && area.type==='neighborhood'));
  assert.ok(data.municipalities['28092'].areas.every(area=>area.type==='district'));
});
