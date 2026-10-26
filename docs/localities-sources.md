# Barrios y zonas: fuentes municipales

## Criterio de selección

Las referencias interiores se revisan a partir de publicaciones de los ayuntamientos: catálogos de barrios, mapas municipales, participación ciudadana, reglamentos y comunicaciones que identifican expresamente una zona residencial. El catálogo no pretende ser exhaustivo.

La revisión del 26 de octubre de 2026 sustituye por completo la importación anterior de núcleos del Nomenclátor. Se retiró esa colección y su importador: incluía polígonos industriales, un aeropuerto, campings y otras referencias que no servían para este bloque residencial. No se conserva ningún núcleo de aquella importación por defecto.

La relación general de municipios sigue usando sus códigos oficiales únicamente para enlazar cada registro con la localidad correcta. Los nombres de los barrios no proceden de esa relación municipal.

## Cobertura comprobada

| Elemento | Cantidad |
| --- | ---: |
| Municipios con referencias municipales | 44 |
| Barrios | 371 |
| Distritos | 6 |
| Urbanizaciones y zonas residenciales | 9 |
| Fuentes municipales | 56 |
| Provincias representadas | 19 |

Donde no existe una selección municipal verificada se omite el bloque. La página del municipio, sus servicios, averías y formulario continúan disponibles. La consulta admite escribir cualquier otra zona o dirección.

## Reglas editoriales y de datos

- Cada referencia conserva `name`, `type` y `sourceId`.
- Cada fuente conserva editor municipal, título, URL, fecha de consulta, método y una explicación breve de la evidencia. Los documentos descargados utilizados directamente pueden conservar además su checksum.
- Los distritos no se presentan como barrios. Las urbanizaciones y zonas residenciales se agrupan por separado. Las denominaciones agrupadas de una fuente municipal se conservan, como Estación-Manantiales o Centro-Rontegi.
- No se convierten automáticamente nombres de asociaciones, calles, parques, centros cívicos, paradas o polígonos en barrios. Solo se toma una denominación cuando el ayuntamiento identifica expresamente la zona.
- Se excluyen áreas industriales, campings, aeropuertos y campos de golf. No se infieren códigos postales ni límites geográficos.
- Una lista de barrios ayuda a localizar una consulta. No prueba que existan oficinas, trabajos realizados, disponibilidad inmediata ni datos de averías en esos barrios.

## Verificación y límites

Las fuentes son primarias municipales. En unos pocos casos, la lectura se realizó sobre contenido municipal indexado por el buscador porque la apertura directa devolvió un error; esa circunstancia figura expresamente en `evidence`. La fecha de consulta no se presenta como fecha de actualización del documento. Las fuentes antiguas solo se usan para las denominaciones comprobadas, sin atribuir vigencia a otras cifras o clasificaciones del documento.

`npm test` comprueba pertenencia al municipio y provincia, fuente de la misma localidad, categoría, duplicados y ausencia de denominaciones industriales o enlaces al Nomenclátor. `npm run check` revisa el sitio generado y sus enlaces.

## Municipios y fuentes

| Municipio | Provincia | Referencias | Fuentes municipales |
| --- | --- | ---: | --- |
| Avilés | Asturias | 12 | [Vive en Avilés: descubre nuestros barrios](https://aviles.es/vivienda/vive-en-aviles) |
| Gijón | Asturias | 10 | [Callejero municipal: distritos y barrios, marzo de 2023](https://drupal.gijon.es/sites/default/files/2023-05/callejero_gijon_reverso_0.pdf) |
| Oviedo | Asturias | 12 | [Distritos: organización territorial municipal](https://transparencia.oviedo.es/organizacion-y-servicios/distritos) |
| Barakaldo | Bizkaia | 12 | [Presupuestos Participativos de los Barrios de Barakaldo 2026](https://www.barakaldo.eus/OficinaVirtualBarakaldo/tramites/acceso.do?id=494) |
| Bilbao | Bizkaia | 12 | [Servicio de Información a la carta: barrios de Bilbao](https://www.bilbao.eus/aytoonline/jsp/fInscripcionNoticias1.jsp?idioma=c) |
| Getxo | Bizkaia | 5 | [Historia de Getxo: barrios oficiales](https://www.getxo.eus/es/turismo/descubre-getxo/Historia-getxo) |
| Aranda de Duero | Burgos | 8 | [Barrios, propuestas y respuestas](https://www.arandadeduero.es/barrios-propuestas-y-respuestas/) |
| Burgos | Burgos | 12 | [Reglamento de Organización y Funcionamiento de los Distritos Municipales de la Ciudad de Burgos](https://movilidad.aytoburgos.es/web/ayuntamiento-de-burgos/-/reglamento-de-organizaci%C3%B3n-y-funcionamiento-de-los-distritos-municipales-de-la-ciudad-de-burgos-) |
| Miranda de Ebro | Burgos | 10 | [Miranda de Ebro: unidad didáctica, apartado Sus barrios](https://www.mirandadeebro.es/wp-content/uploads/FMS/B3/B4/unid_didactica.pdf) |
| Santander | Cantabria | 7 | [Plan de Mejora de Viales en Barrios](https://www.santander.es/content/junta-aprobara-lunes-plan-mejora-viales-barrios)<br>[Santander, Punto de Encuentro Patrimonial: barrios entre Cazoña y Nueva Montaña](https://www.santander.es/sites/default/files/nota_de_prensa_santander_punto_de_encuentro_patrimonial_iii_0.pdf) |
| Torrelavega | Cantabria | 4 | [Mejora municipal de la recogida de residuos por barrios](https://torrelavega.es/noticia/el-ayuntamiento-de-torrelavega-unifica-varios-puntos-de-contenedores-de-residuos-en-el-centro-de-la-ciudad-para-recuperar-plazas-de-aparcamiento/) |
| Donostia/San Sebastián | Gipuzkoa | 12 | [Barrios y ámbitos territoriales](https://www.donostia.eus/es/como-es-ciudad/barrios) |
| Irun | Gipuzkoa | 12 | [El Alcalde en los barrios](https://www.irun.org/modi/participacion/barrios.aspx) |
| Alovera | Guadalajara | 2 | [Pistas de barrio](https://alovera.es/paginas/pistas-de-barrio/1041/) |
| Azuqueca de Henares | Guadalajara | 7 | [El Ayuntamiento firma el contrato de las obras de remodelación del barrio de la Estación](https://www.azuqueca.es/es/-/el-ayuntamiento-firma-el-contrato-de-las-obras-de-remodelacion-del-barrio-de-la-estacion)<br>[Adjudicadas las obras de remodelación integral del barrio de El Vallejo](https://www.azuqueca.es/es/-/adjudicadas-las-obras-de-remodelacion-integral-del-barrio-de-el-vallejo) |
| Guadalajara | Guadalajara | 10 | [Plano municipal: división en barrios](https://www.guadalajara.es/recursos/doc/portal/2018/04/09/plano-callejero-de-la-ciudad-de-guadalajara-division-en-barrios-actualizado-en-2.pdf) |
| Arnedo | La Rioja | 3 | [Fiestas de los Barrios 2026](https://www.arnedo.com/noticia/este-verano-la-fiesta-va-por-barrios/) |
| Calahorra | La Rioja | 3 | [Proyecto de mejora de la accesibilidad del casco urbano](https://calahorra.es/el-ayuntamiento-de-calahorra-redactara-un-proyecto-para-la-mejora-de-la-accesibilidad-en-todo-el-casco-urbano/)<br>[Regeneración urbana: Entorno Residencial Quintiliano](https://calahorra.es/el-ayuntamiento-de-calahorra-participa-en-la-jornada-de-regeneracion-urbana-a-nivel-de-barrio/)<br>[Fiestas del Casco Antiguo 2026](https://calahorra.es/del-17-al-19-de-julio-el-casco-antiguo-celebra-la-45o-edicion-de-sus-fiestas/) |
| Logroño | La Rioja | 10 | [Distrito Sur: barrios y zonas residenciales](https://logrono.es/distrito-sur)<br>[Distrito Este: barrios y zonas residenciales](https://logrono.es/distrito-este) |
| León | León | 12 | [Concejales de Barrio](https://www.aytoleon.es/es/tu-ayuntamiento/organizaci%C3%B3n/concejales-barrio/Paginas/default.aspx) |
| Ponferrada | León | 6 | [Órganos Territoriales Desconcentrados: Alcaldías de Barrio](https://www.ponferrada.org/es/organizacion-administrativa/organos-territoriales-desconcentrados-alcaldias-barrio) |
| Alcalá de Henares | Madrid | 12 | [Consejos de Barrio](https://distritos.ayto-alcaladehenares.es/consejos-de-barrio/) |
| Getafe | Madrid | 11 | [Getafe retoma las asambleas de barrio desde el 11 de octubre hasta el 18 de noviembre](https://getafe.es/getafe-retoma-las-asambleas-de-barrio-desde-el-11-de-octubre-hasta-el-18-de-noviembre/) |
| Leganés | Madrid | 9 | [Nuevo plan intensivo de limpieza viaria por barrios: marzo, abril y mayo de 2026](https://www.leganes.org/w/el-ayuntamiento-pone-en-marcha-un-nuevo-plan-intensivo-de-limpieza-viaria-por-barrios-los-meses-de-marzo-abril-y-mayo) |
| Madrid | Madrid | 12 | [Barrios municipales de Madrid](https://datos.madrid.es/dataset/300496-0-barrios-madrid) |
| Móstoles | Madrid | 6 | [Juntas de Distrito](https://www.mostoles.es/mostoles/cm/ayto-mostoles/tkContent?idContent=73&locale=es_ES&textOnly=false) |
| Pamplona/Iruña | Navarra | 12 | [Listado de barrios de Pamplona](https://www.pamplona.es/ayuntamiento/varios/listado-de-barrios-de-pamplona) |
| Tudela | Navarra | 4 | [Acondicionamiento de pasos peatonales por zonas residenciales](https://tudela.es/noticia/107000-eur-para-obras-de-acondicionamiento-de-diversos-pasos-peatonales-en-las-calles-de-tudela) |
| Palencia | Palencia | 12 | [Centros de Acción Social](https://www.aytopalencia.es/area/servicios-sociales-municipales/centros) |
| Salamanca | Salamanca | 12 | [Reglamento para la Participación Democrática en la Ciudad de Salamanca](https://www.aytosalamanca.es/documents/20119/771790/reglamento-participacion-democratica-salamanca-2.pdf/ddcfbd56-26ec-4bed-dd2d-bc0eedc7376b?t=1742462383222) |
| Segovia | Segovia | 12 | [CEAS Centro: barrios comprendidos en la zona Centro](https://www.segovia.es/en/node/12153)<br>[CEAS Norte: barrios comprendidos en la zona Norte](https://www.segovia.es/index.php/area/servicios-sociales/ceas-norte)<br>[CEAS Sur: barrios comprendidos en la zona Sur](https://segovia.es/en/node/12154) |
| Soria | Soria | 5 | [La Junta de Gobierno Local aprueba nuevas inversiones en barrios con actuaciones en Los Pajaritos y Los Royales](https://www.soria.es/es/actualidad/la-junta-de-gobierno-local-aprueba-nuevas-inversiones-en-barrios-con-actuaciones-en-los)<br>[Paradas sonoras](https://agendacultural.soria.es/paradas-sonoras-2/)<br>[Y el Calaverón celebró su 20 Feria de Abril](https://elige.soria.es/y-el-calaveron-celebro-su-20-feria-de-abril/) |
| Illescas | Toledo | 2 | [Revista de información municipal, junio de 2026](https://illescas.es/wp-content/uploads/2026/07/maqueta_revista_junio_2026.pdf)<br>[Illescas cuenta con una nueva zona de aparcamiento en la parte sur del municipio](https://illescas.es/illescas-cuenta-con-una-nueva-zona-de-aparcamiento-en-la-parte-sur-del-municipio/) |
| Seseña | Toledo | 3 | [Cabalgata de Reyes en el Municipio](https://ayto-sesena.org/9398-2/) |
| Talavera de la Reina | Toledo | 12 | [Programa municipal de Mondas 2026: pregones en los barrios](https://talavera.es/download/332/mondas/89950/programa-mondas-2026.pdf) |
| Toledo | Toledo | 10 | [Diagnóstico de infancia y adolescencia: barrios de la ciudad](https://www.toledo.es/wp-content/uploads/2016/12/diagnostico-de-infancia-y-adolescencia.pdf)<br>[Distrito Norte: barrios y urbanizaciones](https://www.toledo.es/servicios-municipales/oficinas-de-atencion-al-ciudadano/norte/) |
| Medina del Campo | Valladolid | 5 | [Memoria de la Policía Local 2018: fiestas de los barrios](https://www.ayto-medinadelcampo.es/images/AytoMedina/Policia/2018_Memoria-Policia-Local.pdf) |
| Valladolid | Valladolid | 12 | [Plano de Barrios y Subzonas](https://www10.ava.es/cartografia/Descarga_pdf/Barrios%20y%20subzonas.pdf) |
| Benavente | Zamora | 5 | [Modelo de solicitud de subvención del Área de Regeneración Urbana](https://benavente.es/wp-content/uploads/2025/03/MODELO-SOLICITUD-SUBVENCION-1-2021.pdf) |
| Zamora | Zamora | 12 | [Datos Línea Zamora: datos por barrios](https://www.zamora.es/img/cargadas/Datos%20L%C3%ADneaZamora.pdf) |
| Amurrio | Álava | 10 | [Asambleas de barrios](https://udala.amurrio.eus/cas/servicios/participacion/asambleas-de-barrios) |
| Laudio/Llodio | Álava | 7 | [Laudio/Llodio: nuestro valle](https://www.laudio.eus/es/cita-sac/nuestro-valle) |
| Vitoria-Gasteiz | Álava | 12 | [Asociaciones vecinales: campo municipal Barrio](https://www.vitoria-gasteiz.org/wb021/was/contenidoAction.do?idioma=es&uid=_626ee0af_11a9fc4637f__7ffa) |
| Ávila | Ávila | 8 | [Aprobada la Estrategia de Desarrollo Urbano Sostenible e Integrado (EDUSI)](https://www.avila.es/ciudad/feder/comunicacion/item/3465-aprobada-la-estrategia-de-desarrollo-urbano-sostenible-e-integrado-edusi)<br>[Acta del Pleno ordinario de 30 de diciembre de 2022](https://www.avila.es/areas-destacadas/secretaria-contratacion/juntas-de-gobierno/category/112-actas-de-plenos-corporativos-2022?download=1812:acta-13-22-pleno-ordinario-30-de-diciembre-2022) |

La procedencia individual y la explicación de la comprobación están en `data/localities.json`. Para ampliar la selección, revisar primero una fuente del ayuntamiento, añadir solo nombres comprobados y ejecutar las validaciones. No existe un importador masivo de núcleos.
