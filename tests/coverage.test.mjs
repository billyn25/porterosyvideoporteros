import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCoverage,coveragePolicy} from '../scripts/coverage.mjs';
import {townPath} from '../scripts/utils.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../${name}`,import.meta.url),'utf8'));
test('every municipality has a nearby same-province destination and larger towns keep their own page',()=>{
  const towns=read('data/municipalities.json');const {selected,assignments}=buildCoverage(towns);
  assert.equal(assignments.size,towns.length);
  for(const town of towns){
    const {hub,distanceKm}=assignments.get(town.code);
    assert.equal(town.provinceSlug,hub.provinceSlug);
    assert.ok(distanceKm<=coveragePolicy.maxDistanceKm);
    assert.ok(selected.includes(hub));
    if(town.population>=coveragePolicy.minimumPopulation)assert.equal(hub.code,town.code);
    if(town.code!==hub.code)assert.ok(townPath(town).endsWith(`#cobertura-${town.slug}`));
  }
});
test('built migration has permanent direct redirects, searchable anchors and only retained sitemap URLs',()=>{
  const towns=read('data/municipalities.json');const {selected,assignments}=buildCoverage(towns);
  const redirects=fs.readFileSync(new URL('../dist/_redirects',import.meta.url),'utf8').trim().split('\n').map(l=>l.split(/\s+/));
  assert.equal(redirects.length,towns.length-selected.length);
  const sitemap=fs.readdirSync(new URL('../dist/',import.meta.url)).filter(n=>/^sitemap-.*\.xml$/.test(n)).map(n=>fs.readFileSync(new URL(`../dist/${n}`,import.meta.url),'utf8')).join('');
  for(const [from,to,status] of redirects){
    assert.equal(status,'301!');assert.notEqual(from,to);
    assert.ok(!sitemap.includes(`<loc>https://instalacionvideoporterourgente.com${from}</loc>`));
    assert.ok(sitemap.includes(`<loc>https://instalacionvideoporterourgente.com${to}</loc>`));
  }
  for(const {town,hub} of assignments.values()){
    const html=fs.readFileSync(new URL(`../dist${townPath(hub)}index.html`,import.meta.url),'utf8');
    if(town.code!==hub.code)assert.ok(html.includes(`id="cobertura-${town.slug}"`));
  }
});
