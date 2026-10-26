import test from 'node:test';
import assert from 'node:assert/strict';
import {sitePolicy} from '../scripts/site-policy.mjs';
const config={siteUrl:'https://instalacionvideoporterourgente.com'};

test('production uses the declared domain even when the host supplies a Netlify URL',()=>{
  const policy=sitePolicy(config,{CONTEXT:'production',URL:'https://site-preview.netlify.app'});
  assert.equal(policy.baseUrl,config.siteUrl);
  assert.equal(policy.indexable,true);
});
test('branch and deploy previews cannot become indexable with the commercial canonical',()=>{
  for(const context of ['deploy-preview','branch-deploy','dev'])assert.equal(sitePolicy(config,{CONTEXT:context}).indexable,false);
});
test('an old SITE_URL cannot silently publish foreign canonical URLs in production',()=>{
  assert.throws(()=>sitePolicy(config,{CONTEXT:'production',SITE_URL:'https://old-site.netlify.app'}),/origen HTTPS comercial/);
  assert.equal(sitePolicy(config,{SITE_URL:'https://porteros.example'}).indexable,false);
  assert.equal(sitePolicy({},{}).indexable,false);
});
