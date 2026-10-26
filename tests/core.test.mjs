import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeOrigin,nearbyTowns,choose,townPath,provincePath,escapeHtml,jsonScript} from '../scripts/utils.mjs';
test('canonical origin rejects paths, credentials and unsupported protocols',()=>{
  assert.equal(normalizeOrigin('https://PORTEROS.example/'),'https://porteros.example');
  assert.equal(normalizeOrigin(''),'');
  for(const url of ['https://porteros.example/pueblo/','https://user:secret@porteros.example','javascript:alert(1)','https://porteros.example?preview=true'])assert.throws(()=>normalizeOrigin(url));
});
test('nearby towns exclude the current municipality and use geographic distance',()=>{
  const town={code:'1',lat:43,lon:-3};
  const near={code:'3',lat:43.01,lon:-3};const far={code:'2',lat:40,lon:-4};
  assert.deepEqual(nearbyTowns(town,[far,town,near],2).map(t=>t.code),['3','2']);
});
test('editorial selection stays stable across builds and has no repeated entries',()=>{
  const items=Array.from({length:16},(_,i)=>({id:String(i)}));
  assert.deepEqual(choose(items,'33044',4),choose(items,'33044',4));
  assert.equal(new Set(choose(items,'33044',4).map(x=>x.id)).size,4);
  assert.notDeepEqual(choose(items,'33044',4),choose(items,'28079',4));
});
test('municipal names cannot escape HTML or structured data',()=>{
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
  assert.equal(jsonScript({name:'</script>'}).includes('</script>'),false);
  assert.equal(townPath({provinceSlug:'madrid',slug:'alcala-de-henares'}),'/porteros-videoporteros/madrid/alcala-de-henares/');
  assert.equal(provincePath({provinceSlug:'madrid',slug:'alcala-de-henares'}),'/porteros-videoporteros/madrid/');
});
