import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {townPage} from '../scripts/pages.mjs';
import {hash} from '../scripts/utils.mjs';

const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
const ctx={config:read('site'),towns:read('municipalities'),brands:read('brands'),audio:read('audio-entry'),services:read('services'),diagnostics:read('diagnostics'),faqs:read('faqs'),localFocus:read('local-focus'),localities:read('localities'),streets:read('streets'),streetMunicipalities:{},duplicateTownNames:new Set()};
ctx.provinces=[...new Set(ctx.towns.map(t=>t.provinceSlug))].map(slug=>({slug,name:ctx.towns.find(t=>t.provinceSlug===slug).province}));
for(const file of Object.values(ctx.streets.files))Object.assign(ctx.streetMunicipalities,read(file.replace(/\.json$/,'')).municipalities);

test('every town keeps its decision blocks together, geographic references beside contact and nearby towns last',()=>{
  for(const town of ctx.towns){
    const page=townPage(ctx,town,ctx.towns.filter(t=>t.code!==town.code).slice(0,3));
    const html=page.body;
    const focus=ctx.localFocus[hash(town.code)%ctx.localFocus.length];
    const repair=['averias-audio','averias-imagen','averias-apertura','reparar-o-renovar'].includes(focus.id);
    const orientation=html.indexOf('Para orientar tu instalación');
    const diagnosis=html.indexOf('id="averias"');
    const equipment=html.indexOf('Equipos y compatibilidad');
    const questions=html.indexOf('Preguntas antes de instalar');
    const contact=html.indexOf('id="consulta"');
    assert.ok(repair?diagnosis<orientation:equipment<diagnosis,town.code);
    assert.ok(orientation<equipment&&equipment<questions&&questions<contact,town.code);
    const geography=html.indexOf('id="barrios"');
    if(geography>=0)assert.ok(questions<geography&&geography<contact,town.code);
    assert.equal((html.match(/id="averias"/g)||[]).length,1,town.code);
    assert.equal((html.match(/id="consulta"/g)||[]).length,1,town.code);
    assert.equal(page.faqs.length,4,town.code);
    assert.equal(new Set(page.faqs.map(f=>f.id)).size,4,town.code);
    assert.ok(page.faqs.filter(f=>focus.faqIds.includes(f.id)).length>=2,town.code);
    assert.equal(new Set(page.selection.brands).size,3,town.code);
    assert.ok(page.selection.services.includes(focus.serviceIds[0]),town.code);
    assert.doesNotMatch(html,/Caso orientativo para preparar la consulta|undefined/,town.code);
  }
});
