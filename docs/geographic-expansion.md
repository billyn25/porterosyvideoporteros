# Ampliación profesional de municipios, barrios y calles

Revisión: **26/10/2026, 12:23 (CET)**. Origen comercial configurado: `https://instalacionvideoporterourgente.com`. Base del trabajo: `11d990b8ee4ac176b85942c84b285c8bfaeed09e`.

## Resultado comprobado

La portada enlaza **192 municipios** de las 19 provincias: 114 se muestran inicialmente y otros 78 se abren con controles nativos. Cada provincia incluye al menos diez; Madrid incluye doce, con San Fernando de Henares, Coslada y Torrejón de Ardoz.

Las **3.797 páginas municipales** muestran referencias geográficas documentadas. El bloque se sitúa inmediatamente después de la presentación y tiene acceso directo desde ella. Sus enlaces rellenan la referencia de la consulta y conservan municipio, provincia y destinatario regional. No se crean páginas adicionales para cada calle.

| Comprobación | Resultado |
| --- | ---: |
| Municipios con referencias en el HTML | 3.797 de 3.797 |
| Municipios con calles, avenidas, plazas o paseos | 3.718 |
| Municipios con barrios, distritos, zonas, parroquias o localidades | 127 |
| Vías mostradas tras evitar etiquetas duplicadas | 52.100 |
| Áreas y localidades mostradas | 742 |
| Total de referencias mostradas | 52.842 |
| Municipios sin referencias | 0 |
| Enlaces municipales del directorio de portada | 192 |

Los conjuntos de municipios con vías y con áreas se solapan; no deben sumarse. La selección no pretende ser un inventario de todas las calles ni todos los barrios.

## Qué cambió y por qué

La colección anterior solo permitía mostrar zonas en 44 municipios. La ampliación incorpora un callejero oficial identificado por código municipal y completa las excepciones rurales con fuentes oficiales. Ningún registro se asigna por parecido de nombres.

El diseño distingue barrios, distritos, urbanizaciones, parroquias, localidades y vías. Las páginas con localidades rurales no las denominan barrios. Se muestran primero ocho vías y el resto queda en un desplegable accesible; el contenido existe desde el HTML inicial. Los barrios documentados y las fuentes de cada selección tienen grupos propios.

La revisión de nombres evita confundir una calle con una avenida homónima. También conserva diferencias de denominación entre vías importadas: Calle la Estacion y Calle Estacion de Siero mantienen sus códigos y referencias separados. Las variantes documentadas por un ayuntamiento tienen preferencia cuando coinciden con una referencia importada; no se combinan códigos postales de vías distintas.

## Fuentes y trazabilidad

### Callejero del INE

Se usan únicamente **VIAS y TRAM** del [Callejero del Censo Electoral del INE](https://www.ine.es/dyngs/DAB/es/index.htm?cid=1390), edición **julio de 2026**, fecha de referencia **30 de junio de 2026**. No se importan UP, PSEU ni SECC.

El conjunto almacenado contiene 52.084 vías seleccionadas de 194.452 códigos elegibles, con un máximo de 16 por municipio. Hay 3.714 municipios con selección INE y 83 sin tipos o nombres admisibles. Esos 83 casos se completan en la colección de fuentes oficiales locales; no se convierten sus registros BARRO, AUZOA o LUGAR en calles.

Cada vía conserva código, denominación original, tipo original y códigos postales presentes en sus tramos. Los códigos postales no se muestran como si uno solo cubriera toda la calle o todo el municipio. No se atribuye uso residencial a una vía por aparecer en el callejero.

La edición, URL de descarga, diseño de registro, diccionario de tipos y SHA-256 quedan en `data/streets.json`. SHA-256 del ZIP: `b2e4522a8870558f7300a44b4575ec32b45d2c19f60b8324dd5c951609a3cac6`. La segunda importación produjo los mismos 20 JSON byte a byte.

### Fuentes municipales y autonómicas

`data/localities.json` conserva **766 referencias en 130 municipios**, respaldadas por **145 fuentes**: 517 barrios, 6 distritos, 9 zonas residenciales, 6 parroquias, 204 localidades y 24 vías documentadas manualmente. Cada referencia tiene fuente, categoría y municipio exactos. La [relación completa de municipios y fuentes](localities-sources.md) explica las comprobaciones.

Los 83 municipios rurales añadidos se verificaron con ayuntamientos, diputaciones, Gobierno Vasco y el portal público CANTUR. En los casos en que la apertura directa de una página oficial falló, la ficha distingue expresamente la comprobación de su contenido indexado. No se afirma haber leído un documento completo cuando solo se verificó evidencia indexada.

Se descartaron Beotibar y Okobio de Belauntza: aunque un servicio geográfico los etiqueta como barrios, el [directorio de la Diputación de Gipuzkoa](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/poligono-industrial?city=021) los identifica como polígonos industriales. Belauntza conserva Hiriburu como localidad. Tresviso y Elduain mantienen una sola localidad corroborada; no se inventan subdivisiones para aumentar el número de referencias.

San Fernando de Henares muestra cuatro barrios y 33 vías, con fuentes municipales y del callejero identificadas. Coslada y Torrejón de Ardoz también incorporan sus propios barrios documentados. Las referencias no representan oficinas, obras realizadas ni promesas de atención inmediata.

## Cobertura por provincia

| Provincia | Municipios | Con referencias | Con vías | Referencias mostradas |
| --- | ---: | ---: | ---: | ---: |
| Asturias | 78 | 78 | 71 | 981 |
| Cantabria | 102 | 102 | 71 | 1.018 |
| Bizkaia | 113 | 113 | 92 | 1.114 |
| Gipuzkoa | 88 | 88 | 78 | 934 |
| León | 211 | 211 | 211 | 3.309 |
| Palencia | 191 | 191 | 191 | 2.492 |
| Álava | 51 | 51 | 48 | 780 |
| Navarra | 272 | 272 | 267 | 3.343 |
| Zamora | 248 | 248 | 248 | 3.801 |
| Valladolid | 225 | 225 | 225 | 3.364 |
| Burgos | 371 | 371 | 369 | 4.914 |
| La Rioja | 174 | 174 | 174 | 2.386 |
| Salamanca | 362 | 362 | 362 | 5.356 |
| Ávila | 248 | 248 | 248 | 3.617 |
| Segovia | 209 | 209 | 209 | 3.183 |
| Soria | 183 | 183 | 183 | 2.207 |
| Toledo | 204 | 204 | 204 | 3.275 |
| Madrid | 179 | 179 | 179 | 2.926 |
| Guadalajara | 288 | 288 | 288 | 3.842 |

## Validación técnica y SEO

Se ejecutaron satisfactoriamente:

```bash
npm test
npm run build:production
npm run check
npm run audit:seo
npm run audit:geography
```

Los 21 casos de prueba de los cinco archivos cubren, entre otras cosas, identidad municipal, tipos y fuentes, duplicados, contactos regionales, conservación de nombres distintos, referencias rurales y enlaces de portada.

El validador revisó 3.846 HTML, 383.450 enlaces y 42.167 referencias a recursos, con cero errores y avisos. Los 21 sitemaps incluyen las 3.843 páginas indexables. El grafo SEO tiene cero destinos internos rotos, cero páginas indexables huérfanas o inaccesibles y una profundidad máxima de dos enlaces desde portada. No hay títulos, descripciones ni H1 duplicados. Las 19.090 referencias a imágenes tienen texto alternativo y dimensiones.

El auditor geográfico comprueba cada referencia esperada contra su enlace real en el HTML, con el nombre de municipio y la provincia correctos, y verifica que aparezcan sus fuentes. El resultado es cero omisiones y cero errores.

Estos controles verifican el sitio generado. No equivalen a una confirmación de DNS, HTTPS público, despliegue en producción, indexación en Google o posiciones. La variedad de nombres y la unicidad de metadatos no garantizan posicionamiento. La auditoría editorial anterior conserva sus límites; no se ha calculado un porcentaje universal de contenido duplicado ni prometido una penalización o ausencia de ella.

## Revisión visual y funcional

La portada y San Fernando de Henares se comprobaron en ventanas de 320, 375 y 414 píxeles dentro del navegador. El área útil fue 15 píxeles menor por las barras de desplazamiento de escritorio. No hubo desbordamiento horizontal, ni al abrir todas las vías. Los enlaces nuevos tienen al menos 44 píxeles de altura en portada y 55 en el bloque local. Los encabezados finales, incluida la mención de paseos, caben en los tres tamaños.

Elegir Calle Gabriel Celaya rellena San Fernando de Henares, Madrid y esa calle; el formulario conserva WhatsApp `34614789945`. La portada conserva teléfono y WhatsApp general `34670042626`. La revisión no envió mensajes. Las mediciones son comprobaciones de diseño adaptable y comportamiento; no son Core Web Vitals de usuarios reales ni una medición Lighthouse.

- [Directorio ampliado en escritorio](municipios-ampliados-index-1793013239121.jpg).
- [Directorio de portada en móvil](municipios-index-movil-1793013421010.jpg).
- [Barrios y calles en escritorio](barrios-calles-san-fernando-final-1793014072018.jpg).
- [Barrios y calles en móvil](barrios-calles-movil-final-1793014060210.jpg).

## Mantener los datos

El build ordinario no necesita conexiones ni descargas. Para reproducir la importación de la edición fijada:

```bash
python scripts/import-streets.py --retrieved-at 2026-10-26
```

El importador también acepta `--input`, `--schema` y `--types` para usar copias locales, `--cache-dir` para elegir caché y `--refresh` para volver a descargar la misma edición. Una edición nueva exige revisar fecha, esquema y tipos antes de cambiar sus constantes. Los nuevos barrios o localidades se incorporan solo después de documentar una fuente que acredite su categoría.

[Resumen de resultados y revisión móvil](geographic-expansion.json) · [Auditoría geográfica completa comprimida](geography-audit-full.json.gz) · [Auditoría SEO completa de esta versión](seo-audit-geography.json.gz).
