import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { contactForProvince } from './contact.mjs';
import { phoneDigits } from './utils.mjs';

// Validate the generated site, without network requests or additional packages.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const started = performance.now();
const contactConfig=JSON.parse(fs.readFileSync(path.join(root,'data/site.json'),'utf8'));
contactConfig.phone=process.env.CONTACT_PHONE || contactConfig.phone;
contactConfig.whatsapp=process.env.CONTACT_WHATSAPP || contactConfig.whatsapp;
for(const area of contactConfig.contactAreas || []){
  area.phone=process.env[`CONTACT_PHONE_${area.id.toUpperCase()}`] || area.phone;
  area.whatsapp=process.env[`CONTACT_WHATSAPP_${area.id.toUpperCase()}`] || area.whatsapp;
}
const expectedAssetVersion=createHash('sha256').update(Buffer.concat(['site.css','site.js'].map(name=>fs.readFileSync(path.join(dist,'assets',name))))).digest('hex').slice(0,10);
const errors = [];
const warnings = [];
const files = new Set();
const pages = new Map();
const canonicalOrigins = new Set();
const checkedTargets = new Map();
const seenIssues = new Map();
const localOrigin = 'https://validation.invalid';
const stats = {
  htmlPages: 0, indexablePages: 0, noindexPages: 0, municipalityPages: 0,
  provinces: 0, linksChecked: 0, resourceReferencesChecked: 0,
  jsonLdBlocks: 0, sitemapFiles: 0, sitemapUrls: 0,
};

function issue(level, code, message, file, details = {}) {
  const rel = file ? path.relative(dist, file).replaceAll(path.sep, '/') : '';
  const repeatedTarget = ['BROKEN_LINK', 'MISSING_RESOURCE', 'BROKEN_ANCHOR'].includes(code)
    ? `${details.target ?? ''}:${details.anchor ?? ''}` : rel;
  const key = `${level}:${code}:${repeatedTarget}:${message}:${details.description ?? ''}`;
  const previous = seenIssues.get(key);
  if (previous) {
    previous.occurrences += 1;
    if (rel && !previous.examples.includes(rel) && previous.examples.length < 8) previous.examples.push(rel);
    return;
  }
  const record = { code, message, file: rel || undefined, occurrences: 1, examples: rel ? [rel] : [], ...details };
  seenIssues.set(key, record);
  (level === 'error' ? errors : warnings).push(record);
}

function decodeEntities(value = '') {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, entity) => {
    if (entity.startsWith('#')) {
      const point = entity[1].toLowerCase() === 'x' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : whole;
    }
    return named[entity.toLowerCase()] ?? whole;
  });
}

function attrs(source) {
  const result = Object.create(null);
  const pattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  return result;
}

function cleanText(value = '') {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filename);
    else if (entry.isFile()) files.add(filename);
  }
}

function routeFor(filename) {
  let route = '/' + path.relative(dist, filename).split(path.sep).join('/');
  if (route.endsWith('/index.html')) route = route.slice(0, -10);
  return route;
}

function srcsetUrls(value) {
  // Generated srcsets contain ordinary image URLs, not data-URL lists.
  if (/^\s*data:/i.test(value)) return [];
  return value.split(',').map(candidate => candidate.trim().split(/\s+/)[0]).filter(Boolean);
}

function parsePage(filename) {
  const html = fs.readFileSync(filename, 'utf8');
  const record = { file: filename, route: routeFor(filename), title: '', description: '', ids: new Set(), links: [], resources: [], canonical: null, indexable: true };
  for(const name of ['site.css','site.js']){
    if(!html.includes(`/assets/${name}?v=${expectedAssetVersion}`))issue('error','MIXED_BUILD','La versión del HTML no coincide con los recursos del build.',filename);
  }
  const pageProvince=record.route.startsWith('/porteros-videoporteros/')?record.route.split('/')[2]:'';
  const pageContact=contactForProvince(contactConfig,pageProvince) || contactConfig;
  const footer=html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1] || '';
  if(!footer.includes(`data-footer-primary="${phoneDigits(pageContact.phone)}"`) || !footer.includes(`href="tel:+${phoneDigits(pageContact.phone)}"`))issue('error','FOOTER_PHONE','El pie no muestra el teléfono principal de la página.',filename);
  if(!footer.includes(`href="https://wa.me/${phoneDigits(pageContact.whatsapp)}"`))issue('error','FOOTER_WHATSAPP','Falta el enlace directo de WhatsApp en el pie.',filename);
  if(!footer.includes('/assets/coverage-spain.svg'))issue('error','FOOTER_MAP','Falta el mapa de cobertura en el pie.',filename);
  const header=html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1] || '';
  if(!header.includes('Urgencias 24 horas'))issue('error','EMERGENCY_HEADER','Falta la franja superior de urgencias.',filename);
  if(!header.includes(`href="https://wa.me/${phoneDigits(pageContact.whatsapp)}"`))issue('error','HEADER_WHATSAPP','WhatsApp de cabecera no corresponde a la zona.',filename);
  if(record.route.startsWith('/porteros-videoporteros/')){
    const slug=record.route.split('/')[2];
    const contact=contactForProvince(contactConfig,slug);
    if(contact){
      if(!html.includes(`href="tel:+${phoneDigits(contact.phone)}"`))issue('error','CONTACT_PHONE','Falta el teléfono correspondiente a la provincia.',filename);
      const form=attrs(html.match(/<form\b([^>]*\bdata-query-form\b[^>]*)>/)?.[1] || '');
      if(form['data-whatsapp']!==phoneDigits(contact.whatsapp))issue('error','CONTACT_WHATSAPP','WhatsApp no corresponde a la provincia.',filename);
      const selected=html.match(/<select[^>]+id="consulta-provincia"[^>]*>([\s\S]*?)<\/select>/)?.[1]?.match(/<option\s+value="([^"]+)"[^>]*\bselected\b/);
      if(selected?.[1]!==slug)issue('error','CONTACT_PROVINCE','El formulario no selecciona la provincia de la página.',filename);
    }
  }
  const body = html.replace(/<!--[\s\S]*?-->/g, '');
  for (const match of body.matchAll(/<script\b([^>]*?)>([\s\S]*?)<\/script\s*>/gi)) {
    if (attrs(match[1]).type?.toLowerCase() !== 'application/ld+json') continue;
    stats.jsonLdBlocks += 1;
    try {
      const parsed = JSON.parse(match[2].trim());
      if (!parsed || typeof parsed !== 'object') throw new Error('El contenido debe ser un objeto o una lista JSON.');
    } catch (error) {
      issue('error', 'INVALID_JSON_LD', `JSON-LD inválido: ${error.message}`, filename);
    }
  }
  // Do not interpret HTML-looking strings inside JavaScript, JSON-LD or CSS as real tags.
  const structure = body.replace(/<(script|style)\b([^>]*?)>[\s\S]*?<\/\1\s*>/gi, '<$1$2></$1>');
  let h1Count = 0;
  let htmlCount = 0;
  let descriptionCount = 0;
  let canonicalCount = 0;
  const titleMatches = [...structure.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
  record.title = cleanText(titleMatches[0]?.[1]);
  if (titleMatches.length !== 1 || !record.title) issue('error', 'TITLE', 'La página debe tener un único title no vacío.', filename);

  const tagPattern = /<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
  for (const match of structure.matchAll(tagPattern)) {
    const tag = match[1].toLowerCase();
    const a = attrs(match[2]);
    if (tag === 'h1') h1Count += 1;
    if (tag === 'html') {
      htmlCount += 1;
      if (!/^es(?:-|$)/i.test(a.lang ?? '')) issue('error', 'LANGUAGE', 'El documento debe declarar lang="es".', filename);
    }
    if ('id' in a) {
      if (record.ids.has(a.id)) issue('error', 'DUPLICATE_ID', `ID duplicado: ${a.id || '(vacío)'}.`, filename);
      record.ids.add(a.id);
    }
    if (tag === 'meta') {
      if (a.name?.toLowerCase() === 'description') {
        descriptionCount += 1;
        record.description = cleanText(a.content);
      }
      if (/^(robots|googlebot)$/i.test(a.name ?? '') && /\bnoindex\b/i.test(a.content ?? '')) record.indexable = false;
    }
    if (tag === 'link' && /(?:^|\s)canonical(?:\s|$)/i.test(a.rel ?? '')) {
      canonicalCount += 1;
      record.canonical = a.href || '';
    }
    if ((tag === 'a' || tag === 'area') && a.href !== undefined) record.links.push(a.href);
    if (tag === 'form' && a.action) record.links.push(a.action);
    if (tag === 'img' && !a.src && !a.srcset) issue('error', 'IMAGE_SOURCE', 'Imagen sin src ni srcset.', filename);
    if (['img', 'script', 'source', 'video', 'audio', 'track', 'iframe', 'embed', 'input'].includes(tag) && a.src) record.resources.push(a.src);
    if ((tag === 'image' || tag === 'use') && (a.href || a['xlink:href'])) record.resources.push(a.href || a['xlink:href']);
    if (tag === 'video' && a.poster) record.resources.push(a.poster);
    if ((tag === 'img' || tag === 'source') && a.srcset) record.resources.push(...srcsetUrls(a.srcset));
    if (tag === 'object' && a.data) record.resources.push(a.data);
    if (tag === 'link' && a.href && /(?:^|\s)(stylesheet|icon|apple-touch-icon|preload|modulepreload|manifest)(?:\s|$)/i.test(a.rel ?? '')) record.resources.push(a.href);
  }
  if (htmlCount !== 1) issue('error', 'HTML_ROOT', 'El documento debe contener una única etiqueta html.', filename);
  if (h1Count !== 1) issue('error', 'H1', `Se esperaba un h1 y hay ${h1Count}.`, filename);
  if (descriptionCount !== 1 || !record.description) issue('error', 'DESCRIPTION', 'La página debe tener una única meta description no vacía.', filename);
  if (canonicalCount > 1) issue('error', 'MULTIPLE_CANONICALS', 'La página contiene más de una canonical.', filename);
  if (record.canonical !== null) validateCanonical(record);
  stats.htmlPages += 1;
  stats[record.indexable ? 'indexablePages' : 'noindexPages'] += 1;
  pages.set(filename, record);
}

function validateCanonical(record) {
  try {
    const url = new URL(record.canonical);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('debe ser una URL HTTP(S) absoluta');
    canonicalOrigins.add(url.origin);
    if (url.search || url.hash) throw new Error('no puede contener query ni fragmento');
    const decodedPath = decodeURIComponent(url.pathname);
    if (decodedPath !== record.route) throw new Error(`la ruta ${decodedPath} no coincide con ${record.route}`);
    if (decodedPath !== decodedPath.toLowerCase()) throw new Error('la ruta debe ir en minúsculas');
    if (record.route.endsWith('/') && !url.pathname.endsWith('/')) throw new Error('falta la barra final');
    if (record.canonical !== record.canonical.trim()) throw new Error('contiene espacios exteriores');
    if (record.canonical !== url.href) throw new Error('la URL no está normalizada');
  } catch (error) {
    issue('error', 'CANONICAL', `Canonical inválida: ${error.message}.`, record.file, { canonical: record.canonical });
  }
}

function resolveTarget(raw, fromFile) {
  const reference = raw.trim();
  if (!reference || /^(?:mailto|tel|sms|whatsapp|javascript|data|blob):/i.test(reference)) return { ignore: true };
  const base = localOrigin + routeFor(fromFile);
  let url;
  try { url = new URL(reference, base); } catch { return { invalid: true }; }
  if (!['http:', 'https:'].includes(url.protocol)) return { ignore: true };
  if (url.origin !== localOrigin && !canonicalOrigins.has(url.origin)) return { ignore: true };
  let pathname;
  let anchor;
  try {
    pathname = decodeURIComponent(url.pathname);
    anchor = decodeURIComponent(url.hash.slice(1));
  } catch { return { invalid: true }; }
  const key = pathname;
  let target = checkedTargets.get(key);
  if (!target) {
    const plain = path.resolve(dist, '.' + pathname);
    const inside = plain === dist || plain.startsWith(dist + path.sep);
    let file = inside && files.has(plain) ? plain : path.join(plain, 'index.html');
    const exists = inside && files.has(file);
    target = { file, exists, pathname };
    checkedTargets.set(key, target);
  }
  return { ...target, anchor, url };
}

function checkReference(raw, filename, resource = false) {
  stats[resource ? 'resourceReferencesChecked' : 'linksChecked'] += 1;
  const target = resolveTarget(raw, filename);
  if (target.ignore) return;
  if (target.invalid) {
    issue('error', 'INVALID_URL', `URL inválida: ${raw}.`, filename);
    return;
  }
  if (!target.exists) {
    issue('error', resource ? 'MISSING_RESOURCE' : 'BROKEN_LINK', `${resource ? 'Recurso' : 'Destino'} local inexistente: ${target.pathname}.`, filename, { target: target.pathname });
    return;
  }
  if (!resource && target.anchor && pages.has(target.file) && !pages.get(target.file).ids.has(target.anchor)) {
    // Text fragments are a browser feature, not element IDs.
    if (target.anchor.startsWith(':~:text=')) return;
    const elementAnchor = target.anchor.split(':~:text=')[0];
    if (elementAnchor && !pages.get(target.file).ids.has(elementAnchor)) issue('error', 'BROKEN_ANCHOR', `No existe #${elementAnchor} en ${target.pathname}.`, filename, { target: target.pathname, anchor: elementAnchor });
  }
}

function checkCss(filename) {
  const css = fs.readFileSync(filename, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi)) {
    const value = match[1] ?? match[2] ?? match[3];
    if (value && !value.startsWith('#')) checkReference(value, filename, true);
  }
  for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi)) checkReference(match[1], filename, true);
}

function checkDuplicateMetadata() {
  const byTitle = new Map();
  const byDescription = new Map();
  for (const record of pages.values()) {
    if (!record.indexable) continue;
    for (const [map, value] of [[byTitle, record.title], [byDescription, record.description]]) {
      if (!value) continue;
      if (!map.has(value)) map.set(value, []);
      map.get(value).push(record.route);
    }
  }
  for (const [title, routes] of byTitle) {
    if (routes.length > 1) issue('error', 'DUPLICATE_TITLE', `Title idéntico en ${routes.length} páginas indexables: ${title}.`, undefined, { routes });
  }
  const utility = /\/(?:aviso-legal|privacidad|politica-de-privacidad|politica-privacidad|cookies|politica-de-cookies|politica-cookies|accesibilidad|creditos|fuentes|contacto|gracias)(?:\/|$)/;
  for (const [description, routes] of byDescription) {
    if (routes.length > 1) issue(routes.some(route => utility.test(route)) ? 'warning' : 'error', 'DUPLICATE_DESCRIPTION', `Description idéntica en ${routes.length} páginas indexables.`, undefined, { description, routes });
  }
}

function checkMunicipalities() {
  const filename = path.join(root, 'data', 'municipalities.json');
  try {
    const municipalities = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (!Array.isArray(municipalities)) throw new Error('se esperaba un array');
    const requiredProvinces = new Set(['asturias', 'cantabria', 'bizkaia', 'gipuzkoa', 'leon', 'palencia', 'alava', 'navarra', 'zamora', 'valladolid', 'burgos', 'la-rioja', 'salamanca', 'avila', 'segovia', 'soria', 'toledo', 'madrid', 'guadalajara']);
    const provinceCounts = new Map();
    const codes = new Set();
    const routes = new Set();
    for (const municipality of municipalities) {
      const route = `/porteros-videoporteros/${municipality.provinceSlug}/${municipality.slug}/`;
      if (!/^\d{5}$/.test(municipality.code) || codes.has(municipality.code)) issue('error', 'MUNICIPALITY_CODE', `Código INE inválido o duplicado: ${municipality.code}.`);
      codes.add(municipality.code);
      if (routes.has(route)) issue('error', 'MUNICIPALITY_ROUTE_DUPLICATE', `Ruta municipal duplicada: ${route}.`);
      routes.add(route);
      provinceCounts.set(municipality.provinceSlug, (provinceCounts.get(municipality.provinceSlug) ?? 0) + 1);
      const target = path.join(dist, route, 'index.html');
      if (!pages.has(target)) issue('error', 'MUNICIPALITY_PAGE', `Falta la página de ${municipality.name}: ${route}.`);
      else stats.municipalityPages += 1;
    }
    stats.provinces = provinceCounts.size;
    if (municipalities.length !== 3797) issue('error', 'MUNICIPALITY_COUNT', `Se esperaban 3797 municipios y hay ${municipalities.length}.`);
    if (provinceCounts.size !== 19 || [...requiredProvinces].some(province => !provinceCounts.has(province))) issue('error', 'PROVINCES', 'La cobertura debe contener exactamente las 19 provincias solicitadas.', undefined, { provinces: [...provinceCounts.keys()] });
    return requiredProvinces;
  } catch (error) {
    issue('error', 'MUNICIPALITY_DATA', `No se pudieron validar los municipios: ${error.message}.`);
    return new Set();
  }
}

function sitemapLocations(xml, filename) {
  if (!/<(?:sitemapindex|urlset)\b/i.test(xml) || !/<\/(?:sitemapindex|urlset)>\s*$/i.test(xml)) issue('error', 'SITEMAP_XML', 'Sitemap sin raíz XML sitemapindex/urlset completa.', filename);
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)].map(match => decodeEntities(match[1].trim()));
}

function checkSitemaps(provinces) {
  const indexFile = path.join(dist, 'sitemap.xml');
  if (!files.has(indexFile)) {
    if (canonicalOrigins.size && stats.indexablePages > 0) issue('error', 'SITEMAP_MISSING', 'Hay páginas indexables con canonical, pero falta sitemap.xml.');
    return;
  }
  const indexXml = fs.readFileSync(indexFile, 'utf8');
  if (!/<sitemapindex\b/i.test(indexXml)) issue('error', 'SITEMAP_INDEX', 'sitemap.xml debe ser un índice de sitemaps.', indexFile);
  const indexLocations = sitemapLocations(indexXml, indexFile);
  const referencedSitemaps = new Set();
  const indexedPages = new Set();
  const origins = new Set();
  stats.sitemapFiles += 1;
  for (const location of indexLocations) {
    let url;
    try {
      url = new URL(location);
      if (!['http:', 'https:'].includes(url.protocol) || url.hash || url.search) throw new Error('URL no normalizada');
      origins.add(url.origin);
      if (canonicalOrigins.size && !canonicalOrigins.has(url.origin)) throw new Error('dominio diferente al de las canonical');
    } catch (error) {
      issue('error', 'SITEMAP_URL', `URL de sitemap inválida: ${location} (${error.message}).`, indexFile);
      continue;
    }
    const target = path.resolve(dist, '.' + decodeURIComponent(url.pathname));
    if (!target.startsWith(dist + path.sep) || !files.has(target)) {
      issue('error', 'SITEMAP_CHILD', `No existe el sitemap ${url.pathname}.`, indexFile);
      continue;
    }
    if (referencedSitemaps.has(target)) {
      issue('error', 'SITEMAP_DUPLICATE_CHILD', `Sitemap repetido en el índice: ${url.pathname}.`, indexFile);
      continue;
    }
    referencedSitemaps.add(target);
    stats.sitemapFiles += 1;
    const xml = fs.readFileSync(target, 'utf8');
    if (!/<urlset\b/i.test(xml)) issue('error', 'SITEMAP_CHILD_FORMAT', 'El sitemap secundario debe contener urlset.', target);
    const locations = sitemapLocations(xml, target);
    for (const entry of locations) {
      stats.sitemapUrls += 1;
      let pageUrl;
      try {
        pageUrl = new URL(entry);
        if (!['http:', 'https:'].includes(pageUrl.protocol) || pageUrl.hash || pageUrl.search || pageUrl.origin !== url.origin) throw new Error('URL absoluta no normalizada o dominio diferente');
      } catch (error) {
        issue('error', 'SITEMAP_PAGE_URL', `URL de página inválida: ${entry} (${error.message}).`, target);
        continue;
      }
      const decoded = decodeURIComponent(pageUrl.pathname);
      const base = path.resolve(dist, '.' + decoded);
      const pageFile = files.has(base) ? base : path.join(base, 'index.html');
      const page = pages.get(pageFile);
      if (!page) {
        issue('error', 'SITEMAP_BROKEN_PAGE', `El sitemap apunta a una página inexistente: ${decoded}.`, target);
        continue;
      }
      if (!page.indexable) issue('error', 'SITEMAP_NOINDEX', `El sitemap incluye una página noindex: ${decoded}.`, target);
      if (page.canonical !== entry) issue('error', 'SITEMAP_CANONICAL', `La URL del sitemap no coincide con la canonical de ${decoded}.`, target, { sitemapUrl: entry, canonical: page.canonical });
      if (indexedPages.has(pageFile)) issue('error', 'SITEMAP_DUPLICATE_PAGE', `Página repetida en los sitemaps: ${decoded}.`, target);
      indexedPages.add(pageFile);
    }
  }
  if (origins.size > 1) issue('error', 'SITEMAP_ORIGINS', 'El índice mezcla varios dominios.', indexFile, { origins: [...origins] });
  if (!referencedSitemaps.has(path.join(dist, 'sitemap-general.xml'))) issue('error', 'SITEMAP_GENERAL', 'El índice no referencia sitemap-general.xml.', indexFile);
  for (const province of provinces) {
    const hasIndexableTown = [...pages.values()].some(page => page.indexable && page.route.startsWith(`/porteros-videoporteros/${province}/`) && page.route !== `/porteros-videoporteros/${province}/`);
    if (hasIndexableTown && !referencedSitemaps.has(path.join(dist, `sitemap-${province}.xml`))) issue('error', 'SITEMAP_PROVINCE', `Falta sitemap-${province}.xml en el índice.`, indexFile);
  }
  for (const page of pages.values()) {
    if (page.indexable && !indexedPages.has(page.file)) issue('error', 'SITEMAP_OMISSION', `Página indexable ausente de los sitemaps: ${page.route}.`, page.file);
  }
}

try {
  if (!fs.existsSync(dist)) throw new Error('No existe dist/. Ejecuta npm run build antes de validar.');
  walk(dist);
  for (const filename of files) if (filename.endsWith('.html')) parsePage(filename);
  if (!pages.size) issue('error', 'EMPTY_BUILD', 'No se han encontrado páginas HTML en dist/.');
  if (canonicalOrigins.size > 1) issue('error', 'CANONICAL_ORIGINS', 'El sitio mezcla dominios canonical.', undefined, { origins: [...canonicalOrigins] });
  for (const page of pages.values()) {
    for (const href of page.links) checkReference(href, page.file);
    for (const src of page.resources) checkReference(src, page.file, true);
  }
  for (const filename of files) if (filename.endsWith('.css')) checkCss(filename);
  checkDuplicateMetadata();
  const provinces = checkMunicipalities();
  checkSitemaps(provinces);
} catch (error) {
  issue('error', 'VALIDATOR', error.message);
}

const report = {
  checkedAt: new Date().toISOString(),
  success: errors.length === 0,
  durationMs: Math.round(performance.now() - started),
  stats,
  errorCount: errors.length,
  warningCount: warnings.length,
  errors,
  warnings,
};
fs.mkdirSync(path.join(root, 'qa'), { recursive: true });
fs.writeFileSync(path.join(root, 'qa', 'validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`VALIDACIÓN ${report.success ? 'OK' : 'FALLIDA'} · ${stats.htmlPages} páginas · ${stats.municipalityPages} municipios · ${stats.provinces} provincias`);
console.log(`${stats.linksChecked} enlaces · ${stats.resourceReferencesChecked} recursos · ${stats.jsonLdBlocks} bloques JSON-LD · ${stats.sitemapUrls} URLs en ${stats.sitemapFiles} sitemaps`);
console.log(`${errors.length} errores · ${warnings.length} avisos · ${(report.durationMs / 1000).toFixed(2)} s · qa/validation.json`);
for (const error of errors.slice(0, 24)) console.error(`  [${error.code}] ${error.file ? `${error.file}: ` : ''}${error.message}${error.occurrences > 1 ? ` (${error.occurrences} referencias)` : ''}`);
if (errors.length > 24) console.error(`  … ${errors.length - 24} errores adicionales en qa/validation.json`);
for (const warning of warnings.slice(0, 6)) console.warn(`  [${warning.code}] ${warning.message}`);
process.exitCode = report.success ? 0 : 1;
