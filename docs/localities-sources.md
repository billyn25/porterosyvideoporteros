# Referencias locales verificadas

Actualización: 26 de octubre de 2026.

`data/localities.json` añade referencias territoriales que permiten precisar una consulta de instalación o reparación. No representa un inventario de trabajos realizados ni de establecimientos de la empresa. Los núcleos, distritos y municipios mantienen categorías diferentes.

## Alcance

| Comprobación | Resultado |
| --- | ---: |
| Municipios del proyecto cruzados por código INE | 3.797 de 3.797 |
| Registros del fichero nacional de origen | 153.936 |
| Núcleos de población encontrados en las 19 provincias | 13.458 |
| Núcleos seleccionados para mostrar | 5.689 |
| Municipios con algún núcleo adicional seleccionado | 1.598 |
| Distritos municipales de Madrid | 21 |
| Distritos municipales de Bilbao | 8 |
| Municipios con referencias adicionales de algún tipo | 1.600 |
| Máximo de núcleos seleccionados por municipio | 8 |

Los otros 2.197 municipios conservan una lista vacía. No se rellenan con topónimos supuestos, con el nombre del propio municipio repetido ni con códigos postales deducidos del prefijo provincial.

## Núcleos de población: INE

Fuente: [Nomenclátor: Población por unidad poblacional](https://www.ine.es/dyngs/INEbase/operacion.htm?c=Estadistica_C&cid=1254736177010&idp=1254735572981), referencia **1 de enero de 2025**, publicada el **28 de enero de 2026**. Es la última edición disponible en la página consultada. Los nombres proceden de la relación mantenida por el INE a partir de la información municipal.

Se ha descargado el fichero nacional mediante el formulario público del INE:

```bash
curl -L --fail -d 'anioNacional=2025' https://www.ine.es/nomen2/Descarga -o /tmp/ine-2025.zip
python scripts/import-localities.py /tmp/ine-2025.zip
```

El importador usa únicamente la biblioteca estándar de Python. El ZIP se valida antes de leer `Nomdef2025_sex.txt`:

```text
SHA-256: 960f268774cfb0c61d6b587d7822c0a943b004f6f01c130300b9be296b31c979
```

La interpretación sigue la [metodología del INE](https://www.ine.es/nomenclator/metodologia.htm), su [ayuda de codificación](https://www.ine.es/nomenclator/ayuda.htm) y el [diseño de registro](https://www.ine.es/nomen_files/DisenioRegistro.xls). Cada línea ocupa 104 caracteres Unicode. Los primeros once contienen provincia, municipio, entidad colectiva, entidad singular y núcleo o diseminado. Los primeros cinco identifican el municipio utilizado en el proyecto. Se excluyen las terminaciones `00` —totales y entidades— y `99` —diseminados— al extraer núcleos.

### Regla de selección

1. Se conservan solo núcleos con población positiva en la edición de 2025.
2. Se excluyen nombres equivalentes al municipio o a sus alias oficiales, incluso cuando aparece una forma bilingüe o un artículo pospuesto.
3. Se deduplican los nombres dentro del municipio.
4. Se eligen hasta ocho, ordenados por población de 2025 descendente; los empates se resuelven por código INE ascendente.

La población sirve exclusivamente para esta selección editorial: no se publica en el archivo final ni se usa para afirmar demanda, frecuencia de averías o tiempo de llegada. La selección no es una relación exhaustiva de todos los lugares atendidos.

El nombre original se conserva en `sourceName`. Para `name` se ajustan mayúsculas y minúsculas de lectura y se adelantan los artículos que el INE sitúa entre paréntesis al final. Por ejemplo, `CORREDORIA (LA)` pasa a `La Corredoria`; `COLLOTO/CUALLOTO` conserva ambas formas. No se sustituyen palabras ni se inventan traducciones.

**Atribución:** Fuente: INE. Nomenclátor 2025. Selección y presentación elaboradas a partir de los datos originales. [Aviso legal del INE](https://www.ine.es/aviso_legal).

## Distritos municipales

Madrid y Bilbao aparecen como núcleos únicos en el fichero utilizado. Para aportar una referencia interior útil se añaden sus distritos, con `type: "district"`, en una colección separada de `selectedNuclei`.

| Municipio | Fuente de nombres | Códigos |
| --- | --- | --- |
| Madrid, INE 28079 | [Portal municipal de distritos](https://www.madrid.es/portales/munimadrid/es/Inicio/Distritos/?vgnextchannel=f9792593e5d48810VgnVCM1000008a4a900aRCRD) y [catálogo cartográfico de distritos](https://datos.madrid.es/dataset/213583-0-cartografia-distritos-1-5000) | 01–21 |
| Bilbao, INE 48020 | [El Gobierno Municipal: Distritos](https://www.bilbao.eus/cs/Satellite?cid=3000017134&language=es&pagename=Bilbaonet%2FPage%2FBIO_contenidoFinal) y [Mi Barrio](https://www.bilbao.eus/cs/Satellite?c=Page&cid=3000005557&language=es&pageid=3000005557&pagename=Bilbaonet%2FPage%2FBIO_detallePagina) | 01–08 |

Consulta de ambas relaciones: **26 de octubre de 2026**. El catálogo madrileño identifica su licencia como CC BY 4.0. Los códigos son identificadores municipales de distrito; **no son códigos postales ni códigos INE de núcleo**. La relación de Bilbao se contrastó también mediante resultados indexados de las páginas municipales: algunas peticiones directas a su portal devolvieron restricciones de acceso.

## Contrato de datos y uso

- `source`: procedencia, fecha, método de descarga, checksum y reglas de transformación del INE.
- `districtSources`: procedencia independiente de los distritos de Madrid y Bilbao.
- `stats`: cobertura, recuentos y límites.
- `municipalities["INE5"].selectedNuclei`: hasta ocho referencias con código INE completo, nombre de lectura, nombre original y `sourceId`.
- `municipalities["INE5"].districts`: relación de distritos cuando está documentada; vacía en el resto.

La interfaz debe presentar los núcleos como **núcleos de población** y los distritos como **distritos municipales**. Puede permitir que el visitante incorpore una referencia al campo opcional de ubicación de su consulta. Las páginas sin referencias adicionales deben omitir el bloque. No se deben convertir estos nombres en direcciones comerciales, ubicaciones de técnicos, barrios supuestos ni prueba de intervenciones realizadas.

## Verificación

El importador comprueba la integridad del ZIP, la longitud de los 153.936 registros, la sintaxis y unicidad de sus códigos, el cruce de los 3.797 municipios y la validez del JSON escrito. La comprobación adicional verificó que cada núcleo seleccionado existe literalmente en el origen, pertenece al municipio de destino, tiene población positiva, conserva su nombre original y no supera el límite de ocho referencias por municipio. Los 29 distritos mantienen su categoría y numeración separadas.
