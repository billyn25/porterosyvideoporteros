# Calles, barrios y localidades: fuentes oficiales

Este documento describe la selección manual de `data/localities.json` y su relación con el callejero importado. La combinación aporta referencias de ubicación a **los 3.797 municipios de las 19 provincias**. Los nombres de barrios, calles, parroquias y pueblos mantienen categorías diferentes; el catálogo no pretende ser un inventario completo de cada municipio.

## Procedencia y evolución

La revisión del **26 de octubre de 2026** retiró por completo la importación anterior de núcleos del **Nomenclátor**, junto con su importador. Aquella colección incluía polígonos industriales, un aeropuerto, campings y otras referencias inadecuadas para el bloque de ubicación. Ningún núcleo de aquella importación se conserva por defecto.

En la primera sustitución se documentaron 386 referencias de 44 municipios mediante 56 fuentes municipales: 371 barrios, seis distritos y nueve zonas residenciales. Esas cifras corresponden a una etapa anterior de la revisión. La ampliación posterior, también del 26 de octubre, deja la selección manual en **766 referencias de 130 municipios, con 145 fuentes oficiales**.

El nuevo conjunto de vías procede del **[Callejero del Censo Electoral del INE](https://www.ine.es/dyngs/DAB/es/index.htm?cid=1390)**, edición **julio de 2026**, con fecha de referencia **30 de junio de 2026**. Se leen exclusivamente los ficheros de vías `VIAS` y de tramos `TRAM`. No se importa el Nomenclátor, ni UP, PSEU o SECC, ni se extraen nombres de entidades de población desde TRAM. El código municipal identifica cada registro; una similitud entre nombres no se usa para asignar pertenencia.

La [documentación de la ampliación geográfica](geographic-expansion.md) recoge el alcance de la importación y su integración. Las instrucciones del importador están en el [README](../README.md#mantener-el-callejero-oficial).

## Cobertura comprobada

### Selección manual de fuentes oficiales

Los siguientes valores se derivan de [data/localities.json](../data/localities.json), esquema 3:

| Elemento | Cantidad |
| --- | ---: |
| Municipios con selección manual | 130 |
| Referencias manuales | 766 |
| Barrios | 517 |
| Distritos | 6 |
| Urbanizaciones y zonas residenciales | 9 |
| Parroquias | 6 |
| Localidades y pueblos | 204 |
| Vías revisadas manualmente | 24 |
| Fuentes oficiales | 145 |
| Provincias representadas | 19 |

### Callejero y resultado combinado

[data/streets.json](../data/streets.json) documenta **52.084 vías seleccionadas en 3.714 municipios**, repartidas en 19 archivos provinciales. Los **83 municipios sin vías admisibles** conservan su motivo de excepción; disponen de referencias revisadas en la selección manual. Por tanto, la ausencia de barrios municipales revisados no implica omitir el bloque: las demás páginas pueden mostrar calles, avenidas, plazas o paseos de la fuente electoral.

La combinación de ambos conjuntos, calculada con `localReferences` de [scripts/local-geography.mjs](../scripts/local-geography.mjs) y contrastada con el build final en `qa/geography-audit.json`, queda así:

| Resultado para las páginas | Cantidad |
| --- | ---: |
| Municipios con alguna referencia | 3.797 |
| Municipios con alguna vía | 3.718 |
| Municipios con áreas distintas de vías | 127 |
| Vías después de combinar y eliminar etiquetas repetidas | 52.100 |
| Barrios, distritos, zonas residenciales, parroquias y localidades | 742 |
| Referencias combinadas | 52.842 |

Los totales almacenados y los combinados son distintos: las 24 vías manuales se incorporan al grupo de vías y se eliminan etiquetas repetidas. Los 130 municipios de la selección manual incluyen tres con únicamente vías. Las categorías y fuentes se conservan; estos conteos no significan que existan barrios documentados en todos los municipios.

## Criterio de selección

Las referencias manuales proceden de publicaciones de ayuntamientos, diputaciones y organismos autonómicos oficiales: catálogos de barrios, mapas, participación ciudadana, reglamentos, callejeros, guías y descripciones del municipio. En el medio rural se admiten parroquias o localidades cuando la fuente las identifica expresamente. Por ejemplo, Las Regueras conserva parroquias; los pueblos de Caso quedan como localidades; los seis nombres seleccionados de Alles, en Peñamellera Alta, aparecen como barrios en la publicación municipal.

El bloque de cada página adapta su título a las categorías disponibles: barrios, parroquias, localidades, zonas o calles y plazas. La consulta sigue admitiendo escribir otra zona o dirección. Elegir una referencia completa el municipio, la provincia y esa ubicación en el formulario; no crea una reserva ni confirma una actuación allí.

El callejero admite hasta **16 vías por municipio**, de las familias calle, avenida, plaza y paseo y sus equivalentes publicados en el diccionario oficial. Conserva `sourceName`, `sourceType`, código de vía, registros de tramos y códigos postales cuando constan. La selección es determinista; el número de tramos o la coincidencia con determinadas denominaciones no se presenta como medida de centralidad, viviendas, demanda o importancia comercial.

## Reglas editoriales y de datos

- Cada referencia manual conserva `name`, `type` y `sourceId`. Los tipos admitidos son `neighborhood`, `district`, `residential-area`, `parish`, `locality` y `street`.
- Cada fuente conserva editor, título, URL, fecha de consulta, método, códigos municipales aplicables y una explicación de la evidencia. Cuando se utiliza un archivo descargado puede conservar también su checksum.
- Los distritos, parroquias, localidades y vías no se presentan como barrios. Las denominaciones agrupadas se mantienen cuando así las publica la fuente, como Estación-Manantiales o Centro-Rontegi.
- No se convierten nombres de asociaciones, parques, centros cívicos, paradas o polígonos en barrios. Se comprueba la denominación y su relación con el municipio.
- Se excluyen referencias industriales, campings, aeropuertos, campos de golf y códigos técnicos. Una vía admitida por su tipo y nombre no acredita que todos sus inmuebles sean residenciales.
- Los códigos postales del callejero proceden de `TRAM`. Una vía puede tener varios; no se asigna uno por deducción al conjunto de la vía, a un barrio o al municipio. Tampoco se infieren límites geográficos.
- No se añaden nombres para completar artificialmente una cantidad. Tresviso conserva una única localidad documentada, sin inventar barrios.
- Las referencias ayudan a localizar una consulta. No prueban oficinas, trabajos realizados, disponibilidad inmediata ni averías concretas en esos lugares; tampoco garantizan indexación o posiciones en buscadores.

## Verificación y límites

Las fuentes son oficiales. Parte de las denominaciones se comprobó en contenido oficial indexado por el buscador porque la apertura directa devolvía un error o una pantalla de comprobación; esa circunstancia figura en `evidence`. La fecha de consulta no equivale a la fecha de actualización del documento. De las fuentes antiguas solo se utilizan los nombres comprobados, sin trasladar cifras demográficas o afirmaciones de vigencia ajenas al propósito de este catálogo.

La importación mantiene la URL de descarga, el diseño de registro, el diccionario de tipos, las fechas y los SHA-256 de los archivos en [data/streets.json](../data/streets.json). El build ordinario lee los JSON versionados y no realiza descargas.

`npm test` comprueba la pertenencia al municipio y provincia, las fuentes y categorías, duplicados, exclusiones y la combinación de las referencias. `npm run check` revisa el sitio generado y sus enlaces. **`npm run audit:geography`** compara los datos con los bloques presentes en los 3.797 HTML municipales y los 192 enlaces del directorio de portada, verifica referencias y fuentes, y escribe `qa/geography-audit.json`. Debe ejecutarse después de reconstruir `dist/` cuando cambien los datos o las plantillas. La auditoría comprueba la integración; no sustituye la comprobación humana de las fuentes.

## Los 130 municipios con selección manual y sus fuentes

Tabla derivada de `data/localities.json`, revisado el 26 de octubre de 2026. Incluye las **145 fuentes oficiales utilizadas**. Los recuentos de cada fila corresponden a la selección manual y no incluyen las vías del callejero electoral. El código INE permite distinguir municipios homónimos.

| Código INE | Municipio | Provincia | Referencias | Categorías | Fuentes oficiales |
| --- | --- | --- | ---: | --- | --- |
| 33003 | Amieva | Asturias | 6 | 6 localidades | [Ayuntamiento de Amieva — Parroquias](https://www.amieva.es/parroquias) |
| 33004 | Avilés | Asturias | 12 | 12 barrios | [Ayuntamiento de Avilés — Vive en Avilés: descubre nuestros barrios](https://aviles.es/vivienda/vive-en-aviles) |
| 33015 | Caso | Asturias | 6 | 6 localidades | [Ayuntamiento de Caso — Núcleos y Parroquias](https://www.ayto-caso.es/ast/nucleos-y-parroquias) |
| 33024 | Gijón | Asturias | 10 | 10 barrios | [Ayuntamiento de Gijón/Xixón — Callejero municipal: distritos y barrios, marzo de 2023](https://drupal.gijon.es/sites/default/files/2023-05/callejero_gijon_reverso_0.pdf) |
| 33054 | Las Regueras | Asturias | 6 | 6 parroquias | [Ayuntamiento de Las Regueras — División Parroquial de Las Regueras](https://www.lasregueras.es/parroquias) |
| 33043 | Onís | Asturias | 6 | 6 localidades | [Ayuntamiento de Onís — Localización](https://www.onis.es/en/localizacion) |
| 33044 | Oviedo | Asturias | 12 | 12 barrios | [Ayuntamiento de Oviedo — Distritos: organización territorial municipal](https://transparencia.oviedo.es/organizacion-y-servicios/distritos) |
| 33046 | Peñamellera Alta | Asturias | 6 | 6 barrios | [Ayuntamiento de Peñamellera Alta — Pueblos - Alles](https://www.aytopenamelleraalta.es/ast/alles) |
| 33067 | Sobrescobio | Asturias | 6 | 6 localidades | [Ayuntamiento de Sobrescobio — Localización](https://www.ayto-sobrescobio.es/localizacion) |
| 33078 | Yernes y Tameza | Asturias | 5 | 5 localidades | [Ayuntamiento de Yernes y Tameza — Parroquias de Yernes y Tameza](https://www.yernesytameza.es/parroquias) |
| 39003 | Anievas | Cantabria | 4 | 4 localidades | [Ayuntamiento de Anievas — Poblaciones](https://www.aytoanievas.org/municipio/poblaciones) |
| 39015 | Camaleño | Cantabria | 6 | 6 localidades | [Ayuntamiento de Camaleño — Pueblos](https://www.ayuntamientocamaleno.com/pueblos.htm) |
| 39017 | Campoo de Yuso | Cantabria | 6 | 6 localidades | [Ayuntamiento de Campoo de Yuso — Campoo de Yuso: situación y descripción](https://www.campoodeyuso.es/situacion-y-descripcion-campoo-de-yuso/) |
| 39026 | Corvera de Toranzo | Cantabria | 6 | 6 localidades | [Ayuntamiento de Corvera de Toranzo — Nuestros pueblos](https://www.corveradetoranzo.com/view/02-Nuestros-pueblos-Corvera-de-Toranzo-Cantabria) |
| 39028 | Entrambasaguas | Cantabria | 6 | 6 localidades | [Ayuntamiento de Entrambasaguas — Patrimonio Cultural](https://www.entrambasaguas.org/patrimonio-cultural) |
| 39030 | Guriezo | Cantabria | 1 | 1 barrio | [Ayuntamiento de Guriezo — Nuestro pueblo](https://aytoguriezo.es/nuestra-historia/) |
| 39033 | Herrerías | Cantabria | 6 | 6 localidades | [Ayuntamiento de Herrerías — Localización y Entorno](https://aytoherrerias.es/municipio/descubre-el-municipio/localizacion-y-entorno/) |
| 39034 | Lamasón | Cantabria | 4 | 4 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Lamasón — Localidades del municipio](https://turismodecantabria.com/municipios/lamason/) |
| 39065 | Las Rozas de Valdearroyo | Cantabria | 5 | 5 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Las Rozas de Valdearroyo — Localidades del municipio](https://turismodecantabria.com/municipios/las-rozas-de-valdearroyo/) |
| 39036 | Liendo | Cantabria | 6 | 6 barrios | [Ayuntamiento de Liendo — Fiestas y Tradiciones](https://aytoliendo.org/municipio/fiestas-y-tradiciones/) |
| 39039 | Luena | Cantabria | 6 | 6 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Luena — Localidades del municipio](https://turismodecantabria.com/municipios/luena/) |
| 39041 | Mazcuerras | Cantabria | 6 | 6 localidades | [Ayuntamiento de Mazcuerras — Historia del municipio](https://www.aytomazcuerras.es/el-municipio/historia-del-municipio) |
| 39050 | Pesaguero | Cantabria | 6 | 6 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Pesaguero — Localidades del municipio](https://turismodecantabria.com/municipios/pesaguero/) |
| 39053 | Polaciones | Cantabria | 6 | 6 localidades | [Ayuntamiento de Polaciones — Pueblos de Polaciones](https://www.ayuntamientopolaciones.es/municipio/) |
| 39054 | Polanco | Cantabria | 6 | 6 barrios | [Ayuntamiento de Polanco — Núcleos de Población](https://www.aytopolanco.org/municipio/nucleos-de-poblacion/) |
| 39062 | Ribamontán al Monte | Cantabria | 6 | 6 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Ribamontán al Monte — Localidades del municipio](https://turismodecantabria.com/municipios/ribamontan-al-monte/) |
| 39063 | Rionansa | Cantabria | 6 | 6 localidades | [Ayuntamiento de Rionansa — Sobre Nosotros](https://aytorionansa.com/rionansa/sobre-nosotros/) |
| 39069 | San Felices de Buelna | Cantabria | 6 | 6 localidades | [Ayuntamiento de San Felices de Buelna — Localidades](https://sanfelicesdebuelna.es/municipio/localidades/) |
| 39072 | San Roque de Riomiera | Cantabria | 3 | 3 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — San Roque de Riomiera — Localidades del municipio](https://turismodecantabria.com/municipios/san-roque-de-riomiera/) |
| 39075 | Santander | Cantabria | 7 | 7 barrios | [Ayuntamiento de Santander — Plan de Mejora de Viales en Barrios](https://www.santander.es/content/junta-aprobara-lunes-plan-mejora-viales-barrios)<br>[Ayuntamiento de Santander — Santander, Punto de Encuentro Patrimonial: barrios entre Cazoña y Nueva Montaña](https://www.santander.es/sites/default/files/nota_de_prensa_santander_punto_de_encuentro_patrimonial_iii_0.pdf) |
| 39078 | Santiurde de Toranzo | Cantabria | 6 | 6 localidades | [Ayuntamiento de Santiurde de Toranzo — Nuestros pueblos](https://www.ayto-santiurde.com/turismo/pueblos-valle-de-toranzo/) |
| 39081 | Saro | Cantabria | 2 | 2 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Saro — Localidades del municipio](https://turismodecantabria.com/municipios/saro/) |
| 39083 | Soba | Cantabria | 6 | 6 localidades | [Ayuntamiento de Soba — Presentación del municipio](https://www.soba.es/el-municipio/demograf%C3%ADa) |
| 39087 | Torrelavega | Cantabria | 4 | 4 barrios | [Ayuntamiento de Torrelavega — Mejora municipal de la recogida de residuos por barrios](https://torrelavega.es/noticia/el-ayuntamiento-de-torrelavega-unifica-varios-puntos-de-contenedores-de-residuos-en-el-centro-de-la-ciudad-para-recuperar-plazas-de-aparcamiento/) |
| 39088 | Tresviso | Cantabria | 1 | 1 localidad | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Tresviso — Localidades del municipio](https://turismodecantabria.com/municipios/tresviso/) |
| 39089 | Tudanca | Cantabria | 4 | 4 localidades | [Ayuntamiento de Tudanca — Localización y Entorno](https://aytotudanca.es/municipio/descubre-el-municipio/localizacion-y-entorno/) |
| 39090 | Udías | Cantabria | 6 | 6 localidades | [Ayuntamiento de Udías — Municipio de Udías — Guía de turismo](https://ayuntamientoudias.com/wp-content/uploads/2023/02/GuiaTurismoWeb.pdf) |
| 39091 | Valdáliga | Cantabria | 6 | 6 localidades | [Ayuntamiento de Valdáliga — Rutas — Ruta literaria](https://www.aytovaldaliga.org/rutas.html) |
| 39093 | Valdeprado del Río | Cantabria | 6 | 6 localidades | [Ayuntamiento de Valdeprado del Río — Nuestros pueblos](https://aytovaldepradodelrio.com/nuestros-pueblos/) |
| 39101 | Valle de Villaverde | Cantabria | 6 | 6 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Valle de Villaverde — Localidades del municipio](https://turismodecantabria.com/municipios/valle-de-villaverde/) |
| 39099 | Villaescusa | Cantabria | 4 | 4 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Villaescusa — Localidades del municipio](https://turismodecantabria.com/municipios/villaescusa/) |
| 39100 | Villafufre | Cantabria | 4 | 4 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Villafufre — Localidades del municipio](https://turismodecantabria.com/municipios/villafufre/) |
| 39102 | Voto | Cantabria | 6 | 6 localidades | [Sociedad Regional Cántabra de Promoción Turística, S.A. (CANTUR) — Voto — Localidades del municipio](https://turismodecantabria.com/municipios/voto/) |
| 48004 | Amoroto | Bizkaia | 4 | 4 barrios | [Gobierno Vasco — Amoroto: información turística oficial](https://www.euskadi.eus/contenidos/d_destinos_turisticos/0000005563_d2_rec_turismo/es_5563/5563-ficha2.html) |
| 48005 | Arakaldo | Bizkaia | 1 | 1 barrio | [Diputación Foral de Bizkaia — Directorio de ayuntamientos de Bizkaia](https://www.bizkaia.eus/documents/1135059/1352300/Directorio%2Bde%2BAyuntamientos.pdf/5fdbea43-825f-12bc-488e-6af9839e62a3) |
| 48914 | Arratzu | Bizkaia | 4 | 4 barrios | [Diputación Foral de Bizkaia — Ruta BUS13 Arratzu: Loiola-Barrutia](https://www.bizkaia.eus/es/web/rutas-del-colesterol/ruta/-/ficha/48) |
| 48010 | Arrieta | Bizkaia | 1 | 1 barrio | [Diputación Foral de Bizkaia — Directorio de ayuntamientos de Bizkaia](https://www.bizkaia.eus/documents/1135059/1352300/Directorio%2Bde%2BAyuntamientos.pdf/5fdbea43-825f-12bc-488e-6af9839e62a3) |
| 48013 | Barakaldo | Bizkaia | 12 | 12 barrios | [Ayuntamiento de Barakaldo — Presupuestos Participativos de los Barrios de Barakaldo 2026](https://www.barakaldo.eus/OficinaVirtualBarakaldo/tramites/acceso.do?id=494) |
| 48020 | Bilbao | Bizkaia | 12 | 12 barrios | [Ayuntamiento de Bilbao — Servicio de Información a la carta: barrios de Bilbao](https://www.bilbao.eus/aytoonline/jsp/fInscripcionNoticias1.jsp?idioma=c) |
| 48021 | Busturia | Bizkaia | 1 | 1 barrio | [Diputación Foral de Bizkaia — Directorio de ayuntamientos de Bizkaia](https://www.bizkaia.eus/documents/1135059/1352300/Directorio%2Bde%2BAyuntamientos.pdf/5fdbea43-825f-12bc-488e-6af9839e62a3) |
| 48033 | Ereño | Bizkaia | 3 | 3 barrios | [Diputación Foral de Bizkaia — Ruta BUS03 Ereño: Elexalde-Gabika](https://www.bizkaia.eus/es/web/rutas-del-colesterol/ruta/-/ficha/39) |
| 48079 | Errigoiti | Bizkaia | 4 | 4 barrios | [Diputación Foral de Bizkaia — Evaluación ambiental del PGOU de Errigoiti: diagnóstico territorial](https://baliabideak.bizkaia.eus/impacto_ambiental/EAE/2020/EAE-20-01/Documento%20Inicial%20Estrategico.pdf) |
| 48035 | Fruiz | Bizkaia | 1 | 1 vía | [Diputación Foral de Bizkaia — Directorio de ayuntamientos de Bizkaia](https://www.bizkaia.eus/documents/1135059/1352300/Directorio%2Bde%2BAyuntamientos.pdf/5fdbea43-825f-12bc-488e-6af9839e62a3) |
| 48038 | Gamiz-Fika | Bizkaia | 4 | 4 barrios | [Ayuntamiento de Gamiz-Fika — Avance del PGOU: barrios de Gamiz-Fika](https://www.gamiz-fika.eus/es-ES/Ayuntamiento/Urbanismo/pgou_avance/01-I_MEMORIA_AVANCEv2_junio_.pdf) |
| 48039 | Garai | Bizkaia | 3 | 2 barrios; 1 localidad | [Ayuntamiento de Garai — Avance del PGOU de Garai, noviembre de 2024](https://www.garai-udala.eus/es-ES/Ayuntamiento/urbanismo-medio-ambiente/Urbanismo/Avance/02-2324_av_garai_cas.pdf) |
| 48040 | Gatika | Bizkaia | 6 | 6 barrios | [Gobierno Vasco — Plan de Acción del Paisaje para la Vega del Río Butrón: Gatika](https://www.euskadi.eus/contenidos/informacion/planes_accion_paisaje2/es_def/adjuntos/2016/PAP/9.B_PAP_GATIKA.pdf) |
| 48044 | Getxo | Bizkaia | 5 | 5 barrios | [Ayuntamiento de Getxo — Historia de Getxo: barrios oficiales](https://www.getxo.eus/es/turismo/descubre-getxo/Historia-getxo) |
| 48048 | Ibarrangelu | Bizkaia | 6 | 6 barrios | [Ayuntamiento de Ibarrangelu — Situación: barrios de Ibarrangelu](https://www.ibarrangelu.eus/es-ES/Turismo/Situacion/Paginas/default.aspx) |
| 48022 | Karrantza Harana/Valle de Carranza | Bizkaia | 2 | 2 barrios | [Ayuntamiento de Karrantza Harana/Valle de Carranza — Patrimonio indiano de Karrantza](https://www.karrantza.org/es-ES/Turistas/Patrimonio-Historia/Paginas/PatrimonioIndiano.aspx) |
| 48907 | Kortezubi | Bizkaia | 2 | 2 barrios | [Gobierno Vasco — Contratación de Kortezubi: conexión entre Idokiliz y Santa Ana](https://www.contratacion.euskadi.eus/ac70cPublicidadWar/trazabilidad/723812?R01HNoPortal=true&idioma=es) |
| 48081 | Lezama | Bizkaia | 1 | 1 barrio | [Diputación Foral de Bizkaia — Directorio de ayuntamientos: Lezama](https://www.bizkaia.eus/documents/1135059/1352300/Directorio%2Bde%2BAyuntamientos.pdf/5fdbea43-825f-12bc-488e-6af9839e62a3) |
| 48061 | Maruri-Jatabe | Bizkaia | 2 | 2 barrios | [Ayuntamiento de Maruri-Jatabe — Reposición de luminarias en los barrios Elortegi y Sakalde](https://www.maruri-jatabe.eus/es-ES/Noticias/Paginas/20211104-ayuntamiento-maruri-jatabe-adjudicado-obras-reposicion-luminarias-autonomas-barrios-elortegi-sakalde.aspx) |
| 48064 | Meñaka | Bizkaia | 2 | 2 barrios | [Gobierno Vasco — BOPV 2025/5148: acera-bici en el término de Meñaka](https://www.euskadi.eus/bopv2/datos/2025/12/2505148a.shtml) |
| 48063 | Mendexa | Bizkaia | 3 | 3 barrios | [Gobierno Vasco — Turismo Euskadi: Mendexa](https://turismo.euskadi.eus/es/localidades/mendexa/webtur00-content/es/) |
| 48908 | Murueta | Bizkaia | 2 | 2 barrios | [Ayuntamiento de Murueta — Mejora de accesibilidad del barrio Larrabe](https://www.murueta.eus/es-ES/Noticias/Paginas/20240719_Larrabe_auzoa_irisgarritasun_lanak.aspx)<br>[Ayuntamiento de Murueta — Salud: consultorio de Murueta](https://www.murueta.eus/es-ES/Servicios/Salud/Paginas/default.aspx) |
| 48909 | Nabarniz | Bizkaia | 2 | 2 barrios | [Ayuntamiento de Nabarniz — Movilidad entre los barrios Elexalde y Lekerika](https://www.nabarniz.eus/es-ES/Noticias/Paginas/20230310-movilidad-sostenible-conectividad-barrios-elexalde-lekerika.aspx) |
| 48088 | Ubide | Bizkaia | 2 | 2 barrios | [Ayuntamiento de Ubide — Barrios de Ubide](https://www.ubide.eus/es-ES/para-disfrutar/Paginas/Barrios.aspx) |
| 48097 | Zaratamo | Bizkaia | 3 | 3 barrios | [Ayuntamiento de Zaratamo — Alegaciones de Zaratamo sobre Bizkaibus, mayo de 2026](https://www.zaratamo.eus/es-ES/Noticias/Documents/20260525-bizkaibus-alegazioak-cas.pdf) |
| 20001 | Abaltzisketa | Gipuzkoa | 6 | 5 barrios; 1 vía | [Diputación Foral de Gipuzkoa — Callejero oficial de Abaltzisketa](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/municipio/abaltzisketa) |
| 20004 | Albiztur | Gipuzkoa | 6 | 6 barrios | [Diputación Foral de Gipuzkoa — Barrios de Albiztur en el directorio geográfico foral](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/barrio?city=004) |
| 20906 | Altzaga | Gipuzkoa | 3 | 3 barrios | [Diputación Foral de Gipuzkoa — Barrios de Altzaga en el directorio geográfico foral](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/barrio?city=087) |
| 20015 | Ataun | Gipuzkoa | 6 | 6 barrios | [Diputación Foral de Gipuzkoa — Callejero oficial de Ataun](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/municipio/ataun) |
| 20021 | Belauntza | Gipuzkoa | 1 | 1 localidad | [Gobierno Vasco — GeoEuskadi — Callejero oficial: Belauntza, Elduain y Gaztelu; tipos geográficos de las direcciones](https://www.geo.euskadi.eus/geoeuskadi/rest/services/DGSGIS/WFS_DGSGIS/MapServer/7/query?where=CAL_PROV%3D%2720%27+AND+%28CAL_MUNI+IN+%28%27021%27%2C%27031%27%2C%27907%27%29+OR+CAL_MUNI_DS_O+IN+%28%27Belauntza%27%2C%27Elduain%27%2C%27Gaztelu%27%29%29&outFields=CAL_PROV%2CCAL_MUNI%2CCAL_MUNI_DS_O%2CCAL_TVI_DS_C%2CCAL_TVI_DS_E%2CCAL_DS_O%2CCAL_DS_E&returnGeometry=false&returnDistinctValues=true&f=json) |
| 20024 | Bidania-Goiatz | Gipuzkoa | 6 | 6 barrios | [Diputación Foral de Gipuzkoa — Barrios de Bidania-Goiatz en el directorio geográfico foral](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/barrio?city=024) |
| 20069 | Donostia/San Sebastián | Gipuzkoa | 12 | 12 barrios | [Ayuntamiento de Donostia / San Sebastián — Barrios y ámbitos territoriales](https://www.donostia.eus/es/como-es-ciudad/barrios) |
| 20031 | Elduain | Gipuzkoa | 1 | 1 localidad | [Gobierno Vasco — GeoEuskadi — Callejero oficial: Belauntza, Elduain y Gaztelu; tipos geográficos de las direcciones](https://www.geo.euskadi.eus/geoeuskadi/rest/services/DGSGIS/WFS_DGSGIS/MapServer/7/query?where=CAL_PROV%3D%2720%27+AND+%28CAL_MUNI+IN+%28%27021%27%2C%27031%27%2C%27907%27%29+OR+CAL_MUNI_DS_O+IN+%28%27Belauntza%27%2C%27Elduain%27%2C%27Gaztelu%27%29%29&outFields=CAL_PROV%2CCAL_MUNI%2CCAL_MUNI_DS_O%2CCAL_TVI_DS_C%2CCAL_TVI_DS_E%2CCAL_DS_O%2CCAL_DS_E&returnGeometry=false&returnDistinctValues=true&f=json) |
| 20066 | Errezil | Gipuzkoa | 6 | 6 barrios | [Diputación Foral de Gipuzkoa — Callejero oficial de Errezil](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/municipio/errezil) |
| 20037 | Gaintza | Gipuzkoa | 1 | 1 vía | [Diputación Foral de Gipuzkoa — Directorio de organismos: Ayuntamiento de Gaintza](https://egoitza.gipuzkoa.eus/WAS/HACI/HFAPortalProveedorWEB/organismos.do?i=G&indice=) |
| 20907 | Gaztelu | Gipuzkoa | 1 | 1 barrio | [Gobierno Vasco — GeoEuskadi — Callejero oficial: Belauntza, Elduain y Gaztelu; tipos geográficos de las direcciones](https://www.geo.euskadi.eus/geoeuskadi/rest/services/DGSGIS/WFS_DGSGIS/MapServer/7/query?where=CAL_PROV%3D%2720%27+AND+%28CAL_MUNI+IN+%28%27021%27%2C%27031%27%2C%27907%27%29+OR+CAL_MUNI_DS_O+IN+%28%27Belauntza%27%2C%27Elduain%27%2C%27Gaztelu%27%29%29&outFields=CAL_PROV%2CCAL_MUNI%2CCAL_MUNI_DS_O%2CCAL_TVI_DS_C%2CCAL_TVI_DS_E%2CCAL_DS_O%2CCAL_DS_E&returnGeometry=false&returnDistinctValues=true&f=json) |
| 20045 | Irun | Gipuzkoa | 12 | 12 barrios | [Ayuntamiento de Irun — El Alcalde en los barrios](https://www.irun.org/modi/participacion/barrios.aspx) |
| 20048 | Larraul | Gipuzkoa | 1 | 1 vía | [Gobierno Vasco — Registro de entidades locales: Larraul](https://www.euskadi.eus/entidad-local/larraul/web01-a2tokiad/es/) |
| 20050 | Leaburu | Gipuzkoa | 2 | 2 barrios | [Diputación Foral de Gipuzkoa — Callejero oficial de Leaburu](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/municipio/leaburu) |
| 20026 | Zerain | Gipuzkoa | 6 | 6 barrios | [Diputación Foral de Gipuzkoa — Callejero oficial de Zerain](https://b5m.gipuzkoa.eus/web5000/es/directorio-geografico/municipio/zerain) |
| 24089 | León | León | 12 | 12 barrios | [Ayuntamiento de León — Concejales de Barrio](https://www.aytoleon.es/es/tu-ayuntamiento/organizaci%C3%B3n/concejales-barrio/Paginas/default.aspx) |
| 24115 | Ponferrada | León | 6 | 6 barrios | [Ayuntamiento de Ponferrada — Órganos Territoriales Desconcentrados: Alcaldías de Barrio](https://www.ponferrada.org/es/organizacion-administrativa/organos-territoriales-desconcentrados-alcaldias-barrio) |
| 34120 | Palencia | Palencia | 12 | 12 barrios | [Ayuntamiento de Palencia — Centros de Acción Social](https://www.aytopalencia.es/area/servicios-sociales-municipales/centros) |
| 01002 | Amurrio | Álava | 10 | 10 barrios | [Ayuntamiento de Amurrio — Asambleas de barrios](https://udala.amurrio.eus/cas/servicios/participacion/asambleas-de-barrios) |
| 01027 | Iruraiz-Gauna | Álava | 6 | 6 localidades | [Ayuntamiento de Iruraiz-Gauna — Nuestros pueblos y barrios: composición del municipio](https://iruraiz-gauna.eus/es/municipio/nuestros-pueblos-y-barrios) |
| 01020 | Kuartango | Álava | 6 | 6 localidades | [Ayuntamiento de Kuartango — Pueblos y concejos del municipio de Kuartango](https://kuartango.eus/municipio/pueblos/) |
| 01036 | Laudio/Llodio | Álava | 7 | 7 barrios | [Ayuntamiento de Laudio/Llodio — Laudio/Llodio: nuestro valle](https://www.laudio.eus/es/cita-sac/nuestro-valle) |
| 01059 | Vitoria-Gasteiz | Álava | 12 | 12 barrios | [Ayuntamiento de Vitoria-Gasteiz — Asociaciones vecinales: campo municipal Barrio](https://www.vitoria-gasteiz.org/wb021/was/contenidoAction.do?idioma=es&uid=_626ee0af_11a9fc4637f__7ffa) |
| 01061 | Zalduondo | Álava | 1 | 1 barrio | [Ayuntamiento de Zalduondo — Perfil del contratante y dirección del Ayuntamiento](https://www.zalduondo.eus/perfil-del-contratante) |
| 31031 | Areso | Navarra | 1 | 1 barrio | [Ayuntamiento de Areso — Contacto del Ayuntamiento de Areso](https://areso.eus/es/contacto/) |
| 31081 | Donamaria | Navarra | 5 | 5 localidades | [Ayuntamiento de Donamaria — Hasiera: núcleos de población de Donamaria](https://www.donamaria.eus/inicio/page/8/) |
| 31128 | Isaba/Izaba | Navarra | 2 | 2 barrios | [Ayuntamiento de Isaba/Izaba — Localización y dirección del Ayuntamiento de Isaba](https://isaba.es/localizacion/)<br>[Ayuntamiento de Isaba/Izaba — Directorio turístico municipal: Hotel SNÖ Isaba](https://isaba.es/donde/hotel-sno-isaba/) |
| 31148 | Legaria | Navarra | 4 | 4 barrios | [Ayuntamiento de Legaria — Legaria: los cuatro barrios del municipio](https://www.legaria.es/portal/seccion.aspx?S=11) |
| 31201 | Pamplona/Iruña | Navarra | 12 | 12 barrios | [Ayuntamiento de Pamplona/Iruña — Listado de barrios de Pamplona](https://www.pamplona.es/ayuntamiento/varios/listado-de-barrios-de-pamplona) |
| 31232 | Tudela | Navarra | 4 | 3 barrios; 1 zona residencial | [Ayuntamiento de Tudela — Acondicionamiento de pasos peatonales por zonas residenciales](https://tudela.es/noticia/107000-eur-para-obras-de-acondicionamiento-de-diversos-pasos-peatonales-en-las-calles-de-tudela) |
| 31247 | Uztárroz/Uztarroze | Navarra | 1 | 1 barrio | [Ayuntamiento de Uztárroz/Uztarroze — Web municipal y dirección de contacto](https://uztarroz.es/) |
| 49021 | Benavente | Zamora | 5 | 5 barrios | [Ayuntamiento de Benavente — Modelo de solicitud de subvención del Área de Regeneración Urbana](https://benavente.es/wp-content/uploads/2025/03/MODELO-SOLICITUD-SUBVENCION-1-2021.pdf) |
| 49275 | Zamora | Zamora | 12 | 12 barrios | [Ayuntamiento de Zamora — Datos Línea Zamora: datos por barrios](https://www.zamora.es/img/cargadas/Datos%20L%C3%ADneaZamora.pdf) |
| 47085 | Medina del Campo | Valladolid | 5 | 5 barrios | [Ayuntamiento de Medina del Campo, Policía Local — Memoria de la Policía Local 2018: fiestas de los barrios](https://www.ayto-medinadelcampo.es/images/AytoMedina/Policia/2018_Memoria-Policia-Local.pdf) |
| 47186 | Valladolid | Valladolid | 12 | 12 barrios | [Ayuntamiento de Valladolid, Servicio de Cartografía — Plano de Barrios y Subzonas](https://www10.ava.es/cartografia/Descarga_pdf/Barrios%20y%20subzonas.pdf) |
| 09011 | Alfoz de Bricia | Burgos | 6 | 6 localidades | [Diputación Provincial de Burgos — Municipio de Alfoz de Bricia](https://www.cultura.burgos.es/provincia/municipio/alfoz-de-bricia) |
| 09018 | Aranda de Duero | Burgos | 8 | 8 barrios | [Ayuntamiento de Aranda de Duero — Barrios, propuestas y respuestas](https://www.arandadeduero.es/barrios-propuestas-y-respuestas/) |
| 09059 | Burgos | Burgos | 12 | 12 barrios | [Ayuntamiento de Burgos — Reglamento de Organización y Funcionamiento de los Distritos Municipales de la Ciudad de Burgos](https://movilidad.aytoburgos.es/web/ayuntamiento-de-burgos/-/reglamento-de-organizaci%C3%B3n-y-funcionamiento-de-los-distritos-municipales-de-la-ciudad-de-burgos-) |
| 09190 | Junta de Villalba de Losa | Burgos | 4 | 4 localidades | [Diputación Provincial de Burgos — Municipio de Junta de Villalba de Losa](https://www.burgos.es/provincia/municipio/junta-de-villalba-de-losa) |
| 09219 | Miranda de Ebro | Burgos | 10 | 10 barrios | [Ayuntamiento de Miranda de Ebro — Miranda de Ebro: unidad didáctica, apartado Sus barrios](https://www.mirandadeebro.es/wp-content/uploads/FMS/B3/B4/unid_didactica.pdf) |
| 26018 | Arnedo | La Rioja | 3 | 3 barrios | [Ayuntamiento de Arnedo — Fiestas de los Barrios 2026](https://www.arnedo.com/noticia/este-verano-la-fiesta-va-por-barrios/) |
| 26036 | Calahorra | La Rioja | 3 | 3 barrios | [Ayuntamiento de Calahorra — Proyecto de mejora de la accesibilidad del casco urbano](https://calahorra.es/el-ayuntamiento-de-calahorra-redactara-un-proyecto-para-la-mejora-de-la-accesibilidad-en-todo-el-casco-urbano/)<br>[Ayuntamiento de Calahorra — Regeneración urbana: Entorno Residencial Quintiliano](https://calahorra.es/el-ayuntamiento-de-calahorra-participa-en-la-jornada-de-regeneracion-urbana-a-nivel-de-barrio/)<br>[Ayuntamiento de Calahorra — Fiestas del Casco Antiguo 2026](https://calahorra.es/del-17-al-19-de-julio-el-casco-antiguo-celebra-la-45o-edicion-de-sus-fiestas/) |
| 26089 | Logroño | La Rioja | 10 | 9 barrios; 1 zona residencial | [Ayuntamiento de Logroño — Distrito Sur: barrios y zonas residenciales](https://logrono.es/distrito-sur)<br>[Ayuntamiento de Logroño — Distrito Este: barrios y zonas residenciales](https://logrono.es/distrito-este) |
| 37274 | Salamanca | Salamanca | 12 | 12 barrios | [Ayuntamiento de Salamanca — Reglamento para la Participación Democrática en la Ciudad de Salamanca](https://www.aytosalamanca.es/documents/20119/771790/reglamento-participacion-democratica-salamanca-2.pdf/ddcfbd56-26ec-4bed-dd2d-bc0eedc7376b?t=1742462383222) |
| 05019 | Ávila | Ávila | 8 | 8 barrios | [Ayuntamiento de Ávila — Aprobada la Estrategia de Desarrollo Urbano Sostenible e Integrado (EDUSI)](https://www.avila.es/ciudad/feder/comunicacion/item/3465-aprobada-la-estrategia-de-desarrollo-urbano-sostenible-e-integrado-edusi)<br>[Ayuntamiento de Ávila — Acta del Pleno ordinario de 30 de diciembre de 2022](https://www.avila.es/areas-destacadas/secretaria-contratacion/juntas-de-gobierno/category/112-actas-de-plenos-corporativos-2022?download=1812:acta-13-22-pleno-ordinario-30-de-diciembre-2022) |
| 40194 | Segovia | Segovia | 12 | 12 barrios | [Ayuntamiento de Segovia — CEAS Centro: barrios comprendidos en la zona Centro](https://www.segovia.es/en/node/12153)<br>[Ayuntamiento de Segovia — CEAS Norte: barrios comprendidos en la zona Norte](https://www.segovia.es/index.php/area/servicios-sociales/ceas-norte)<br>[Ayuntamiento de Segovia — CEAS Sur: barrios comprendidos en la zona Sur](https://segovia.es/en/node/12154) |
| 42173 | Soria | Soria | 5 | 5 barrios | [Ayuntamiento de Soria — La Junta de Gobierno Local aprueba nuevas inversiones en barrios con actuaciones en Los Pajaritos y Los Royales](https://www.soria.es/es/actualidad/la-junta-de-gobierno-local-aprueba-nuevas-inversiones-en-barrios-con-actuaciones-en-los)<br>[Ayuntamiento de Soria, Agenda Cultural — Paradas sonoras](https://agendacultural.soria.es/paradas-sonoras-2/)<br>[Ayuntamiento de Soria, Elige Soria — Y el Calaverón celebró su 20 Feria de Abril](https://elige.soria.es/y-el-calaveron-celebro-su-20-feria-de-abril/) |
| 45081 | Illescas | Toledo | 2 | 2 barrios | [Ayuntamiento de Illescas — Revista de información municipal, junio de 2026](https://illescas.es/wp-content/uploads/2026/07/maqueta_revista_junio_2026.pdf)<br>[Ayuntamiento de Illescas — Illescas cuenta con una nueva zona de aparcamiento en la parte sur del municipio](https://illescas.es/illescas-cuenta-con-una-nueva-zona-de-aparcamiento-en-la-parte-sur-del-municipio/) |
| 45161 | Seseña | Toledo | 3 | 3 barrios | [Ayuntamiento de Seseña — Cabalgata de Reyes en el Municipio](https://ayto-sesena.org/9398-2/) |
| 45165 | Talavera de la Reina | Toledo | 12 | 12 barrios | [Ayuntamiento de Talavera de la Reina — Programa municipal de Mondas 2026: pregones en los barrios](https://talavera.es/download/332/mondas/89950/programa-mondas-2026.pdf) |
| 45168 | Toledo | Toledo | 10 | 5 barrios; 5 zonas residenciales | [Ayuntamiento de Toledo — Diagnóstico de infancia y adolescencia: barrios de la ciudad](https://www.toledo.es/wp-content/uploads/2016/12/diagnostico-de-infancia-y-adolescencia.pdf)<br>[Ayuntamiento de Toledo — Distrito Norte: barrios y urbanizaciones](https://www.toledo.es/servicios-municipales/oficinas-de-atencion-al-ciudadano/norte/) |
| 28005 | Alcalá de Henares | Madrid | 12 | 12 barrios | [Ayuntamiento de Alcalá de Henares — Consejos de Barrio](https://distritos.ayto-alcaladehenares.es/consejos-de-barrio/) |
| 28049 | Coslada | Madrid | 8 | 8 barrios | [Ayuntamiento de Coslada — Población de Coslada: población por barrios](https://coslada.es/transparencia/2025/02/02/poblacion-de-coslada/) |
| 28065 | Getafe | Madrid | 11 | 11 barrios | [Ayuntamiento de Getafe — Getafe retoma las asambleas de barrio desde el 11 de octubre hasta el 18 de noviembre](https://getafe.es/getafe-retoma-las-asambleas-de-barrio-desde-el-11-de-octubre-hasta-el-18-de-noviembre/) |
| 28074 | Leganés | Madrid | 9 | 9 barrios | [Ayuntamiento de Leganés — Nuevo plan intensivo de limpieza viaria por barrios: marzo, abril y mayo de 2026](https://www.leganes.org/w/el-ayuntamiento-pone-en-marcha-un-nuevo-plan-intensivo-de-limpieza-viaria-por-barrios-los-meses-de-marzo-abril-y-mayo) |
| 28079 | Madrid | Madrid | 12 | 12 barrios | [Ayuntamiento de Madrid — Barrios municipales de Madrid](https://datos.madrid.es/dataset/300496-0-barrios-madrid) |
| 28092 | Móstoles | Madrid | 6 | 6 distritos | [Ayuntamiento de Móstoles — Juntas de Distrito](https://www.mostoles.es/mostoles/cm/ayto-mostoles/tkContent?idContent=73&locale=es_ES&textOnly=false) |
| 28130 | San Fernando de Henares | Madrid | 24 | 4 barrios; 20 vías | [Ayuntamiento de San Fernando de Henares — Mejora de la línea 822 y conexión del barrio de Parque Henares](https://www.ayto-sanfernando.com/la-linea-de-autobus-822-mejora-su-itineratio-conectando-el-barrio-de-parque-henares-con-el-polideportivo-municipal-y-ampliando-servicio-a-los-fines-de-semana/)<br>[Ayuntamiento de San Fernando de Henares — Proyecto de mejora del Barrio de la OTAN](https://www.ayto-sanfernando.com/arranca-un-completo-proyecto-de-mejora-en-el-conocido-como-barrio-de-la-otan/)<br>[Ayuntamiento de San Fernando de Henares — Pleno de 15 de febrero de 2018: referencia al barrio de Fuencasa](https://www.ayto-sanfernando.com/pleno-15-de-febrero-de-2018/)<br>[Ayuntamiento de San Fernando de Henares — Acta de la Junta de Gobierno Local de 29 de octubre de 2025](https://www.ayto-sanfernando.com/wp-content/uploads/2025/11/ACTA-sesion-extraordinaria-JGL-29-10-2025.pdf)<br>[Ayuntamiento de San Fernando de Henares — IV Plan Municipal de Asfaltado, la mayor inversión de los últimos tiempos](https://www.ayto-sanfernando.com/iv-plan-municipal-de-asfaltado-la-mayor-inversion-de-los-ultimos-tiempos/)<br>[Ayuntamiento de San Fernando de Henares — Agenda municipal Vive Sanfer de septiembre de 2026](https://www.ayto-sanfernando.com/la-agenda-cultural-y-de-ocio-vive-sanfer-arranca-septiembre-con-teatro-fiestas-de-barrio-propuestas-para-jovenes-exposiciones-y-actividades-para-todos-los-publicos/) |
| 28148 | Torrejón de Ardoz | Madrid | 8 | 8 barrios | [Ayuntamiento de Torrejón de Ardoz — Campaña Torrejón: Cuida sus Barrios](https://www.ayto-torrejon.es/index.php/noticia/nota-de-prensa/en-marcha-la-campana-torrejon-cuida-sus-barrios-con-el-objetivo-de-mejorar-e)<br>[Ayuntamiento de Torrejón de Ardoz — Patios Abiertos: distribución de centros por barrios](https://www.ayto-torrejon.es/noticia/nota-de-prensa/diez-colegios-de-torrejon-de-ardoz-abren-sus-patios-por-las-tardes-para-0) |
| 19024 | Alovera | Guadalajara | 2 | 2 zonas residenciales | [Ayuntamiento de Alovera — Pistas de barrio](https://alovera.es/paginas/pistas-de-barrio/1041/) |
| 19046 | Azuqueca de Henares | Guadalajara | 7 | 7 barrios | [Ayuntamiento de Azuqueca de Henares — El Ayuntamiento firma el contrato de las obras de remodelación del barrio de la Estación](https://www.azuqueca.es/es/-/el-ayuntamiento-firma-el-contrato-de-las-obras-de-remodelacion-del-barrio-de-la-estacion)<br>[Ayuntamiento de Azuqueca de Henares — Adjudicadas las obras de remodelación integral del barrio de El Vallejo](https://www.azuqueca.es/es/-/adjudicadas-las-obras-de-remodelacion-integral-del-barrio-de-el-vallejo) |
| 19130 | Guadalajara | Guadalajara | 10 | 10 barrios | [Ayuntamiento de Guadalajara — Plano municipal: división en barrios](https://www.guadalajara.es/recursos/doc/portal/2018/04/09/plano-callejero-de-la-ciudad-de-guadalajara-division-en-barrios-actualizado-en-2.pdf) |

## Ampliaciones y mantenimiento

La procedencia individual, la evidencia y la categoría están en [data/localities.json](../data/localities.json). Para ampliar la selección manual, comprobar primero una fuente oficial aplicable al municipio; registrar solo los nombres y categorías que respalda; conservar su evidencia y fecha; y ejecutar las pruebas, el build y las auditorías. No existe un importador masivo de barrios o pueblos.

Las actualizaciones del callejero se realizan por separado con [scripts/import-streets.py](../scripts/import-streets.py), leyendo únicamente VIAS y TRAM de la edición revisada. El importador no sustituye ni reclasifica la selección manual de barrios, parroquias y localidades. Consultar el [README](../README.md#mantener-el-callejero-oficial) y el [informe de ampliación geográfica](geographic-expansion.md) antes de cambiar de edición.
