# Consolidación municipal — 3 de noviembre de 2026

Sustituye el directorio de 3.797 páginas municipales independientes. Se mantienen 474 páginas municipales y la cobertura visible de los 3.797 municipios. Hay 3.323 redirecciones permanentes directas hacia páginas que incorporan las localidades retiradas.

## Criterio

- Todos los municipios con al menos 5.000 habitantes, según la población ya documentada en el catálogo del proyecto (edición IGN 2025).
- Al menos los ocho más poblados de cada provincia.
- Se añaden municipios, priorizando población, cuando no existe una página conservada en un radio de 25 km en la misma provincia.
- Cada municipio restante se asigna a la página conservada más cercana de su provincia. No se presentan los puntos seleccionados automáticamente como cabeceras de comarca oficiales.
- Son distancias aproximadas entre coordenadas municipales, no distancias por carretera ni garantías de desplazamiento.

La tabla completa y auditable está en `cobertura-municipal.csv`. El informe regenerable está en `qa/coverage-report.json`.

## Resultado por provincia

| Provincia | Municipios cubiertos | Páginas municipales |
|---|---:|---:|
| Asturias | 78 | 33 |
| Cantabria | 102 | 24 |
| Bizkaia | 113 | 35 |
| Gipuzkoa | 88 | 34 |
| León | 211 | 22 |
| Palencia | 191 | 14 |
| Álava | 51 | 9 |
| Navarra | 272 | 26 |
| Zamora | 248 | 17 |
| Valladolid | 225 | 19 |
| Burgos | 371 | 20 |
| La Rioja | 174 | 12 |
| Salamanca | 362 | 21 |
| Ávila | 248 | 12 |
| Segovia | 209 | 13 |
| Soria | 183 | 15 |
| Toledo | 204 | 41 |
| Madrid | 179 | 83 |
| Guadalajara | 288 | 24 |

## Migración y verificación

El build genera `_redirects`, el índice de búsqueda con anclas a cada localidad, las páginas de cobertura y sitemaps exclusivamente con las URLs conservadas. Los listados provinciales y destacados enlazan al destino final. Se conserva la estructura de servicios, marcas, consultas, teléfonos por zona, distritos de Madrid y las referencias locales de las páginas conservadas.

`npm run build`, `npm run check` y `npm test` verifican la cobertura completa, los destinos, las anclas visibles y la ausencia de URLs retiradas en los sitemaps. Las redirecciones están en `_redirects`, que Netlify procesa antes de las reglas de `netlify.toml`, incluido el 404 final.

Tras el despliegue hay que reenviar `https://instalacionvideoporterourgente.com/sitemap.xml` en Search Console. No hay integración con Search Console en este proyecto y no se ha enviado automáticamente. La reorganización no garantiza recuperar posiciones; debe medirse su evolución tras el nuevo rastreo.
