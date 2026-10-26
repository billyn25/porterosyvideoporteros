import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {auditSite, robotsAllows, robotsRules} from '../scripts/audit-seo.mjs';

const origin = 'https://instalacionvideoporterourgente.com';
function documentFor(route,{title=route,body='',noindex=false,canonical=origin+route}={}) {
  return `<!doctype html><html lang="es"><head><title>${title}</title><meta name="description" content="Descripción de ${title}"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${noindex?'noindex':'index'},follow"><link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${title}"><meta property="og:description" content="Descripción de ${title}"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebPage',url:canonical}]})}</script></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
}
function fixture(t, pages) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(),'porteros-seo-'));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  for(const [route,html] of Object.entries(pages)) {
    const file = path.join(directory,route.endsWith('/')?route+'index.html':route);
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);
  }
  fs.writeFileSync(path.join(directory,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  fs.writeFileSync(path.join(directory,'sitemap.xml'),`<urlset>${Object.entries(pages).filter(([,html])=>!html.includes('content="noindex')).map(([route])=>`<url><loc>${origin+route}</loc></url>`).join('')}</urlset>`);
  return directory;
}

test('robots honors Googlebot-specific groups and most specific matching allow',()=>{
  const rules=robotsRules('User-agent: *\nDisallow: /\nUser-agent: Googlebot\nDisallow: /privado/\nAllow: /privado/publico/\nDisallow: /*.pdf$\n');
  assert.equal(robotsAllows('/',rules),true);
  assert.equal(robotsAllows('/privado/documento/',rules),false);
  assert.equal(robotsAllows('/privado/publico/',rules),true);
  assert.equal(robotsAllows('/archivo.pdf',rules),false);
  assert.equal(robotsAllows('/archivo.pdf/resumen/',rules),true);
});

test('audit traverses crawlable static links and excludes noindex 404 from orphan errors',t=>{
  const directory=fixture(t,{
    '/':documentFor('/',{title:'Inicio',body:'<a href="/servicios/">Servicios</a>'}),
    '/servicios/':documentFor('/servicios/',{title:'Servicios',body:'<a href="/servicios/audio/">Audio</a>'}),
    '/servicios/audio/':documentFor('/servicios/audio/',{title:'Audio'}),
    '/404.html':documentFor('/404.html',{title:'No encontrada',noindex:true}),
  });
  const result=auditSite({directory,origin});
  assert.equal(result.errorCount,0);
  assert.equal(result.crawl.maxDepth,2);
  assert.equal(result.crawl.indexableOrphans,0);
  assert.equal(result.scope.noindexPages,1);
  assert.equal(result.pages.find(p=>p.route==='/servicios/audio/').depth,2);
});

test('production audit rejects stale canonical domains and indexing blocks',t=>{
  const directory=fixture(t,{'/':documentFor('/',{title:'Inicio',canonical:'https://preview.example/'})});
  fs.writeFileSync(path.join(directory,'_headers'),'/*\n  X-Robots-Tag: noindex, follow\n');
  const result=auditSite({directory,origin});
  assert.equal(result.success,false);
  assert.ok(result.findings.some(f=>f.code==='CANONICAL_ORIGIN'));
  assert.ok(result.findings.some(f=>f.code==='HEADER_NOINDEX'));
});

test('nofollow cannot hide an orphan and high-priority lazy images are reported',t=>{
  const directory=fixture(t,{
    '/':documentFor('/',{title:'Inicio',body:'<a href="/oculta/" rel="nofollow">Oculta</a><img src="/equipo.svg" fetchpriority="high" loading="lazy">'}),
    '/oculta/':documentFor('/oculta/',{title:'Oculta'}),
  });
  fs.writeFileSync(path.join(directory,'equipo.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>');
  const result=auditSite({directory,origin});
  assert.equal(result.crawl.indexableUnreachable,1);
  assert.equal(result.crawl.indexableOrphans,1);
  for(const code of ['IMAGE_ALT','IMAGE_SIZE','LAZY_PRIORITY','UNREACHABLE'])assert.ok(result.findings.some(f=>f.code===code),code);
});
