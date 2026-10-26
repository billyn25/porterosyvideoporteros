# Auditoría de contenido y plan editorial SEO

> Esta auditoría conserva la revisión anterior a la ampliación de barrios y calles. Los resultados posteriores, la cobertura de los 3.797 municipios y la comprobación SEO del nuevo build están en [Ampliación geográfica](geographic-expansion.md).

**Fecha:** 26 de octubre de 2026. **Dominio de referencia:** `instalacionvideoporterourgente.com`.

Este documento evalúa la utilidad del contenido, su diferenciación local, la arquitectura editorial y las prioridades de mejora. Complementa la auditoría técnica y la revisión móvil. No mide posiciones en Google ni sustituye los datos de Search Console.

Las métricas de reutilización se obtuvieron del HTML compilado del commit `25ebca1`, antes de las correcciones de esta revisión. Las correcciones de encabezados y metadatos que se describen a continuación ya están aplicadas en las plantillas. Los resultados finales de compilación y rastreo se documentan en la auditoría técnica.

## 1. Diagnóstico

La web presenta una estructura clara de servicios, marcas, provincias, municipios, guías y averías. Los teléfonos por zona y el formulario permiten preparar una consulta concreta. Las fuentes municipales y la documentación de fabricantes aportan precisión.

La principal oportunidad de mejora es la **utilidad local de las fichas municipales**. La mayoría comparte consejos técnicos seleccionados de un catálogo común. Sus combinaciones producen textos distintos, pero eso no demuestra experiencia ni investigación de cada localidad. Añadir barrios o códigos postales tampoco sustituye información útil sobre la prestación del servicio.

No hay evidencia en esta auditoría para afirmar que exista una sanción de Google. Tampoco hay base para garantizar posiciones por corregir títulos, ampliar textos o reducir un porcentaje de coincidencia. La estrategia debe combinar una web técnicamente accesible, contenido útil y evidencia real del servicio.

## 2. Correcciones editoriales aplicadas

| Hallazgo inicial | Corrección aplicada | Propósito |
| --- | --- | --- |
| El H1 del inicio era únicamente «Tu puerta, bien conectada.» | El H1 visible identifica instalación y reparación de porteros automáticos y videoporteros; el lema pasa a un elemento secundario. | Explicar el servicio desde el encabezado principal. |
| Doce provincias compartían H1 con sus capitales. | El H1 provincial incluye «provincia de». | Distinguir el directorio provincial de la ficha de la ciudad. |
| Villaescusa en Cantabria y Zamora compartían H1. | Los municipios homónimos incluyen la provincia en el H1, como ya ocurría en el título. | Evitar ambigüedades entre localidades distintas. |
| Algunos títulos municipales acumulaban un nombre largo y un sufijo genérico. | Se conserva servicio y localidad, y se omite el sufijo cuando alarga demasiado el título. | Facilitar la lectura sin recortar el nombre del municipio. |
| 946 metadescripciones repetían «Reparación de averías, compatibilidad y revisión de averías». | Se sustituye ese remate por una descripción concisa del servicio y atención, adaptada al espacio que ocupa la localidad. | Eliminar una repetición innecesaria y explicar mejor la página. |
| Se generaba marcado FAQPage como parte del JSON-LD. | Se conserva la FAQ visible y se elimina ese marcado redundante. | Simplificar el documento sin retirar respuestas útiles. |

Las doce parejas provincia-capital afectadas eran León, Palencia, Zamora, Valladolid, Burgos, Salamanca, Ávila, Segovia, Soria, Toledo, Madrid y Guadalajara. Junto con Villaescusa, el baseline tenía **13 grupos de H1 duplicados, que afectaban a 26 páginas**. Una coincidencia de H1 no demuestra por sí sola canibalización: para comprobarla se necesitan consultas y URLs de Search Console.

El baseline tenía 90 títulos de más de 80 caracteres y una mediana de 66. Son indicadores de concisión, no límites obligatorios de Google. Google puede truncar o cambiar el título mostrado según el contexto. Las metadescripciones también son propuestas: el buscador puede seleccionar otro fragmento de la página según la consulta.

Google dejó de mostrar el resultado enriquecido FAQ desde el **7 de mayo de 2026** y retiró su documentación el 15 de junio. La FAQ visible sigue sirviendo a las personas. No corresponde sustituir su marcado por QAPage: la web no es un foro con respuestas aportadas por usuarios.

## 3. Medición del contenido municipal

### Alcance y resultado

| Indicador del baseline | Resultado |
| --- | ---: |
| Páginas municipales examinadas | 3.797 |
| Municipios con zonas contrastadas en fuentes municipales | 44 |
| Municipios sin ese bloque de zonas | 3.753 |
| Referencias locales documentadas | 386 |
| Fuentes municipales | 56 |
| Focos técnicos | 12 |
| Secciones editoriales base | 36 |
| Preguntas frecuentes disponibles | 48 |
| Diagnósticos disponibles | 48 |
| Secuencias diferentes del núcleo editorial | 1.807 |
| Reutilización máxima de una secuencia editorial | 7 páginas |
| Palabras técnicas extraídas: mínimo / mediana / máximo | 897 / 982 / 1.047 |

Los 44 municipios con zonas contrastadas se reparten entre las 19 provincias del directorio. Sus 386 referencias se distinguen como 371 barrios, seis distritos y nueve urbanizaciones o zonas residenciales. Esta cobertura documental **no acredita por sí misma una oficina, una visita realizada o disponibilidad inmediata**. Los criterios y fuentes están en [la documentación municipal](localities-sources.md).

### Cómo interpretar las cifras

La entradilla municipal parte de un único párrafo con sustitución del nombre de la localidad. El normalizador obtiene dos patrones porque doce capitales comparten nombre con la provincia; eso no equivale a dos redacciones independientes.

La introducción temática y sus tres apartados editoriales forman 1.807 secuencias distintas, con una reutilización máxima de siete. Al añadir los demás módulos, las 3.797 secuencias completas son distintas. Esta diferencia proviene de combinaciones de textos compartidos, no de 3.797 investigaciones o trabajos locales.

El número de palabras no se utiliza como objetivo. Una explicación breve que resuelve una duda concreta puede resultar más útil que ampliar una ficha con contenido genérico. Tampoco se usa esta medición para asignar una supuesta «puntuación SEO».

### Método

Se reutilizó el extractor de `scripts/audit-content.py` sobre las 3.797 fichas compiladas. Se excluyeron navegación, formulario, botones y municipios próximos. Se separaron los bloques geográficos del contenido técnico y se normalizaron el nombre y los alias del municipio y su provincia. Se contaron secuencias y bloques exactos, no equivalencia semántica ni calidad comercial.

Las cifras corresponden al contenido anterior a esta revisión; no deben presentarse como un nuevo porcentaje de mejora ni mezclarse con las métricas históricas de otras auditorías.

## 4. Calidad local y riesgo de páginas demasiado parecidas

Las políticas de Google sobre páginas de entrada y contenido a escala se centran en páginas creadas para captar búsquedas sin aportar suficiente utilidad. El volumen de URLs o el uso de plantillas no permiten concluir automáticamente una infracción. En este proyecto, el contacto directo de cada ficha y la jerarquía navegable son elementos útiles; la variación de párrafos no demuestra valor local adicional.

Se mantienen las páginas municipales y no se aplica una desindexación general. Antes de consolidar fichas conviene estudiar su utilidad, consultas y resultados reales. No es necesario multiplicar nuevas variantes por marca, avería y localidad para completar el servicio.

La mejora de una ficha debe partir de información que exista: condiciones de atención o desplazamiento, modelos intervenidos, preguntas reales y trabajos documentados con autorización. No deben inventarse oficinas, técnicos, reseñas, precios o tiempos de llegada. Un código postal inferido o un nombre de barrio añadido para diferenciar texto no mejora esa evidencia.

## 5. Arquitectura por intención de búsqueda

| Tipo de página | Intención principal | Información que la distingue |
| --- | --- | --- |
| Inicio | Conocer el servicio global y contactar. | Instalación, reparación, urgencias, teléfonos, regiones y fotografías. |
| Servicio | Resolver una necesidad concreta. | Alcance, comprobaciones, compatibilidad y preparación de la consulta. |
| Provincia | Encontrar atención dentro de una provincia. | Directorio municipal y teléfono territorial. |
| Municipio | Consultar una instalación en esa localidad. | Municipio correcto, contacto por zona y referencias locales verificadas. |
| Marca | Entender las opciones para un equipo de una marca. | Familias, documentación y compatibilidad; sin atribuir servicio oficial. |
| Guía | Resolver una duda antes de contratar o cambiar equipo. | Explicación técnica, fuentes y enlace al servicio relacionado. |
| Averías | Identificar el síntoma y preparar el aviso. | Filtro por fallo y comprobaciones de uso; sin atribuir incidencias al municipio. |

No se recomienda canonicalizar todas las fichas municipales hacia su provincia: su finalidad es diferente. Si más adelante se consolidan páginas, debe hacerse por una decisión sobre contenido y utilidad, con redirecciones coherentes.

### Elementos que conviene conservar

- Los 95 municipios destacados del inicio y los directorios provinciales permiten recorrer el sitio sin depender del buscador JavaScript.
- Los enlaces entre servicios, guías y marcas conectan la explicación con la consulta.
- Los municipios próximos se presentan como referencias geográficas, sin convertirlos en sedes.
- Los barrios enlazan al formulario; no generan páginas vacías por cada nombre.
- Los teléfonos y WhatsApp se asignan a la zona correspondiente.
- Las fotos se atribuyen al fabricante y no se presentan como trabajos propios.

## 6. Plan editorial de 50 URLs

La selección completa se conserva en [seo-priority-50.json](seo-priority-50.json). Sirve para organizar la revisión y el seguimiento; no implica excluir al resto del directorio ni afirmar que estas URLs tengan más búsquedas.

| Familia | URLs | Criterio |
| --- | ---: | --- |
| Inicio | 1 | Página de entrada y presentación global. |
| Servicios | 8 | Las ocho necesidades diferenciadas del catálogo actual. |
| Provincias | 19 | Un directorio por provincia incluida en la web. |
| Municipios | 22 | Localidades de referencia de las 19 provincias y tres fichas adicionales; todas tienen fuentes municipales disponibles. |
| **Total** | **50** | Prioridad editorial, no estimación de tráfico. |

Los 22 municipios seleccionados son:

| Municipio | Provincia | Referencias municipales verificadas | Ruta |
| --- | --- | ---: | --- |
| Gijón | Asturias | 10 | `/porteros-videoporteros/asturias/gijon/` |
| Santander | Cantabria | 7 | `/porteros-videoporteros/cantabria/santander/` |
| Bilbao | Bizkaia | 12 | `/porteros-videoporteros/bizkaia/bilbao/` |
| Donostia/San Sebastián | Gipuzkoa | 12 | `/porteros-videoporteros/gipuzkoa/donostia-san-sebastian/` |
| León | León | 12 | `/porteros-videoporteros/leon/leon/` |
| Palencia | Palencia | 12 | `/porteros-videoporteros/palencia/palencia/` |
| Vitoria-Gasteiz | Álava | 12 | `/porteros-videoporteros/alava/vitoria-gasteiz/` |
| Pamplona/Iruña | Navarra | 12 | `/porteros-videoporteros/navarra/pamplona-iruna/` |
| Zamora | Zamora | 12 | `/porteros-videoporteros/zamora/zamora/` |
| Valladolid | Valladolid | 12 | `/porteros-videoporteros/valladolid/valladolid/` |
| Burgos | Burgos | 12 | `/porteros-videoporteros/burgos/burgos/` |
| Logroño | La Rioja | 10 | `/porteros-videoporteros/la-rioja/logrono/` |
| Salamanca | Salamanca | 12 | `/porteros-videoporteros/salamanca/salamanca/` |
| Ávila | Ávila | 8 | `/porteros-videoporteros/avila/avila/` |
| Segovia | Segovia | 12 | `/porteros-videoporteros/segovia/segovia/` |
| Soria | Soria | 5 | `/porteros-videoporteros/soria/soria/` |
| Toledo | Toledo | 10 | `/porteros-videoporteros/toledo/toledo/` |
| Madrid | Madrid | 12 | `/porteros-videoporteros/madrid/madrid/` |
| Guadalajara | Guadalajara | 10 | `/porteros-videoporteros/guadalajara/guadalajara/` |
| Oviedo | Asturias | 12 | `/porteros-videoporteros/asturias/oviedo/` |
| Móstoles | Madrid | 6 | `/porteros-videoporteros/madrid/mostoles/` |
| Alcalá de Henares | Madrid | 12 | `/porteros-videoporteros/madrid/alcala-de-henares/` |

### Ocho acciones concretas

1. **Inicio:** conservar un H1 que explique el servicio y contacto visible desde móvil. «Urgencias 24 horas» responde a lo indicado por el titular; no debe convertirse en una promesa de llegada en minutos.
2. **Servicios:** revisar que cada página resuelva una necesidad distinta. Explicar alcance, datos necesarios y compatibilidad; conservar la selección del servicio en el formulario y enlazar la guía pertinente. Recortar consejos duplicados dentro de una misma página.
3. **Provincias:** mantener la distinción entre provincia y capital, el teléfono territorial y un directorio fácil de recorrer. La presencia en el directorio no debe presentarse como una oficina en cada localidad.
4. **Municipios prioritarios:** mantener las fuentes de sus zonas y sus categorías correctas. Revisar que la consulta incluya municipio, provincia y destinatario adecuados. Añadir códigos postales solo si se contrastan con una fuente apropiada y resultan útiles para localizar el servicio.
5. **Trabajos reales cuando exista documentación:** una ficha puede explicar síntoma, tecnología, decisión de reparar o sustituir y comprobación final, con fotos autorizadas sin datos de vecinos. No hace falta publicar la dirección particular de una vivienda para documentar el trabajo. No redactar casos ficticios para rellenar una página.
6. **Condiciones de servicio cuando estén confirmadas:** explicar cómo se acuerdan desplazamiento, acceso al portal, disponibilidad y alcance del presupuesto. Publicar únicamente condiciones que el negocio pueda cumplir.
7. **Guías y averías:** incorporar dudas reales de consultas y búsquedas, contrastadas con documentación del fabricante. Identificar la autoría editorial real y fechar revisiones efectivas; no inventar perfiles de expertos ni actualizar fechas en cada build sin revisión.
8. **Seguimiento con datos:** agrupar las 50 URLs por tipo y zona en Search Console. Comparar consultas, indexación, impresiones, clics y solicitudes recibidas. Cuando varias URLs respondan a la misma intención, revisar primero su enfoque y enlazado antes de consolidarlas.

## 7. Confianza, autoría y datos estructurados

La documentación de fabricantes sirve para contrastar funciones y compatibilidad. Las fotografías de producto ilustran los equipos y están identificadas; no sustituyen evidencias de instalaciones propias. Las guías pueden reforzar su atribución editorial sin inventar autores, titulaciones o experiencia.

La falta de una dirección comercial proporcionada no se resuelve creando una ficticia para el marcado. Google exige dirección física para la elegibilidad de su resultado LocalBusiness. Los tipos Organization y Service pueden describir la entidad y sus servicios sin inventar oficinas. Tampoco deben añadirse estrellas o testimonios que no provengan de experiencias reales.

## 8. Qué se puede medir después

Esta revisión no dispone de datos de Search Console, analítica o solicitudes comerciales. Por tanto, no verifica posiciones, CTR, conversiones, acciones manuales, canonical elegido por Google o canibalización efectiva. Una búsqueda `site:` no sustituye esos datos.

Una vez accesible la versión de producción, el seguimiento debe distinguir:

| Pregunta | Evidencia necesaria |
| --- | --- |
| ¿Google descubre y puede indexar las páginas? | Sitemap, inspección de URL e informe de indexación. |
| ¿Aparecen para búsquedas adecuadas? | Consultas e impresiones por tipo de página y zona. |
| ¿Los resultados atraen visitas? | Clics y CTR junto con la posición y la consulta; sin interpretar el CTR aislado. |
| ¿Varias páginas compiten por la misma intención? | Consultas y URLs que reciben impresiones para ellas. |
| ¿Las visitas ayudan al negocio? | Consultas recibidas y servicios solicitados, medidos con respeto a la privacidad. |
| ¿Una ficha aporta valor suficiente? | Evidencia local disponible, preguntas que resuelve y comportamiento observado. |

El objetivo práctico es facilitar consultas pertinentes y sostener el contenido con información real. La auditoría deja mejoras aplicadas y un plan de evaluación; no garantiza resultados del buscador.

## 9. Fuentes primarias

Documentación consultada el 26 de octubre de 2026:

- [Google: políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies), apartados sobre páginas de entrada y contenido a escala.
- [Google: contenido útil, fiable y dirigido a las personas](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), incluidos originalidad, utilidad y atribución precisa.
- [Google: enlaces de título](https://developers.google.com/search/docs/appearance/title-link), concisión y selección del título mostrado.
- [Google: fragmentos y metadescripciones](https://developers.google.com/search/docs/appearance/snippet), selección del fragmento según la consulta.
- [Google: actualizaciones de documentación](https://developers.google.com/search/updates), entradas del 8 de mayo y 15 de junio de 2026 sobre la retirada del resultado enriquecido FAQ.
- [Google: datos estructurados LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), requisitos de dirección y nombre para la elegibilidad del resultado correspondiente.
- [Fuentes municipales del proyecto](localities-sources.md), método de selección, categorías y documentación de las referencias locales.
