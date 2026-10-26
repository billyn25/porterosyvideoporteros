import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {escapeHtml as e,nearbyTowns,phoneDigits} from './utils.mjs';
import {sitePolicy} from './site-policy.mjs';
import {pageLayout} from './components.mjs';
import {validateContacts} from './contact.mjs';
import {homepage,servicesIndex,servicePage,brandsIndex,brandPage,zonesIndex,provincePage,townPage,guidesIndex,guidePage,diagnosticsIndex,supportPages} from './pages.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',`${name}.json`),'utf8'));
const config=read('site');
config.phone=process.env.CONTACT_PHONE || config.phone;
config.whatsapp=process.env.CONTACT_WHATSAPP || config.whatsapp;
config.email=process.env.CONTACT_EMAIL || config.email;
config.legalName=process.env.LEGAL_NAME || config.legalName;
for(const area of config.contactAreas || []) {
  const suffix=area.id.toUpperCase();
  area.phone=process.env[`CONTACT_PHONE_${suffix}`] || area.phone;
  area.whatsapp=process.env[`CONTACT_WHATSAPP_${suffix}`] || area.whatsapp;
}
for(const field of ['phone','whatsapp']){
  if(!config[field])continue;
  const digits=phoneDigits(config[field]);
  if(!/^34\d{9}$/.test(digits))throw new Error(`${field}: usa el prefijo +34 y nueve cifras.`);
}
const {baseUrl,indexable}=sitePolicy(config,process.env);
const towns=read('municipalities');
const provinceOrder=['asturias','cantabria','bizkaia','gipuzkoa','leon','palencia','alava','navarra','zamora','valladolid','burgos','la-rioja','salamanca','avila','segovia','soria','toledo','madrid','guadalajara'];
const provinces=provinceOrder.map(slug=>{const members=towns.filter(t=>t.provinceSlug===slug);if(!members.length)throw new Error(`Provincia vacía: ${slug}`);return {slug,name:members[0].province,code:members[0].provinceCode,towns:members};});
validateContacts(config,provinces);
const counts=new Map();for(const town of towns)counts.set(town.name,(counts.get(town.name)||0)+1);
const duplicateTownNames=new Set([...counts].filter(([,count])=>count>1).map(([name])=>name));
const assets=['public/assets/site.css','public/assets/site.js'].map(p=>fs.readFileSync(path.join(root,p)));
const assetVersion=createHash('sha256').update(Buffer.concat(assets)).digest('hex').slice(0,10);
const ctx={config,baseUrl,indexable,towns,provinces,duplicateTownNames,assetVersion,year:new Date().getUTCFullYear(),brands:read('brands'),hero:read('hero'),audio:read('audio-entry'),legal:read('legal'),services:read('services'),diagnostics:read('diagnostics'),faqs:read('faqs'),guides:read('guides'),localFocus:read('local-focus'),localities:read('localities')};
if(ctx.legal.owner!==config.legalName || ctx.legal.domain!==config.siteUrl)throw new Error('La titularidad y el dominio deben coincidir en site.json y legal.json.');
if(ctx.brands.length!==7 || provinces.length!==19)throw new Error('Cobertura de marcas/provincias incompleta.');

fs.mkdirSync(out,{recursive:true});
for(const name of fs.readdirSync(out))fs.rmSync(path.join(out,name),{recursive:true,force:true});
fs.cpSync(path.join(root,'public'),out,{recursive:true});
const pageRecords=[];const usedPaths=new Set();
function writePage(page){
  if(usedPaths.has(page.path))throw new Error(`Ruta duplicada: ${page.path}`);
  if(!page.path.startsWith('/')||page.path.includes('..'))throw new Error(`Ruta inválida: ${page.path}`);
  usedPaths.add(page.path);
  const filename=page.path.endsWith('.html')?page.path.slice(1):`${page.path.slice(1)}index.html`;
  const target=path.join(out,filename);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,pageLayout(ctx,page));
  pageRecords.push({path:page.path,title:page.title,description:page.description,kind:page.kind,indexable:indexable&&!page.noindex,focusId:page.focusId,selection:page.selection});
}
writePage(homepage(ctx));writePage(servicesIndex(ctx));writePage(brandsIndex(ctx));writePage(zonesIndex(ctx));writePage(guidesIndex(ctx));writePage(diagnosticsIndex(ctx));
for(const s of ctx.services)writePage(servicePage(ctx,s));
for(const b of ctx.brands)writePage(brandPage(ctx,b));
for(const g of ctx.guides)writePage(guidePage(ctx,g));
for(const p of provinces)writePage(provincePage(ctx,p));
for(const town of towns)writePage(townPage(ctx,town,nearbyTowns(town,towns)));
for(const page of supportPages(ctx))writePage(page);

const search=towns.map(t=>({name:t.name,province:t.province,provinceSlug:t.provinceSlug,aliases:t.aliases||[],population:t.population||0,url:`/porteros-videoporteros/${t.provinceSlug}/${t.slug}/`}));
fs.writeFileSync(path.join(out,'search-index.json'),JSON.stringify(search));
const sitemapFiles=[];
if(baseUrl){
  const sitemap=(name,pages)=>{
    const entries=pages.filter(p=>p.indexable).map(p=>`<url><loc>${e(baseUrl+p.path)}</loc></url>`).join('');
    fs.writeFileSync(path.join(out,name),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`);
    sitemapFiles.push(name);
  };
  sitemap('sitemap-general.xml',pageRecords.filter(p=>p.kind!=='town'&&p.kind!=='province'));
  for(const province of provinces)sitemap(`sitemap-${province.slug}.xml`,pageRecords.filter(p=>p.path.startsWith(`/porteros-videoporteros/${province.slug}/`)));
  fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapFiles.map(file=>`<sitemap><loc>${e(`${baseUrl}/${file}`)}</loc></sitemap>`).join('')}</sitemapindex>`);
}
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n${baseUrl&&indexable?`\nSitemap: ${baseUrl}/sitemap.xml\n`:''}`);
if(!indexable)fs.writeFileSync(path.join(out,'_headers'),'/*\n  X-Robots-Tag: noindex, follow\n');
fs.mkdirSync(path.join(root,'qa'),{recursive:true});
const report={generatedAt:new Date().toISOString(),baseUrl,indexable,stats:{pages:pageRecords.length,municipalities:towns.length,provinces:provinces.length,brands:ctx.brands.length,services:ctx.services.length,guides:ctx.guides.length,indexablePages:pageRecords.filter(p=>p.indexable).length},contactConfigured:Boolean(config.phone||config.whatsapp||config.email||config.contactAreas?.length),ownerProvided:Boolean(config.legalName),pages:pageRecords};
fs.writeFileSync(path.join(root,'qa','build-report.json'),JSON.stringify(report,null,2));
console.log(`Generadas ${pageRecords.length} páginas: ${towns.length} municipios, ${provinces.length} provincias, ${ctx.services.length} servicios, ${ctx.brands.length} marcas y ${ctx.guides.length} guías.`);
console.log(baseUrl?`Origen: ${baseUrl}. Indexación: ${indexable?'activada':'desactivada en revisión'}.`:'Build sin origen comercial: noindex.');
