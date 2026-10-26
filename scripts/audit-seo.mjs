import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';

// Static, reproducible SEO checks. These measurements are not a Google score,
// a browser performance test or evidence that Google has indexed a URL.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const textFile = file => fs.readFileSync(file, 'utf8');
const decode = value => String(value ?? '').replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, entity) => {
  if (entity[0] === '#') {
    const n = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
  }
  return ({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '})[entity.toLowerCase()];
});
const clean = value => decode(String(value ?? '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const attributes = value => Object.fromEntries([...String(value).matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)].map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? '')]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b((?:"[^"]*"|'[^']*'|[^'">])*)>`, 'gi'))].map(m => attributes(m[1]));
const values = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}\\s*>`, 'gi'))].map(m => clean(m[1]));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function routeOf(file, directory) {
  const route = '/' + path.relative(directory, file).split(path.sep).join('/');
  return route.endsWith('/index.html') ? route.slice(0, -10) : route;
}

export function robotsRules(source) {
  const groups = [];
  let group = null;
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim().toLowerCase(), value = match[2].trim();
    if (key === 'user-agent') {
      if (!group || group.rules.length) groups.push(group = {agents:[], rules:[]});
      group.agents.push(value.toLowerCase());
    } else if (group && ['allow','disallow'].includes(key) && value) {
      group.rules.push({allow:key === 'allow', pattern:value});
    }
  }
  const selected = groups.filter(g => g.agents.includes('googlebot'));
  return (selected.length ? selected : groups.filter(g => g.agents.includes('*'))).flatMap(g => g.rules);
}

export function robotsAllows(route, rules) {
  let selected = {length:-1, allow:true};
  for (const rule of rules) {
    const end = rule.pattern.endsWith('$');
    const raw = end ? rule.pattern.slice(0, -1) : rule.pattern;
    const regex = '^' + raw.split('*').map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (end ? '$' : '');
    if (!new RegExp(regex).test(route)) continue;
    const length = raw.replaceAll('*', '').length;
    if (length > selected.length || length === selected.length && rule.allow) selected = {length, allow:rule.allow};
  }
  return selected.allow;
}

function distribution(numbers) {
  const sorted = [...numbers].sort((a,b) => a-b);
  const at = p => sorted.length ? sorted[Math.min(sorted.length-1, Math.floor((sorted.length-1)*p))] : 0;
  return {min:at(0),median:at(.5),p95:at(.95),max:at(1)};
}

function duplicates(pages, field) {
  const map = new Map();
  for (const page of pages.filter(p => p.indexable)) {
    const value = page[field];
    if (!value) continue;
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(page.route);
  }
  return [...map].filter(([,routes]) => routes.length > 1).map(([value,routes]) => ({value,routes}));
}

export function auditSite({directory, origin}) {
  const started = performance.now();
  directory = path.resolve(directory);
  origin = new URL(origin).origin;
  const files = walk(directory), fileSet = new Set(files), pages = [], findings = new Map();
  const resourcePaths = new Set(), externalResources = new Set(), schemaTypes = {}, imageStats = {references:0, lazy:0, highPriority:0, missingAlt:0, missingDimensions:0};
  const add = (level, code, message, route, detail) => {
    if (!findings.has(code)) findings.set(code, {level, code, message, occurrences:0, examples:[]});
    const issue = findings.get(code); issue.occurrences++;
    if (issue.examples.length < 8) issue.examples.push({route, ...(detail ? {detail} : {})});
  };
  const toLocal = (href, route) => {
    try {
      const u = new URL(href, origin + route);
      if (u.origin !== origin) return null;
      return decodeURIComponent(u.pathname);
    } catch { return null; }
  };
  const localFile = pathname => {
    const file = path.resolve(directory, '.' + pathname);
    if (!file.startsWith(directory + path.sep) && file !== directory) return null;
    return fileSet.has(file) ? file : fileSet.has(path.join(file, 'index.html')) ? path.join(file, 'index.html') : null;
  };
  for (const file of files.filter(f => f.endsWith('.html'))) {
    const html = textFile(file), route = routeOf(file, directory);
    const plainHtml = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
    const metas = tags(plainHtml, 'meta'), links = tags(plainHtml, 'link');
    const meta = name => metas.find(m => m.name === name || m.property === name)?.content || '';
    const canonicalLinks = links.filter(l => l.rel?.split(/\s+/).includes('canonical'));
    const canonical = canonicalLinks[0]?.href || '';
    const indexable = !metas.some(m => /^(robots|googlebot)$/i.test(m.name || '') && /\bnoindex\b/i.test(m.content || ''));
    const h1s = values(plainHtml, 'h1'), titles = values(plainHtml, 'title');
    const main = plainHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    const anchors = tags(plainHtml, 'a');
    const page = {route, title:titles[0] || '', description:meta('description'), h1:h1s[0] || '', canonical, indexable, htmlBytes:Buffer.byteLength(html), htmlGzipBytes:gzipSync(html).length, mainWords:clean(main).split(/\s+/).filter(Boolean).length, incoming:0, depth:null, links:new Set(), resources:new Set()};
    pages.push(page);
    if (titles.length !== 1 || !page.title) add('error','TITLE','Cada página debe tener un title no vacío.',route);
    if (h1s.length !== 1 || !page.h1) add('error','H1','Cada página debe tener un H1 no vacío.',route);
    if (!page.description || metas.filter(m => m.name === 'description').length !== 1) add('error','DESCRIPTION','Falta una descripción única en el documento.',route);
    if (canonicalLinks.length !== 1 || canonical !== origin + route) add('error','CANONICAL_ORIGIN','La canonical debe coincidir con el dominio de producción y su ruta.',route,canonical);
    if (meta('og:url') !== canonical) add('error','OG_URL','og:url no coincide con la canonical.',route);
    if (!/width=device-width/.test(meta('viewport')) || /user-scalable\s*=\s*no|maximum-scale\s*=\s*1\b/.test(meta('viewport'))) add('error','VIEWPORT','El viewport debe ser adaptable y permitir ampliar.',route);
    if (meta('og:title') !== page.title || meta('og:description') !== page.description) add('warning','SOCIAL_METADATA','Los metadatos sociales no coinciden con title/description.',route);
    if (route === '/' && !links.some(l=>/(?:^|\s)(?:icon|apple-touch-icon)(?:\s|$)/.test(l.rel || '') && /\.(?:png|ico|gif|jpg|jpeg|bmp|ppm|tif|tiff)(?:\?|$)/i.test(l.href || ''))) add('warning','SEARCH_FAVICON','La portada debe ofrecer un favicon en un formato admitido por Google Search; SVG solo no figura entre los formatos documentados.',route);
    for (const a of anchors) {
      if (!a.href || a.rel?.split(/\s+/).includes('nofollow')) continue;
      const target = toLocal(a.href, route);
      if (target) page.links.add(target);
    }
    const images = tags(plainHtml, 'img');
    for (const image of images) {
      imageStats.references++;
      if (image.loading === 'lazy') imageStats.lazy++;
      if (image.fetchpriority === 'high') imageStats.highPriority++;
      if (!Object.hasOwn(image,'alt')) { imageStats.missingAlt++; add('warning','IMAGE_ALT','Imagen sin atributo alt.',route,image.src); }
      if (!(Number(image.width)>0 && Number(image.height)>0)) { imageStats.missingDimensions++; add('warning','IMAGE_SIZE','Imagen sin dimensiones reservadas.',route,image.src); }
      if (image.fetchpriority === 'high' && image.loading === 'lazy') add('warning','LAZY_PRIORITY','La imagen prioritaria no debe cargarse de forma diferida.',route,image.src);
    }
    const resources = [...images.map(i=>i.src), ...tags(html,'script').map(s=>s.src), ...links.filter(l=>/stylesheet|preload|icon/.test(l.rel || '')).map(l=>l.href)].filter(Boolean);
    for (const src of resources) {
      const local = toLocal(src, route);
      if (local) { resourcePaths.add(local); page.resources.add(local); }
      else if (/^(https?:)?\/\//.test(src)) externalResources.add(src);
    }
    const graphs = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => attributes(m[1]).type === 'application/ld+json');
    if (!graphs.length) add('error','SCHEMA_MISSING','Falta el grafo JSON-LD.',route);
    for (const block of graphs) {
      let data;
      try { data = JSON.parse(block[2]); } catch { add('error','SCHEMA_JSON','JSON-LD no válido.',route); continue; }
      const nodes = Array.isArray(data) ? data : data['@graph'] || [data];
      for (const node of nodes) {
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        for (const type of types.filter(Boolean)) schemaTypes[type] = (schemaTypes[type] || 0) + 1;
        if (types.some(t => ['WebPage','Article','Service'].includes(t)) && node.url !== canonical) add('error','SCHEMA_URL','La URL de la entidad de página/servicio no coincide con la canonical.',route,node.url);
        if (types.includes('BreadcrumbList')) {
          const items = node.itemListElement || [];
          if (items.some((item,i) => item.position !== i+1 || !item.name || !String(item.item || '').startsWith(origin + '/'))) add('error','BREADCRUMB_SCHEMA','Migas estructuradas incompletas o con otro dominio.',route);
          if (items.at(-1)?.item !== canonical) add('error','BREADCRUMB_CURRENT','La última miga no corresponde a la página.',route);
        }
        if (types.includes('Organization') && node.url !== origin + '/') add('error','ORGANIZATION_ORIGIN','La organización debe usar el dominio principal.',route,node.url);
      }
    }
  }
  const pageMap = new Map(pages.map(p => [p.route,p]));
  let internalEdges = 0, brokenTargets = new Set();
  for (const page of pages) for (const target of page.links) {
    const file = localFile(target), targetPage = file && pageMap.get(routeOf(file,directory));
    if (!file) { brokenTargets.add(target); add('error','BROKEN_TARGET','Enlace local a un destino inexistente.',page.route,target); }
    if (targetPage && targetPage !== page) { targetPage.incoming++; internalEdges++; }
  }
  const home = pageMap.get('/');
  if (!home) add('error','HOME_MISSING','No se encuentra la portada.','/');
  const queue = home ? [home] : [];
  if (home) home.depth = 0;
  for (let i=0;i<queue.length;i++) for (const target of queue[i].links) {
    const file = localFile(target), next = file && pageMap.get(routeOf(file,directory));
    if (next && next.depth === null) { next.depth = queue[i].depth + 1; queue.push(next); }
  }
  const indexable = pages.filter(p=>p.indexable);
  for (const page of indexable) {
    if (page.depth === null) add('error','UNREACHABLE','Página indexable sin camino de enlaces desde la portada.',page.route);
    if (page.route !== '/' && page.incoming === 0) add('error','ORPHAN','Página indexable sin enlaces entrantes.',page.route);
  }
  const duplicateTitles = duplicates(pages,'title'), duplicateDescriptions = duplicates(pages,'description'), duplicateH1s = duplicates(pages,'h1');
  for (const row of duplicateTitles) add('error','DUPLICATE_TITLE','Varias páginas indexables comparten title.',row.routes[0],row.routes);
  for (const row of duplicateDescriptions) add('error','DUPLICATE_DESCRIPTION','Varias páginas indexables comparten meta description.',row.routes[0],row.routes);
  for (const row of duplicateH1s) add('warning','DUPLICATE_H1','Encabezados idénticos para ámbitos distintos; revisar intención y desambiguación.',row.routes[0],row.routes);
  const robotsFile = path.join(directory,'robots.txt');
  const robots = fileSet.has(robotsFile) ? textFile(robotsFile) : '';
  const rules = robotsRules(robots);
  if (!robots) add('error','ROBOTS_MISSING','Falta robots.txt.','/robots.txt');
  for (const page of indexable) if (!robotsAllows(page.route,rules)) add('error','ROBOTS_BLOCKED','robots.txt bloquea una página indexable.',page.route);
  for (const resource of resourcePaths) if (!robotsAllows(resource,rules)) add('error','RESOURCE_BLOCKED','robots.txt bloquea un recurso de renderizado.',resource);
  if (!robots.split(/\r?\n/).some(l=>l.trim() === 'Sitemap: ' + origin + '/sitemap.xml')) add('error','ROBOTS_SITEMAP','robots.txt debe anunciar el sitemap del dominio principal.','/robots.txt');
  const headersFile = path.join(directory,'_headers');
  if (fileSet.has(headersFile) && /X-Robots-Tag\s*:[^\n]*noindex/i.test(textFile(headersFile)) && indexable.length) add('error','HEADER_NOINDEX','El build indexable incluye un X-Robots-Tag noindex; revisar la regla aplicable.','/_headers');
  const sitemapUrls = [], sitemapFiles = files.filter(f=>/sitemap[^/]*\.xml$/.test(f));
  for (const file of sitemapFiles) {
    const xml = textFile(file);
    if (!/<urlset\b/.test(xml)) continue;
    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) sitemapUrls.push(decode(match[1]));
  }
  const sitemapSet = new Set(sitemapUrls);
  if (sitemapSet.size !== sitemapUrls.length) add('error','SITEMAP_DUPLICATES','URLs repetidas entre sitemaps.','/sitemap.xml');
  for (const page of pages) {
    const listed = sitemapSet.has(origin + page.route);
    if (page.indexable && !listed) add('error','SITEMAP_MISSING_PAGE','Página indexable ausente del sitemap del dominio principal.',page.route);
    if (!page.indexable && listed) add('error','SITEMAP_NOINDEX','Una página noindex aparece en el sitemap.',page.route);
  }
  for (const url of sitemapUrls) if (!url.startsWith(origin + '/')) add('error','SITEMAP_ORIGIN','El sitemap contiene otro dominio.','/sitemap.xml',url);
  const assets = [];
  for (const resource of resourcePaths) {
    const file = localFile(resource);
    if (!file) { add('error','MISSING_RESOURCE','Falta un recurso local.',resource); continue; }
    const bytes = fs.readFileSync(file), compressible = /\.(?:css|js|svg|json)$/.test(file);
    assets.push({url:resource, bytes:bytes.length, ...(compressible ? {gzipBytes:gzipSync(bytes).length} : {}),sha256:sha256(bytes)});
  }
  assets.sort((a,b)=>b.bytes-a.bytes);
  if (schemaTypes.FAQPage) add('info','FAQ_RICH_RESULTS_RETIRED','Google retiró los resultados enriquecidos FAQ en mayo de 2026; conservar preguntas útiles no requiere este marcado.','/',{pages:schemaTypes.FAQPage,source:'https://developers.google.com/search/updates#may-2026'});
  const longTitles = indexable.filter(p=>p.title.length>65), veryLongTitles = indexable.filter(p=>p.title.length>80), longDescriptions=indexable.filter(p=>p.description.length>165);
  if (veryLongTitles.length || longDescriptions.length) add('info','SNIPPET_LENGTH_REVIEW','Revisión editorial de longitud, no límite de Google ni condición de posicionamiento. Los resultados pueden truncarse según el dispositivo.','/',{titlesOver80:veryLongTitles.length,descriptionsOver165:longDescriptions.length});
  const css = files.filter(f=>f.endsWith('.css')).map(textFile).join('\n');
  const depths = {};
  for (const page of indexable) depths[page.depth ?? 'unreachable']=(depths[page.depth ?? 'unreachable'] || 0)+1;
  const result = {
    checkedAt:new Date().toISOString(), origin, source:'Static generated build', durationMs:Math.round(performance.now()-started),
    scope:{htmlPages:pages.length,indexablePages:indexable.length,noindexPages:pages.length-indexable.length,sitemapFiles:sitemapFiles.length,sitemapUrls:sitemapUrls.length},
    limitations:['No verifica DNS, TLS, HTTP de producción, redirecciones servidas, Search Console ni indexación real.','Los bytes gzip son compresión local reproducible; no tráfico de red medido.','No mide Lighthouse, LCP, INP ni CLS de usuarios reales.','La unicidad de metadatos o de palabras no demuestra calidad editorial ni posicionamiento.'],
    crawl:{internalEdges,brokenTargets:brokenTargets.size,indexableOrphans:indexable.filter(p=>p.route!=='/'&&!p.incoming).length,indexableUnreachable:indexable.filter(p=>p.depth===null).length,maxDepth:Math.max(0,...indexable.map(p=>p.depth || 0)),depths},
    metadata:{titleLengths:distribution(indexable.map(p=>p.title.length)),descriptionLengths:distribution(indexable.map(p=>p.description.length)),titlesOver65:longTitles.length,titlesOver80:veryLongTitles.length,descriptionsOver165:longDescriptions.length,duplicateTitles,duplicateDescriptions,duplicateH1s},
    images:imageStats, structuredData:schemaTypes,
    resources:{external:[...externalResources],totalUnique:assets.length,assets,fontDisplaySwap:/font-display\s*:\s*(swap|optional)/.test(css),reducedMotion:/prefers-reduced-motion/.test(css)},
    html:{bytes:distribution(pages.map(p=>p.htmlBytes)),gzipBytes:distribution(pages.map(p=>p.htmlGzipBytes)),totalBytes:pages.reduce((n,p)=>n+p.htmlBytes,0)},
    findings:[...findings.values()],
    pages:pages.map(({links,resources,...p})=>({...p,outgoingLinks:links.size,resources:resources.size})),
  };
  result.errorCount=result.findings.filter(f=>f.level==='error').length;
  result.warningCount=result.findings.filter(f=>f.level==='warning').length;
  result.success=result.errorCount===0;
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const getArg = name => {const i=process.argv.indexOf(name); return i>=0 ? process.argv[i+1] : undefined;};
  const config = JSON.parse(textFile(path.join(projectRoot,'data/site.json')));
  const origin = getArg('--origin') || process.env.SITE_URL || config.siteUrl;
  if (!origin) throw new Error('Indica el dominio de producción con --origin o data/site.json.');
  const output = path.resolve(projectRoot,getArg('--output') || 'qa/seo-audit.json');
  const result = auditSite({directory:path.resolve(projectRoot,getArg('--dist') || 'dist'),origin});
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
  console.log(`SEO ${result.success?'OK':'REVISAR'} · ${result.scope.htmlPages} páginas · ${result.errorCount} errores · ${result.warningCount} avisos`);
  console.log(`Rastreo: ${result.crawl.indexableOrphans} huérfanas · ${result.crawl.indexableUnreachable} inaccesibles · profundidad máxima ${result.crawl.maxDepth}`);
  console.log(`Metadatos: ${result.metadata.duplicateTitles.length} titles repetidos · ${result.metadata.duplicateDescriptions.length} descriptions repetidas · ${result.metadata.duplicateH1s.length} H1 repetidos`);
  console.log(output);
  for(const finding of result.findings)console.log(`[${finding.level}] ${finding.code} (${finding.occurrences}): ${finding.message}`);
  process.exitCode=result.success?0:1;
}
