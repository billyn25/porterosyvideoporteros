import {phoneDigits} from './utils.mjs';

export function contactForProvince(config, provinceSlug = '') {
  if (!provinceSlug) return null;
  return (config.contactAreas || []).find(area => area.provinceSlugs.includes(provinceSlug)) || null;
}

export function phoneLabel(value) {
  return String(value || '').replace(/^\+34\s*/, '').trim();
}

export function validateContacts(config, provinces) {
  const expected = new Set(provinces.map(province => province.slug));
  const assigned = new Set();
  for (const area of config.contactAreas || []) {
    if (!area.id || !area.label || !area.provinceSlugs?.length) throw new Error('Zona de contacto incompleta.');
    for (const field of ['phone', 'whatsapp']) {
      if (area[field] && !/^34\d{9}$/.test(phoneDigits(area[field]))) throw new Error(`${area.id}: ${field} necesita +34 y nueve cifras.`);
    }
    if (!area.phone) throw new Error(`${area.id}: falta el teléfono de contacto.`);
    for (const slug of area.provinceSlugs) {
      if (!expected.has(slug)) throw new Error(`Provincia desconocida en contacto: ${slug}`);
      if (assigned.has(slug)) throw new Error(`Provincia con dos zonas de contacto: ${slug}`);
      assigned.add(slug);
    }
  }
  if (config.contactAreas?.length && assigned.size !== expected.size) throw new Error('Hay provincias sin teléfono asignado.');
}
