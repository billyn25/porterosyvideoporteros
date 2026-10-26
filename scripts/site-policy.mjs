import {normalizeOrigin} from './utils.mjs';

// El origen comercial es explícito. Las copias de revisión nunca se indexan.
export function sitePolicy(config,env={}) {
  const productionOrigin=normalizeOrigin(config.siteUrl || '');
  const baseUrl=normalizeOrigin(env.SITE_URL || productionOrigin || env.URL || '');
  const isPreview=Boolean(env.CONTEXT && env.CONTEXT!=='production');
  const publicOrigin=Boolean(baseUrl && new URL(baseUrl).protocol==='https:' && !/(?:^localhost$|^127\.|\.local$|\.example$|\.test$|\.invalid$)/i.test(new URL(baseUrl).hostname));
  const indexable=Boolean(publicOrigin && productionOrigin && baseUrl===productionOrigin && !isPreview);
  if(env.CONTEXT==='production' && !indexable)throw new Error('La producción debe usar el origen HTTPS comercial de data/site.json. Revisa SITE_URL antes de publicar.');
  return {baseUrl,productionOrigin,isPreview,indexable};
}
