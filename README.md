# Porteros y Videoporteros

Web de instalación y reparación de porteros automáticos y videoporteros, creada desde cero para este repositorio. Diseño propio en marfil, grafito y cobre; HTML estático, CSS adaptable y JavaScript pequeño para navegación, búsqueda municipal y preparación de consultas.

El dominio comercial configurado es **https://instalacionvideoporterourgente.com** y la titularidad facilitada es **D.C.G.**. La preparación del código y la disponibilidad pública del dominio se distinguen en el [estado de entrega](#estado-de-entrega).

## Vistas y revisión

![Portada de escritorio revisada](docs/seo-portada-escritorio-1793009865498.jpg)

- [Portada móvil revisada](docs/seo-portada-movil-1793009794973.jpg).
- [Auditoría SEO técnica, móvil y comprobaciones de publicación](docs/seo-audit.md).
- [Auditoría editorial actual del catálogo municipal](docs/seo-content-audit.md).
- [Selección de 50 páginas para priorizar la revisión editorial](docs/seo-priority-50.json).

Las siguientes capturas e informes conservan revisiones anteriores del proyecto:

- [Portada de escritorio anterior](docs/porteros-desktop-1793002033606.jpg).
- [Portada y municipio en móvil](docs/porteros-mobile-1793002017828.jpg).
- [Teléfonos por zona en móvil](docs/contactos-movil-1793004436248.jpg).
- [Municipios destacados en el index](docs/municipios-index-1793005907781.jpg).
- [Nuevo pie con teléfonos, WhatsApp y mapa](docs/footer-cobertura-1793006025098.jpg).
- [Inicio, municipios y mapa en móvil](docs/contacto-municipios-movil-1793006009958.jpg).
- [Portero automático de audio en el inicio](docs/portero-audio-index-1793008163529.jpg).
- [Barrios de Oviedo con fuente municipal](docs/barrios-municipales-oviedo-1793008193662.jpg).
- [Fotos de audio y barrios en móvil](docs/audio-barrios-movil-1793008402413.jpg).
- [Auditoría de variedad editorial y límites](docs/content-audit.md), con [muestra reproducible](docs/content-audit.json).

## Contenido incluido

| Tipo | Cantidad |
| --- | ---: |
| Municipios | 3.797 |
| Provincias | 19 |
| Servicios | 8 |
| Marcas con fotografía propia de fabricante | 7 |
| Guías prácticas | 5 |
| Síntomas de avería disponibles | 48 |
| Preguntas frecuentes disponibles | 48 |
| Enfoques editoriales locales | 12 |
| Páginas HTML generadas | 3.846 |
| Municipios con referencias municipales verificadas | 44 |
| Barrios documentados por sus ayuntamientos | 371 |
| Distritos municipales | 6 |
| Urbanizaciones y zonas residenciales | 9 |
| Fuentes municipales de zonas | 56 |

La portada incluye también una fotografía real del portero de audio Fermax City VEO DUOX PLUS 49202, con placa exterior y telefonillo con auricular. La página de telefonillos muestra el terminal de audio VEO 3444. Ambas imágenes proceden de las fichas oficiales y conservan crédito, referencia y texto alternativo.

Las marcas son **Tegui, BTicino, Legrand, Golmar, Fermax, Comelit y Auta**. Los servicios cubren instalación/renovación, reparación, comunidades, telefonillos y monitores, WiFi/móvil, apertura y accesos, casas/negocios y mantenimiento.

### Cobertura

Asturias (78), Cantabria (102), Bizkaia (113), Gipuzkoa (88), León (211), Palencia (191), Álava (51), Navarra (272), Zamora (248), Valladolid (225), Burgos (371), La Rioja (174), Salamanca (362), Ávila (248), Segovia (209), Soria (183), Toledo (204), Madrid (179) y Guadalajara (288).

La portada muestra **95 municipios destacados**, cinco por provincia, con enlaces HTML directos a sus páginas de servicio y acceso a cada directorio provincial completo. La selección utiliza la población del conjunto de datos municipal existente; se presenta como una selección de localidades, sin afirmar un ranking demográfico actualizado. El buscador sigue dando acceso a los 3.797 municipios.

## Ejecutar y verificar

Requiere Node.js 22 o posterior. No hay paquetes de producción que instalar ni descargas remotas durante el build.

```bash
npm run build
npm run check
npm test
npm run audit:seo
```

`dist/` contiene la web generada y se excluye de Git. `qa/` contiene informes locales de build, validación y auditoría, también excluidos de Git. `npm run audit:seo` analiza el `dist/` existente contra el dominio comercial y guarda el resultado en `qa/seo-audit.json`; no vuelve a generar la web.

El build utiliza el dominio HTTPS de `data/site.json`, también en local. Solo permite páginas indexables cuando el origen coincide con ese dominio y el contexto no es una vista previa. Para generar una copia de revisión con `noindex`:

```bash
CONTEXT=deploy-preview npm run build
npm run check
```

Después de revisar una copia, ejecutar de nuevo `npm run build` sin ese contexto antes de auditar el resultado de producción. En Netlify, un build con `CONTEXT=production` falla si el origen configurado no coincide con el dominio comercial HTTPS. Los orígenes de prueba y los contextos de vista previa no se tratan como producción.

El validador comprueba la coherencia de versiones de recursos, el teléfono y provincia de las páginas locales, y todos los HTML, rutas municipales, enlaces internos y anclas, imágenes/fuentes/JS/CSS, unicidad de títulos/descripciones, canonical, JSON-LD y sitemaps. Las pruebas cubren asignación completa de teléfonos, rechazo de provincias sin contacto o duplicadas, selección estable de síntomas de distintos tipos, pertenencia y categoría de las zonas residenciales, identidad de sus fuentes municipales y exclusión de áreas industriales, normalización del origen, proximidad geográfica y escape del contenido.

El auditor SEO añade el grafo de enlaces desde la portada, páginas huérfanas y profundidad de navegación, reglas de `robots.txt`, cobertura de sitemaps, coherencia del dominio, encabezados de indexación, títulos/H1/descripciones duplicados y atributos de imágenes. También informa de tamaños locales y compresión estimada. Estas comprobaciones no miden Core Web Vitals de usuarios reales ni confirman el rastreo, la indexación o el posicionamiento en Google.

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

El valor comercial ya está fijado en `data/site.json`: **`https://instalacionvideoporterourgente.com`**. Si existe una variable `SITE_URL` antigua en Netlify, retirarla para utilizar la configuración del repositorio o sustituirla por ese origen exacto, sin ruta ni parámetros. Una variable antigua con otro dominio hará fallar la política de producción. Los títulos, canonical, JSON-LD y sitemaps se generan juntos para evitar mezclar dominios. Los deploy previews y despliegues de rama de Netlify (`CONTEXT` distinto de `production`) llevan `noindex`.

Para conectar el dominio:

1. Añadir `instalacionvideoporterourgente.com` al sitio correcto de Netlify y establecerlo como dominio principal. Añadir también la variante `www` para que pueda redirigir al principal.
2. Configurar en el proveedor del dominio los registros o servidores DNS que indique ese sitio de Netlify. Este repositorio no presupone una IP ni un subdominio de alojamiento.
3. Esperar a que Netlify valide el dominio y emita el certificado, y comprobar HTTPS para el dominio principal y `www`.
4. Revisar `SITE_URL`, desplegar el build y comprobar las respuestas públicas, las redirecciones, `robots.txt` y los sitemaps. Ejecutar además `npm run audit:seo` sobre el build que se vaya a publicar.

`netlify.toml` incluye redirecciones 301 de HTTP y de `www` hacia el origen HTTPS sin `www`. Su funcionamiento público requiere que los dominios resuelvan al sitio correcto y tengan la configuración de HTTPS necesaria.

Con un origen de producción se generan **3.843 páginas indexables**: el resto son privacidad, información legal y error 404. `sitemap.xml` es un índice de `sitemap-general.xml` y los 19 sitemaps provinciales. El total es 21 archivos XML contando el índice. `robots.txt` incluye el sitemap de producción.

Los errores de ruta mantienen un estado 404 mediante la configuración de Netlify. No se usa una reescritura global a la portada.

## Teléfonos por provincia

Los números facilitados por el titular están configurados en `data/site.json`, tanto para llamada como para preparar una consulta en WhatsApp:

| Provincias | Teléfono |
| --- | --- |
| Madrid, Guadalajara y Toledo | **614 78 99 45** |
| Asturias, Cantabria, Bizkaia, Gipuzkoa, Álava, Navarra, La Rioja y las nueve provincias de Castilla y León | **670 042 626** |

Cada página de municipio o provincia selecciona su zona. La cabecera, el pie, la consulta y la barra móvil muestran su teléfono. La portada y las páginas generales utilizan **670 042 626** como contacto y WhatsApp predeterminados; el pie identifica también la línea de Madrid, Guadalajara y Toledo. Los enlaces directos de WhatsApp funcionan sin rellenar un formulario. El formulario detallado conserva el selector de provincia para dirigir cada consulta. Cambiar de provincia en el formulario actualiza el destinatario, los teléfonos de consulta y cabecera, y los accesos móviles de llamada/WhatsApp; limpia la ubicación anterior y retira sugerencias de otra provincia. Las dos zonas etiquetadas del pie mantienen sus teléfonos correspondientes.

El formulario prepara el texto localmente y abre `wa.me` a petición del visitante. Al abrir WhatsApp, el texto preparado se incorpora a su URL y se comunica al proveedor; el destinatario recibe el mensaje cuando el visitante confirma el envío dentro de WhatsApp. También existe la opción de copiar el texto sin abrir WhatsApp. Sin JavaScript, la preparación de mensajes queda deshabilitada; los enlaces de llamada siguen funcionando. No se crea una reserva. La asociación del número con una cuenta activa de WhatsApp no se ha comprobado mediante un mensaje real.

La franja superior muestra **«Urgencias 24 horas»**, según la indicación del titular. El pie combina contacto directo, accesos a provincias y un mapa vectorial de España con las 19 provincias de servicio: norte y Castilla y León en salvia; Madrid, Guadalajara y Toledo en cobre. El mapa es una obra derivada de cartografía oficial del IGN bajo CC BY 4.0, con atribución visible y créditos ampliados. [Fuente y generación del mapa](docs/coverage-map-sources.md).

## Titularidad, privacidad y configuración

La identidad publicada sigue los datos facilitados por el titular: **D.C.G.**, recogido en `data/site.json` y `data/legal.json`. Ambos archivos deben coincidir en titularidad y dominio; el build rechaza discrepancias. Los textos de privacidad e información legal se mantienen en `data/legal.json`, sin identidades, direcciones o identificadores fiscales inventados ni textos de relleno. El alcance de esta información y las consideraciones de cumplimiento se explican en la [auditoría](docs/seo-audit.md).

Las sustituciones opcionales de configuración admitidas son:

| Variable | Uso |
| --- | --- |
| `SITE_URL` | Origen del build; en producción debe coincidir con `https://instalacionvideoporterourgente.com` |
| `CONTACT_PHONE_CENTRO`, `CONTACT_WHATSAPP_CENTRO` | Sustitución opcional de la línea de Madrid, Guadalajara y Toledo |
| `CONTACT_PHONE_NORTE`, `CONTACT_WHATSAPP_NORTE` | Sustitución opcional de la línea de zona norte y Castilla y León |
| `CONTACT_EMAIL` | Correo comercial, si se facilita uno real |
| `LEGAL_NAME` | Titular; debe coincidir con `owner` en `data/legal.json` |

Los teléfonos de configuración llevan prefijo `+34` y nueve cifras. Las variables genéricas `CONTACT_PHONE` y `CONTACT_WHATSAPP` permiten sustituir el contacto predeterminado de la portada y páginas generales; no reemplazan las asignaciones provinciales actuales.

Si se cambian `CONTACT_PHONE_*`, `CONTACT_WHATSAPP_*` u otros contactos, revisar también los números y destinatarios incluidos en `data/legal.json`; actualmente coinciden con la configuración del sitio.

No se han añadido analítica, píxeles publicitarios ni mapas de terceros. La privacidad describe el alojamiento, el funcionamiento del formulario local, la comunicación mediante WhatsApp, los datos necesarios para responder a consultas y los canales de ejercicio de derechos.

## Organización del código

```text
data/site.json                 Identidad y contacto
data/legal.json                Titularidad, privacidad e información legal
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
scripts/site-policy.mjs       Dominio comercial y política de indexación
scripts/components.mjs        Componentes compartidos
scripts/pages.mjs             Composición de tipos de página
scripts/utils.mjs             Rutas, selección, escape y proximidad
scripts/check.mjs             Validación completa del resultado
scripts/audit-seo.mjs          Auditoría estática de SEO y grafo de enlaces
scripts/contact.mjs           Asignación de teléfonos por provincia
scripts/audit-content.py       Comparación antes/después con pares fijos
data/localities.json           Barrios, distritos y zonas con fuente municipal
data/audio-entry.json          Fotografías oficiales de porteros de audio
tests/contact.test.mjs         Enrutamiento y pertenencia geográfica
tests/site-policy.test.mjs     Producción, vistas previas y origen comercial
tests/seo.test.mjs             Reglas de robots y detección de regresiones SEO
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

Las páginas provinciales identifican expresamente la provincia para distinguirse de su capital; los municipios homónimos incorporan la provincia cuando es necesario. La portada muestra el servicio principal en su H1 visible. Los datos estructurados incluyen `Organization`, `WebSite`, `WebPage`, `BreadcrumbList` y `Article` según el tipo de página. `Service` describe las páginas de servicios y las páginas de cobertura provincial o municipal. Las preguntas frecuentes siguen visibles para el visitante, pero ya no se publica marcado `FAQPage`. No se inventan sedes, reseñas ni valoraciones para completar datos estructurados.

La selección editorial es **determinista**, basada en el código INE. No cambia al azar en cada build ni atribuye necesidades concretas al municipio. Combina enfoques, apartados complementarios, diagnósticos, servicios, marcas y preguntas. Los casos se describen como orientación técnica, nunca como trabajos realizados o averías verificadas en ese pueblo. Todos los servicios siguen accesibles desde cualquier localidad.

El directorio `/averias/` permite buscar entre los 48 casos por palabra o por tipo. Cada municipio incorpora cuatro diagnósticos: uno relacionado con su enfoque y otros tres de tipos diferentes. Todo el catálogo sigue accesible, aunque un caso no aparezca en la selección local.

En 44 páginas se muestran 386 referencias obtenidas de 56 fuentes municipales: 371 barrios, seis distritos y nueve urbanizaciones o zonas residenciales, con presencia en las 19 provincias. Se ha retirado por completo la selección anterior del Nomenclátor y su importador. Cada referencia conserva su categoría y fuente del ayuntamiento; al elegirla se completa municipio, provincia y zona en el formulario. Las sugerencias se vinculan al municipio y a su provincia, y la zona se limpia al cambiar de localidad. Donde no hay referencias municipales comprobadas se omite el bloque. No se infieren códigos postales. [Criterios, cobertura y fuentes](docs/localities-sources.md).

La auditoría histórica anterior a esta sustitución conserva exactamente los 240 pares originales y distingue el contenido completo del contenido sin la sección geográfica. Sus cifras documentan aquella revisión; no son una medición del catálogo municipal actual. [Informe histórico y métricas](docs/content-audit.md).

Una medición de similitud textual es una herramienta interna, no un porcentaje que Google emplee ni una garantía de indexación. La estructura y parte del contenido se comparten entre municipios. La siguiente mejora editorial debe partir de información real: trabajos documentados, condiciones de servicio verificadas y preguntas de clientes; no de inventar reseñas, calles, oficinas o estadísticas.

La [auditoría editorial actual](docs/seo-content-audit.md) revisa esa limitación y acompaña una [selección de 50 páginas para priorizar mejoras](docs/seo-priority-50.json). La [auditoría SEO técnica](docs/seo-audit.md) recoge las comprobaciones del build, la revisión móvil y los pasos que requieren acceso al dominio, al alojamiento o a Search Console. Son documentos de diagnóstico y seguimiento, no una promesa de posiciones.

Referencias SEO: [guía de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [políticas sobre contenido a escala](https://developers.google.com/search/docs/essentials/spam-policies).

## Fuentes y derechos

- Nombres y códigos: [INE, relación a 1 de enero de 2026](https://www.ine.es/daco/daco42/codmun/26codmun.xlsx).
- Coordenadas: [IGN, Información Geográfica Destacada](https://www.ign.es/web/ign/portal/ane-datos-geograficos), revisión 20/10/2025. Atribución CC BY 4.0, ign.es, 2025. Las distancias sirven para seleccionar localidades próximas, no para prometer kilómetros por carretera.
- La población del archivo IGN solo ordena localidades destacadas. No se muestra como cifra actual: la fuente no especifica el año censal de ese campo.
- Fotos: fuentes oficiales registradas por imagen en `data/brands.json`, `data/hero.json` y `data/audio-entry.json`. Las marcas y fotografías pertenecen a sus respectivos titulares. No se atribuyen a obras propias ni implican servicio técnico oficial.
- Manrope: fuente local con licencia SIL Open Font License incluida en `public/assets/fonts/OFL-Manrope.txt`.
- [Fuentes del catálogo de averías](docs/diagnostic-sources.md): documentación oficial de fabricantes y criterios de redacción original.
- [Barrios y zonas municipales](docs/localities-sources.md): 56 fuentes de ayuntamientos, con categoría, evidencia y fecha de consulta por referencia.
- Las guías incorporan fuentes técnicas oficiales. WiFi no se equipara a ausencia de cables ni se supone compatibilidad entre equipos solo por tener dos hilos.

## Estado de entrega

El código está preparado para generar la web con `https://instalacionvideoporterourgente.com` como origen comercial y D.C.G. como titular facilitado. El build local permite verificar enlaces, metadatos, teléfonos, contenido, política de indexación y recursos antes de publicarlo.

**Estado público comprobado el 26 de octubre de 2026, a partir de las 10:08 UTC:** cuatro consultas DNS, realizadas con dos proveedores para el dominio principal y `www`, devolvieron `NXDOMAIN`. En esa comprobación el dominio no resolvía públicamente. Este resultado no confirma su estado de registro ni sustituye la conexión del dominio al alojamiento.

La publicación con el dominio comercial, el certificado HTTPS, las redirecciones efectivas y la indexación en Google deben verificarse después de conectar el dominio en Netlify. No se dispone de acceso a la cuenta de Netlify ni a Search Console para confirmar esas operaciones. Una subida a GitHub o un build local correcto no acredita por sí solo un despliegue público ni la indexación en buscadores.
