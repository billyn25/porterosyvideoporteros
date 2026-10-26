# Mapa de cobertura: fuente y transformación

## Cartografía

El mapa `public/assets/coverage-spain.svg` se genera a partir de las **Unidades administrativas de España** publicadas por el **Instituto Geográfico Nacional (IGN)**. Se descargó el nivel provincial del servicio WFS oficial el **26 de octubre de 2026**.

- [Ficha y descargas de límites administrativos del IGN/CNIG](https://www.ign.es/web/ign/portal/rcc-descarga-lineas-limite).
- [Servicio WFS del IGN: GetCapabilities](https://www.ign.es/wfs-inspire/unidades-administrativas?service=WFS&request=GetCapabilities).
- [Metadatos oficiales de Unidades administrativas de España](https://nco.ign.es/portal/home/item.html?id=20ab6fcf6d6e4ea4bd7919edb3364bf0).
- [Condiciones de uso IGN, compatibles con CC BY 4.0](https://www.ign.es/resources/licencia/Condiciones_licenciaUso_IGN.pdf).

La consulta utiliza `au:AdministrativeUnit`, `nationalLevel=3rdOrder`, coordenadas EPSG:4326 y formato GeoJSON. Devuelve **53 unidades**: las 50 provincias, Ceuta, Melilla y la unidad denominada «Territorios no asociados a ninguna provincia». La URL completa, el filtro y el SHA-256 de la respuesta original se conservan en `data/coverage-map.json`.

No se ha utilizado cartografía de GISCO: las condiciones de uso de los datos examinados excluían usos comerciales.

## Provincias destacadas

Los códigos provinciales se cruzan con `data/municipalities.json` y las zonas de contacto de `data/site.json`. Se comprueba que los 19 códigos estén presentes en la geometría de origen.

| Color | Zona | Provincias |
| --- | --- | --- |
| Salvia `#a6bea7` | Norte y Castilla y León | Asturias, Cantabria, Bizkaia, Gipuzkoa, Álava, Navarra, La Rioja, León, Palencia, Zamora, Valladolid, Burgos, Salamanca, Ávila, Segovia y Soria |
| Cobre `#df9e7c` | Centro | Madrid, Guadalajara y Toledo |
| Gris `#3a4540` | Contexto geográfico | Resto de unidades del mapa |

## Tratamiento visual

- SVG de **600 × 440**, con fondo transparente y límites interiores finos.
- Proyección equirectangular con paralelo estándar de 40° N para el mapa de situación.
- Simplificación Douglas–Peucker con tolerancia de 1,1 píxeles sobre el dibujo de 600 × 440. Se omiten islotes subpíxel, preservando al menos un contorno por unidad diminuta.
- Baleares conserva su posición relativa en el mapa principal. **Canarias aparece en un recuadro desplazado y con escala independiente**, rotulado expresamente.
- Los colores indican la relación de provincias configurada para el servicio. No representan oficinas, intervenciones realizadas, rutas, tiempos de llegada ni disponibilidad en tiempo real.

El SVG contiene título, descripción y metadatos de procedencia. La atribución visible junto al mapa enlaza a la página de fuentes, donde se presenta el crédito completo:

> Obra derivada de Unidades administrativas de España, descarga 26/10/2026, CC BY 4.0 ign.es.

## Reproducción

El generador utiliza únicamente la biblioteca estándar de Python y no interviene en el build ordinario de la web:

```bash
python scripts/build-coverage-map.py /ruta/al/ign-provinces.geojson
```

Para obtener el fichero original, descargar la `source.downloadUrl` registrada en `data/coverage-map.json`. La respuesta original es grande (aproximadamente 116 MB); el sitio solo distribuye el SVG compacto. La fuente WFS puede actualizarse con el tiempo: una nueva descarga debe revisar la fecha, el checksum y el resultado visual.

La validación comprueba los 19 códigos destacados, su pertenencia al grupo correcto y el tamaño del lienzo. El resultado se ha renderizado sobre el fondo del pie para revisar silueta, colores, límites e inset de Canarias.
