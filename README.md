# Porteros y Videoporteros

Web de instalación y reparación de porteros automáticos y videoporteros, creada desde cero para este repositorio. Diseño propio en marfil, grafito y cobre; HTML estático, CSS adaptable y JavaScript pequeño para navegación, búsqueda municipal y preparación de consultas.

## Vistas y revisión

![Portada de escritorio](docs/porteros-desktop-1793002033606.jpg)

- [Portada y municipio en móvil](docs/porteros-mobile-1793002017828.jpg).
- [Auditoría de variedad editorial y límites](docs/content-audit.md), con [muestra reproducible](docs/content-audit.json).

## Contenido incluido

| Tipo | Cantidad |
| --- | ---: |
| Municipios | 3.797 |
| Provincias | 19 |
| Servicios | 8 |
| Marcas con fotografía propia de fabricante | 7 |
| Guías prácticas | 5 |
| Síntomas de avería disponibles | 16 |
| Preguntas frecuentes disponibles | 24 |
| Enfoques editoriales locales | 12 |
| Páginas HTML generadas | 3.845 |

Las marcas son **Tegui, BTicino, Legrand, Golmar, Fermax, Comelit y Auta**. Los servicios cubren instalación/renovación, reparación, comunidades, telefonillos y monitores, WiFi/móvil, apertura y accesos, casas/negocios y mantenimiento.

### Cobertura

Asturias (78), Cantabria (102), Bizkaia (113), Gipuzkoa (88), León (211), Palencia (191), Álava (51), Navarra (272), Zamora (248), Valladolid (225), Burgos (371), La Rioja (174), Salamanca (362), Ávila (248), Segovia (209), Soria (183), Toledo (204), Madrid (179) y Guadalajara (288).

## Ejecutar y verificar

Requiere Node.js 22 o posterior. No hay paquetes de producción que instalar ni descargas remotas durante el build.

```bash
npm run build
npm run check
npm test
```

`dist/` contiene la web generada y se excluye de Git. `qa/` contiene informes locales de build y validación, también excluidos de Git.

Sin dominio configurado, el build local incluye `noindex` y omite las canonical. Para comprobar la variante de producción con un origen de prueba, sin publicarla:

```bash
SITE_URL=https://porteros.example npm run build
npm run check
```

**No utilizar `porteros.example` como dominio de producción.** Es exclusivamente un origen de prueba y no está guardado en la configuración del sitio.

El validador comprueba todos los HTML, rutas municipales, enlaces internos y anclas, imágenes/fuentes/JS/CSS, unicidad de títulos/descripciones, canonical, JSON-LD y sitemaps. Las pruebas unitarias cubren normalización del origen, selección reproducible, proximidad geográfica y escape del contenido.

## Desplegar en Netlify

Importar este repositorio con la rama `main`. `netlify.toml` ya establece:

```text
Build command: npm run build:production && npm run check
Publish directory: dist
Node: 22
```

El origen se obtiene por este orden:

1. Variable `SITE_URL`.
2. `siteUrl` en `data/site.json`.
3. Variable `URL` que proporciona Netlify para el sitio.

Al asignar el dominio definitivo, establecer `SITE_URL` con ese origen HTTPS, sin ruta ni parámetros, y reconstruir. Los títulos, canonical, JSON-LD y sitemaps se generan juntos para evitar mezclar dominios. Los deploy previews de Netlify (`CONTEXT` distinto de `production`) llevan `noindex`.

Con un origen de producción se generan **3.842 páginas indexables**: el resto son privacidad, información legal y error 404. `sitemap.xml` es un índice de `sitemap-general.xml` y los 19 sitemaps provinciales. El total es 21 archivos XML contando el índice. `robots.txt` incluye el sitemap de producción.

Los errores de ruta mantienen un estado 404 mediante la configuración de Netlify. No se usa una reescritura global a la portada.

## Datos pendientes del titular

El repositorio inicial estaba vacío y no identificaba dominio, teléfono, WhatsApp, correo ni titular legal. No se han tomado números de otras empresas o de otras webs del propietario.

Completar `data/site.json`, o usar estas variables:

| Variable | Uso |
| --- | --- |
| `SITE_URL` | Origen HTTPS definitivo |
| `CONTACT_PHONE` | Teléfono comercial, con prefijo +34 y nueve cifras |
| `CONTACT_WHATSAPP` | Número de WhatsApp, con prefijo +34 y nueve cifras |
| `CONTACT_EMAIL` | Correo comercial |
| `LEGAL_NAME` | Titular o razón social |
| `LEGAL_TAX_ID` | NIF del titular |
| `LEGAL_ADDRESS` | Domicilio legal |

La consulta funciona en dos modos:

- **Sin WhatsApp:** prepara el texto localmente y ofrece copiarlo. No simula un envío ni crea una solicitud de visita.
- **Con WhatsApp:** abre el mensaje preparado en `wa.me`. El visitante revisa y envía desde WhatsApp; la web no lo envía automáticamente. También permite copiarlo.

El teléfono aparece en la zona de consulta y en el acceso móvil cuando se configura. No se repite en cada bloque de contenido. No se han añadido analítica, píxeles publicitarios ni mapas de terceros. Las páginas informativas de privacidad/titular deben completarse con los datos reales antes de activar la atención comercial.

## Organización del código

```text
data/site.json                 Identidad y contacto
data/brands.json               Marcas, fotografías y procedencia
data/hero.json                 Fotografía de ambiente y crédito
data/services.json             Servicios y comprobaciones
data/diagnostics.json          Síntomas y orientación inicial
data/faqs.json                 Preguntas frecuentes
data/guides.json               Guías con documentación oficial
data/local-focus.json          Enfoques editoriales diferenciados
data/municipalities.json       Municipios y coordenadas
data/geography-sources.json    Fuentes, fecha y límites geográficos
scripts/build.mjs             Generación y configuración SEO
scripts/components.mjs        Componentes compartidos
scripts/pages.mjs             Composición de tipos de página
scripts/utils.mjs             Rutas, selección, escape y proximidad
scripts/check.mjs             Validación completa del resultado
public/assets/site.css        Diseño original y adaptación móvil
public/assets/site.js         Menú, búsqueda, filtros y consulta
tests/core.test.mjs            Pruebas del comportamiento crítico
```

## Contenido local y SEO

Las rutas municipales siguen este formato:

```text
/porteros-videoporteros/asturias/oviedo/
/porteros-videoporteros/bizkaia/barakaldo/
/porteros-videoporteros/madrid/alcala-de-henares/
```

Cada municipio tiene un H1 centrado en «Instalación y reparación de porteros automáticos y videoporteros en…», metadatos propios, navegación de provincia, fotografías, preguntas visibles, formulario con su localidad y enlaces de proximidad.

La selección editorial es **determinista**, basada en el código INE. No cambia al azar en cada build ni atribuye necesidades concretas al municipio. Combina enfoques, apartados complementarios, diagnósticos, servicios, marcas y preguntas. Los casos se describen como orientación técnica, nunca como trabajos realizados o averías verificadas en ese pueblo. Todos los servicios siguen accesibles desde cualquier localidad.

Una medición de similitud textual es una herramienta interna, no un porcentaje que Google emplee ni una garantía de indexación. La estructura y parte del contenido se comparten entre municipios. La siguiente mejora editorial debe partir de información real: trabajos documentados, condiciones de servicio verificadas y preguntas de clientes; no de inventar reseñas, calles, oficinas o estadísticas.

Referencias SEO: [guía de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [políticas sobre contenido a escala](https://developers.google.com/search/docs/essentials/spam-policies).

## Fuentes y derechos

- Nombres y códigos: [INE, relación a 1 de enero de 2026](https://www.ine.es/daco/daco42/codmun/26codmun.xlsx).
- Coordenadas: [IGN, Información Geográfica Destacada](https://www.ign.es/web/ign/portal/ane-datos-geograficos), revisión 20/10/2025. Atribución CC BY 4.0, ign.es, 2025. Las distancias sirven para seleccionar localidades próximas, no para prometer kilómetros por carretera.
- La población del archivo IGN solo ordena localidades destacadas. No se muestra como cifra actual: la fuente no especifica el año censal de ese campo.
- Fotos: fuentes oficiales registradas por imagen en `data/brands.json` y `data/hero.json`. Las marcas y fotografías pertenecen a sus respectivos titulares. No se atribuyen a obras propias ni implican servicio técnico oficial.
- Manrope: fuente local con licencia SIL Open Font License incluida en `public/assets/fonts/OFL-Manrope.txt`.
- Las guías incorporan fuentes técnicas oficiales. WiFi no se equipara a ausencia de cables ni se supone compatibilidad entre equipos solo por tener dos hilos.

## Estado de entrega

Código listo para compilar en Netlify y guardarse en la rama principal del repositorio solicitado. La puesta en servicio comercial requiere completar los datos reales anteriores. Una subida a GitHub no confirma por sí sola un despliegue en Netlify ni la indexación en buscadores.
