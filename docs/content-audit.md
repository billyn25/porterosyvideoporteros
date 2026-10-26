# Auditoría comparable de contenido municipal

Baseline: commit `930629245008d2b70fa1259abd87760e70938ae4`. Build actualizado: `2026-10-26T08:44:32.814Z`.

3797 páginas municipales; **los mismos 240 pares y las mismas 447 páginas de muestra** en ambos builds. Las categorías de foco se fijan al baseline y no se redibujan según el resultado.

## Medianas de coincidencia literal

| Pares (120 por categoría) | Texto | Antes | Después | Cambio |
|---|---|---:|---:|---:|
| Mismo foco original | Principal normalizado (con información local) | 38.75% | 26.84% | -11.91 pp |
| Mismo foco original | Principal sin bloques globales | 32.15% | 20.08% | -12.07 pp |
| Mismo foco original | Principal sin bloque geográfico | 38.75% | 26.86% | -11.89 pp |
| Mismo foco original | Principal sin geografía ni bloques globales | 32.15% | 19.92% | -12.23 pp |
| Mismo foco original | Introducción temática + tres secciones editoriales | 26.59% | 26.59% | +0.00 pp |
| Distinto foco original | Principal normalizado (con información local) | 23.69% | 14.44% | -9.25 pp |
| Distinto foco original | Principal sin bloques globales | 17.67% | 8.38% | -9.29 pp |
| Distinto foco original | Principal sin bloque geográfico | 23.69% | 13.58% | -10.11 pp |
| Distinto foco original | Principal sin geografía ni bloques globales | 17.67% | 7.24% | -10.43 pp |
| Distinto foco original | Introducción temática + tres secciones editoriales | 0.00% | 0.00% | +0.00 pp |

En el principal normalizado, 226 de los 240 pares reducen coincidencia y 14 la aumentan (0 sin cambios). Las medianas no significan que todos los pares mejoren.

La medida sin geografía permite comprobar si la variación también afecta al contenido de servicio, sin dar crédito a listas de nombres locales. La medida completa sí conserva la información geográfica visible porque forma parte de la página.

## Método

Se usa Jaccard de conjuntos de fragmentos de cinco palabras: `100 × intersección / unión`. Se normalizan mayúsculas y tildes, y se sustituyen exclusivamente nombre/alias del municipio y provincia propios. No se eliminan palabras comunes ni se agrupan sinónimos.

Se extrae `main`, excluyendo navegación, formulario, botones de acción, decoración y municipios cercanos. Se incluyen los textos técnicos, servicios, marcas, averías y FAQ. La medida ajustada retira bloques completos que aparecen normalizados en al menos el 95 % del corpus de cada build; el JSON incluye cuáles son. Los bloques nuevos de núcleos/datos locales se identifican por `data-audit-geography` o las clases documentadas en el script.

La medida editorial aislada conserva la introducción temática y las tres secciones `local-editorial`. No representa todos los textos de la página.

Los resultados de los 240 pares del baseline reproducen exactamente los valores del informe previo.

## Reutilización en todo el corpus

| Texto normalizado | Secuencias antes | Secuencias después | Máxima reutilización |
|---|---:|---:|---:|
| Principal normalizado (con información local) | 3797 | 3797 | 1 → 1 |
| Principal sin bloques globales | 3797 | 3797 | 1 → 1 |
| Principal sin bloque geográfico | 3797 | 3797 | 1 → 1 |
| Principal sin geografía ni bloques globales | 3797 | 3797 | 1 → 1 |
| Introducción temática + tres secciones editoriales | 1807 | 1807 | 7 → 7 |

Una secuencia distinta puede ser una combinación de módulos compartidos; no equivale a una redacción independiente o a investigación técnica de cada municipio. La selección de averías no representa incidencias registradas, frecuencia local ni trabajos ejecutados.

| Módulos visibles en páginas municipales | Casos distintos antes → después | Combinaciones ordenadas | Máxima reutilización de una combinación |
|---|---:|---:|---:|
| Casos de avería | 16 → 48 | 2302 → 3787 | 10 → 2 |
| Preguntas frecuentes | 24 → 48 | 3772 → 3797 | 2 → 1 |

## Límites

- Es una auditoría interna de coincidencia literal, **no una métrica de Google** ni una garantía contra penalizaciones, de indexación, calidad o posicionamiento.
- La muestra original está equilibrada por foco, no ponderada por tráfico ni por todos los pares posibles. Se conserva para una comparación honesta.
- Añadir texto diferente aumenta el denominador; una bajada no demuestra por sí sola mayor utilidad. Los nombres geográficos se presentan con fuentes y se evalúan también por separado.
- Reordenar párrafos cambia los fragmentos de sus uniones, pero no convierte información compartida en contexto local propio.
- Jaccard detecta coincidencias literales; no identifica todos los casos de equivalencia semántica.

## Reproducir

```bash
python scripts/audit-content.py --baseline-root qa/baseline-9306292 --current-root .
```

El baseline se obtiene con `git archive 9306292` en un directorio independiente y se genera con `SITE_URL=https://porteros.example node scripts/build.mjs`. Este dominio se utiliza únicamente para la prueba; no es el dominio comercial.

`docs/content-audit.json` conserva pares, rutas, SHA-256 de los HTML, tamaños de intersección/unión, número de palabras, bloques globales y distribuciones completas antes/después. El script utiliza solo la biblioteca estándar de Python.
