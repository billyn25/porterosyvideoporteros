# Auditoría de contenido municipal

Build analizado: `2026-10-26T08:05:47.650Z`. 3797 páginas municipales; 240 pares fijos y 447 páginas distintas en la muestra.

La instantánea ya incorpora la mezcla final de avalancha del hash, el hero municipal general, la introducción temática junto al H2, el formulario sin preselección temática y el copy revisado.

## Método

100 * |A ∩ B| / |A ∪ B|

12 focos ordenados por id; páginas de cada foco ordenadas por ruta. Para cada foco: 10 pares de random.sample(grupo,2); después 10 pares con otro foco aleatorio (random.choice sobre los otros focos ordenados), una página aleatoria de cada grupo. random.Random(20261026); rechazar autopares y duplicados no ordenados.

Minúsculas; NFKD a ASCII; reemplazo de nombre y aliases propios por municipio, y provincia propia por provincia (más largos primero; límites no alfanuméricos); tokens [a-z0-9]+; sin stopwords y sin stemming.

Se extrae `main` y se retiran formulario/consulta, navegación, elementos decorativos, CTA y municipios próximos. Se analiza todo el corpus para retirar, en la medida ajustada, bloques globales presentes en al menos el 95 % de las páginas. El JSON registra rutas, SHA-256 del HTML, longitudes, intersecciones/uniones y resultados por par.

La medida editorial conserva el mismo significado que en el baseline: introducción del foco y tres secciones editoriales. La introducción ha cambiado de posición en el HTML, por lo que se adapta su selector. El nuevo hero general no forma parte de esta medida.

| Pares | Texto | Mínimo | Mediana | Media | P90 | Máximo |
|---|---|---:|---:|---:|---:|---:|
| Mismo foco (n=120) | Principal normalizado | 23.16% | 38.75% | 39.51% | 48.09% | 63.28% |
| Mismo foco (n=120) | Principal sin bloques globales | 15.79% | 32.15% | 32.97% | 42.26% | 58.89% |
| Mismo foco (n=120) | Intro temática + 3 secciones editoriales | 23.48% | 26.59% | 34.80% | 55.04% | 90.05% |
| Distinto foco (n=120) | Principal normalizado | 14.24% | 23.69% | 24.12% | 31.06% | 40.60% |
| Distinto foco (n=120) | Principal sin bloques globales | 7.80% | 17.67% | 17.98% | 25.34% | 35.35% |
| Distinto foco (n=120) | Intro temática + 3 secciones editoriales | 0.00% | 0.00% | 2.73% | 15.28% | 17.09% |

## Lectura de resultados

Hay **1807 secuencias editoriales normalizadas distintas** para 3797 municipios. La secuencia más reutilizada aparece **7 veces**. El texto principal completo contiene 3797 secuencias distintas; son combinaciones y órdenes de módulos compartidos, no 3797 redacciones independientes.

Estos porcentajes miden coincidencia literal. No son un porcentaje de Google ni prueban que una página sea de calidad, sea única semánticamente o vaya a posicionar. La selección por código municipal no prueba que un problema sea frecuente en ese municipio.

## Comparación con el baseline

La instantánea anterior (`2026-10-26T08:01:43.071Z`) tenía 197 secuencias editoriales únicas; la actual tiene 1807. La reutilización máxima pasa de 47 a 7 municipios. La medida ajustada pasa de una mediana de 37.31% a 32.15% para el mismo foco, y de 16.86% a 17.67% entre focos distintos.

Se conserva la semilla y el número de pares por foco. La nueva asignación de focos cambia los pares seleccionados; también cambió el contenido. La comparación no aísla el efecto del hash.

## Hallazgos

### MEDIUM: La variedad procede de módulos, no de contexto municipal propio

townPage asigna uno de 12 focos por hash(town.code), ahora con mezcla final de avalancha. Introducción temática, checklist, párrafos, diagnósticos, servicios, marcas y FAQ proceden de conjuntos compartidos. El hero se presenta de forma general y el formulario ya no preselecciona el servicio temático.

Ubicación: `scripts/pages.mjs: townPage; scripts/utils.mjs: hash`.

Describir el resultado como contenido temático variado, sin atribuir necesidades al municipio ni prometer una penalización evitada. Las futuras incorporaciones locales deben basarse en información de servicio verificable.

### INFO: La conversión comercial depende todavía del contacto real

build-report contactConfigured=False, legalConfigured=False; el formulario prepara y copia la consulta, sin canal de envío configurado.

Ubicación: `data/site.json; scripts/components.mjs: consultation`.

Mantener visible la función real del formulario y completar los datos de contacto y titular confirmados para habilitar recepción de consultas.

### Resuelto: copy de Comelit

La nota interna de página del PDF ya no aparece en las notas comerciales. Tegui y Golmar también mantienen lenguaje orientado al cliente.

## Límites

- No es una métrica de Google, penalización, calidad, originalidad o probabilidad de posicionamiento.
- La muestra está equilibrada por foco; no es una estimación ponderada por tráfico ni por pares posibles.
- Jaccard mide coincidencia literal de fragmentos, no equivalencia semántica.
- La reordenación de bloques cambia algunos shingles en sus uniones; no transforma texto reutilizado en hechos locales.
- Los municipios vecinos se excluyen para que listas geográficas distintas no aparenten diferenciación de contenido técnico.
- La mezcla final del hash modifica los grupos temáticos y sus combinaciones; se vuelve a muestrear con la misma semilla y cuotas por foco, por lo que los pares no son los mismos del baseline.

## Reproducción

Semilla: `20261026`. La muestra exacta, orden, rutas, hashes de HTML, reglas de normalización y tamaños de intersección/unión constan en `docs/content-audit.json`. Para cada campo: `porcentaje = 100 × intersection / union`. Se eliminaron 11 bloques globales.

Solo se han reemplazado `docs/content-audit.json` y `qa/content-audit.md`. No se ha regenerado el sitio ni modificado código, datos o estilos de producto.
