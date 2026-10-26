# Auditoría SEO y revisión de la portada móvil

**Proyecto:** Porteros y Videoporteros. **Dominio elegido:** `https://instalacionvideoporterourgente.com`. **Titular facilitado:** D.C.G.

**Fecha:** 26 de octubre de 2026. El rastreo final del build terminó a las 10:18 UTC. La comparación parte del commit `25ebca19d5dbd61d9509cf0121236e81b59542e7`; el resultado corresponde al código de la revisión que contiene este informe.

## 1. Resultado y prioridades

La versión generada supera la validación técnica y el rastreo de sus **3.846 páginas**, con cero errores y cero avisos en los controles implementados. La portada móvil identifica ahora el servicio desde su H1, conserva el contacto inmediato y no presenta desbordamiento horizontal en las tres anchuras examinadas.

Hay un bloqueo externo: **el dominio raíz y su variante www devolvieron NXDOMAIN en Google Public DNS y Cloudflare DNS** durante la comprobación del 26 de octubre a las 10:08 UTC. Se han preparado las URLs del sitio para ese dominio; eso no demuestra que el dominio, el certificado o las redirecciones estén sirviendo públicamente la web. La comprobación no permite concluir si está comprado, si se está configurando o si existe otro despliegue operativo.

El siguiente trabajo editorial debe aportar información real a las fichas locales. Tener títulos distintos y combinar párrafos reduce repeticiones exactas, pero no prueba que cada municipio tenga contenido suficiente para posicionarse. El [informe de contenido](seo-content-audit.md) desarrolla esa evaluación y la [selección de 50 URLs](seo-priority-50.json) organiza el trabajo inicial.

| Prioridad | Hallazgo | Estado y acción |
| --- | --- | --- |
| P0 | El dominio raíz y www no resuelven en las cuatro consultas DNS. | Requiere configuración real del dominio y su conexión al alojamiento. No hay acceso al panel del registrador o de Netlify en esta revisión. |
| P0 | Riesgo de publicar canonicals de una dirección anterior. | Corregido: origen comercial fijo y rechazo de un SITE_URL diferente en producción. |
| P1 | El inicio no expresaba el servicio en su H1. | Corregido, junto con la presentación móvil y los accesos táctiles. |
| P1 | Trece grupos de encabezados duplicados entre ámbitos distintos. | Corregido: provincia explícita y municipios homónimos desambiguados. |
| P1 | Reutilización alta de módulos en las fichas municipales. | Evaluada; plan editorial de 50 URLs. La evidencia local o comercial nueva debe existir antes de publicarse. |
| P1 | No se dispone de Search Console ni de datos de rendimiento de búsqueda. | La indexación, las posiciones, el CTR y la elección de canonical por Google no están verificados. |
| P1 | La identidad facilitada no acredita todos los datos de identificación comercial exigibles. | D.C.G. y teléfonos publicados sin invenciones ni avisos provisionales; limitación explicada en este informe. |
| P2 | Fragmentos largos y descripciones de servicio poco concisas. | Corregido con redacción específica, sin recortar nombres oficiales. |
| P2 | Marcado FAQPage sin utilidad para el resultado enriquecido retirado. | Eliminado; las preguntas y respuestas visibles se conservan. |
| P2 | Faltaban variantes raster de icono y logo. | Añadidos PNG de 96, 180 y 512 píxeles, derivados del símbolo existente. |

Los ceros del rastreo describen el alcance de los controles automáticos. No equivalen a una puntuación de Google, a cumplimiento legal completo o a una garantía de posiciones.

## 2. Alcance de la auditoría técnica

Se revisó el HTML generado completo, no una muestra de páginas. La navegación interactiva y el aspecto visual se comprobaron en las plantillas indicadas en la sección móvil.

| Control del build final | Resultado |
| --- | ---: |
| Páginas HTML | 3.846 |
| Páginas municipales / provinciales | 3.797 / 19 |
| Páginas indexables | 3.843 |
| Páginas con noindex | 3 |
| URLs declaradas en sitemaps | 3.843 |
| Archivos sitemap, incluido el índice | 21 |
| Referencias de enlaces comprobadas por el validador | 319.386 |
| Referencias de recursos comprobadas por el validador | 42.167 |
| Bloques JSON-LD analizados | 3.846 |
| Destinos internos inexistentes | 0 |
| Páginas indexables huérfanas o inalcanzables | 0 |
| Profundidad máxima desde el inicio | 2 enlaces |
| Títulos, descripciones y H1 exactamente duplicados entre páginas indexables | 0 / 0 / 0 |
| Imágenes sin atributo alt o sin dimensiones | 0 / 0 |

Los enlaces se contabilizan de dos formas: el validador comprueba todas sus referencias; el auditor de rastreo agrupa destinos por página y calcula 176.415 relaciones internas. Son métricas distintas, no resultados contradictorios.

La distribución de profundidad es una portada, 138 páginas a un enlace y 3.704 a dos enlaces. Los directorios y los 95 municipios destacados de la portada existen en el HTML, por lo que el acceso básico a las localidades no depende del buscador JavaScript.

Las tres páginas excluidas del índice son `/404.html`, `/privacidad/` y `/aviso-legal/`. Se mantienen accesibles y fuera de los sitemaps. La exclusión de los textos legales del índice no los oculta a los visitantes.

## 3. Dominio, canonical, robots y despliegue

`data/site.json` declara el dominio comercial definitivo. Canonical, Open Graph, enlaces de entidades JSON-LD, migas de pan, robots y sitemaps se generan con ese mismo origen HTTPS. La auditoría comprueba su coherencia por página.

La política de compilación distingue producción de vistas previas. Los contextos de revisión reciben `noindex` y la cabecera `X-Robots-Tag`; producción no los recibe. Si Netlify conserva una variable `SITE_URL` de otro dominio, el build de producción falla con una explicación en lugar de publicar señales contradictorias. Debe eliminarse esa variable antigua o actualizarse al dominio indicado.

En `netlify.toml` se han declarado redirecciones 301 desde HTTP y www al origen HTTPS sin www. Se conservan las redirecciones de `/index.html` y de los alias provinciales existentes. No se ha añadido una regla para un subdominio Netlify supuesto: el hostname real del proyecto no ha sido verificado.

### Evidencia pública y límites

Los cuatro resultados DNS, sus horas y respuestas completas están en [seo-domain-check.json](seo-domain-check.json). Los dos proveedores devolvieron código DNS 3, una autoridad SOA de `.com` y ninguna respuesta A o CNAME. La conclusión se basa en esas respuestas públicas, no en el resolvedor local del entorno.

Las peticiones HTTPS no permitieron obtener HTML válido del dominio. El error de conexión recibido por la infraestructura de ejecución no se atribuye al servidor de la web. No se certifican todavía el TLS, los códigos HTTP, la aplicación de las redirecciones ni el documento que recibirá Googlebot.

### Comprobación de publicación que falta fuera del repositorio

1. Conectar el dominio exacto y www al proyecto real de alojamiento y configurar los registros en su proveedor DNS. Usar las instrucciones específicas del panel y la [documentación oficial de Netlify](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/); no se ha supuesto una IP o un nombre de proyecto.
2. Establecer `instalacionvideoporterourgente.com` como dominio principal, coherente con el código, y emitir/verificar HTTPS.
3. Comprobar que el dominio principal responde con 200, que HTTP y www llegan a él mediante redirección permanente y que una ruta inexistente devuelve 404 real.
4. Revisar el HTML servido, la ausencia de noindex en páginas de servicio, robots y `/sitemap.xml` desde producción. Comprobar también el tratamiento del subdominio Netlify real cuando se conozca.
5. Verificar la propiedad en Search Console, enviar el índice de sitemaps e inspeccionar portada, un servicio, una provincia y varios municipios prioritarios. La publicación o el envío de un sitemap no garantiza indexación.

No se han alterado registros DNS ni cuentas de alojamiento. El trabajo en el repositorio prepara el despliegue; su entrega no es una prueba de que Netlify lo haya publicado.

## 4. Portada móvil y contacto

El H1 visible pasa a **«Instalación y reparación de porteros automáticos y videoporteros»**. El lema se conserva como texto secundario. El contenido inicial explica viviendas, comunidades, negocios, telefonillos y conexión al móvil. El enlace «Busca tu municipio» lleva directamente a la sección de cobertura.

En móvil se compactan cabecera y espaciados, se ajusta la escala del título, se declara el color del icono de menú y se reservan áreas táctiles amplias. Los campos usan 16 píxeles y se contempla la zona segura del dispositivo con `safe-area-inset-bottom`. El viewport permite ampliar el contenido. Se conservan urgencias 24 horas, la fotografía de producto, el bloque de portero de audio y el pie con mapa y teléfonos.

| Prueba realizada en Chrome | Resultado |
| --- | --- |
| Portada a 320, 375 y 414 píxeles CSS | Ancho del documento igual al ancho disponible; sin desbordamiento horizontal. |
| Menú móvil | 44 × 44 píxeles; abre, cierra y responde a Escape. |
| Llamada y WhatsApp fijos | 48 píxeles de alto, con destinatario correcto. |
| Campos del formulario | Tipografía de 16 píxeles. |
| Enlace al municipio | La sección queda a 112 píxeles del borde superior, bajo la cabecera. |
| Buscador con «Oviedo» | Devuelve la ficha de Oviedo, Asturias. |
| Cambio de provincia a Madrid | Teléfono y WhatsApp pasan a 614 78 99 45. |
| Cambio posterior a Asturias | Teléfono y WhatsApp vuelven a 670 042 626. |
| Privacidad a 414 píxeles | D.C.G. visible, sin textos provisionales y sin desbordamiento. |
| Escritorio a 1.348 píxeles | Imagen cargada y composición sin desbordamiento horizontal. |

No se enviaron mensajes de WhatsApp ni consultas comerciales durante las pruebas. La portada utiliza por defecto 670 042 626; Madrid, Guadalajara y Toledo mantienen 614 78 99 45 según los datos y pruebas de contacto del proyecto.

Las capturas provienen de la compilación local: [móvil](seo-portada-movil-1793009794973.jpg) y [escritorio](seo-portada-escritorio-1793009865498.jpg). Las anchuras móviles se probaron con documentos embebidos de esos tamaños. No es una prueba física de Safari/iOS, de teclado virtual o de las barras dinámicas de un iPhone; esas diferencias no se presentan como verificadas.

## 5. Encabezados, fragmentos y datos estructurados

Se distinguen las provincias de sus capitales añadiendo «provincia de» al encabezado provincial. Los municipios homónimos, como Villaescusa, indican su provincia. Los títulos municipales conservan el nombre completo y omiten el sufijo adicional cuando resultaría demasiado largo. Las descripciones dejan de repetir «averías» y las ocho páginas de servicio reciben textos específicos.

| Indicador editorial | Antes | Después |
| --- | ---: | ---: |
| Grupos de H1 idénticos | 13 | 0 |
| Títulos de más de 80 caracteres | 90 | 0 |
| Longitud máxima del título | 99 | 72 |
| Metadescripciones de más de 165 caracteres | 87 | 0 |
| Mediana de longitud de las metadescripciones | 150 | 139 |

Las longitudes son criterios internos de revisión. Google puede seleccionar o truncar los fragmentos según la consulta y el dispositivo; no existe una garantía de posicionamiento por respetar esos umbrales. Véanse las recomendaciones sobre [títulos](https://developers.google.com/search/docs/appearance/title-link) y [fragmentos](https://developers.google.com/search/docs/appearance/snippet).

El grafo conserva `Organization`, `WebSite`, `WebPage`, `BreadcrumbList` y `Article`. `Service` describe los municipios, provincias y los ocho servicios. Se añade un logo PNG de 512 × 512 al objeto de organización y metadatos sociales de imagen. No se inventan direcciones, reseñas, puntuaciones ni sedes para conseguir otro tipo de resultado.

Se elimina `FAQPage`, manteniendo las respuestas visibles. Google [retiró el resultado enriquecido FAQ desde el 7 de mayo de 2026](https://developers.google.com/search/updates). Este cambio simplifica el marcado; no constituye por sí mismo una mejora demostrada de clasificación. La sintaxis y coherencia local del JSON-LD se validaron, pero no se afirma haber superado una prueba de resultados enriquecidos de producción.

## 6. Recursos, imágenes y rendimiento

Las imágenes de producto se sirven como recursos locales WebP; se conservan las fotografías reales de portero automático y telefonillo. Las 19.090 referencias de imagen tienen alt y dimensiones declaradas. Hay 15.277 referencias con carga diferida y 3.813 con prioridad alta, sin mezclar ambos atributos en la misma imagen prioritaria.

CSS, JavaScript, fuentes y fotografías se sirven localmente. Los recursos CSS y JS incluyen una versión derivada de su contenido para que un cambio no conserve la referencia de caché anterior. La fuente declara `font-display: swap` y el CSS contempla la preferencia de movimiento reducido.

| Recurso o medida | Resultado local |
| --- | ---: |
| Imagen principal | 31.388 bytes |
| Foto de placa de audio | 38.188 bytes |
| Foto de telefonillo | 5.724 bytes |
| Fuente WOFF2 | 24.836 bytes |
| CSS | 51.089 bytes; 10.892 con gzip local |
| JavaScript | 13.002 bytes; 3.982 con gzip local |
| Mediana de HTML | 43.909 bytes; 9.864 con gzip local |

La mediana anterior de HTML era 44.784 bytes, o 9.792 con gzip. El HTML sin comprimir baja y el comprimido sube ligeramente por los cambios de estructura y contenido. **No se presenta como una mejora medida de velocidad.** La compresión local no representa una descarga real desde Netlify.

No se han medido Lighthouse, LCP, INP, CLS, TTFB ni datos de usuarios reales. Cuando el dominio responda, una medición móvil de producción deberá separar el rendimiento de laboratorio de los datos de campo y centrarse en problemas observados, no en conseguir una puntuación artificial.

## 7. Privacidad y titularidad

Se publica D.C.G. en los textos legales y en el pie. Los teléfonos son los facilitados por el titular. Se eliminan las ramas que mostraban información provisional y no se crean NIF, dirección o correo ficticios. El build comprueba que titular y dominio coinciden entre `data/site.json` y `data/legal.json`.

La política describe el funcionamiento observado: el formulario prepara la consulta en el navegador; al continuar comunica su texto a WhatsApp para abrir la conversación; el visitante confirma el envío allí. La opción de copia prepara texto local. Se explican el alojamiento técnico, las finalidades, la conservación por criterios, los contactos para ejercer derechos y el enlace a la AEPD. No se añaden analítica, píxeles publicitarios o un banner de consentimiento sin una función real que lo justifique.

**Límite de identificación legal:** las iniciales y los teléfonos no bastan para acreditar que se han satisfecho todas las obligaciones de identificación de una web comercial. El [artículo 10 de la LSSI](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758#a10) contempla, entre otros datos, nombre o denominación, dirección, correo electrónico y NIF; el [artículo 13 del RGPD](https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807) exige identidad y contacto del responsable. Respetar la instrucción de publicar únicamente los datos facilitados no elimina esa limitación. No se certifica cumplimiento jurídico completo ni se añaden avisos de «pendiente» a la web.

Si se cambian teléfonos mediante variables de entorno, deben revisarse también los textos de `data/legal.json`. Hoy coinciden.

## 8. Trabajo de posicionamiento posterior

El orden recomendado es resolver dominio y publicación, verificar rastreo e indexación y trabajar las 50 URLs prioritarias. El plan editorial contiene una portada, ocho servicios, 19 provincias y 22 municipios. La selección responde a la estructura actual y la disponibilidad de fuentes, no a un estudio de volumen de búsquedas que no se ha realizado.

Las fichas deben incorporar información verdadera cuando exista: condiciones de desplazamiento y coordinación, preguntas de clientes, modelos intervenidos y casos documentados con fotografías autorizadas. No se pueden fabricar trabajos, técnicos, reseñas o plazos para rellenarlas. Tampoco conviene multiplicar páginas por cada combinación de marca, avería y barrio sin una necesidad diferenciada.

Search Console permitirá estudiar consultas, URLs, clics, impresiones, CTR e indexación. En esta sesión no hay una propiedad conectada y no se han accedido esos datos. La auditoría tampoco incluye un inventario fiable de enlaces entrantes ni una comparación cuantitativa de competidores. Esas limitaciones impiden diagnosticar posiciones o una penalización; no impiden las correcciones aplicadas.

## 9. Reproducibilidad y evidencias

```bash
npm test
npm run build:production
npm run check
npm run audit:seo
```

Los cuatro archivos de pruebas pasan. El comando de auditoría produce `qa/seo-audit.json` y falla si sus controles encuentran errores; los avisos se informan separadamente. El despliegue Netlify mantiene su validación de build existente. El auditor de producción debe ejecutarse contra el build indexable, no contra una vista previa deliberadamente excluida.

Se conservan estas evidencias de la revisión:

- [Resumen estructurado y comparación](seo-summary.json).
- [Resultado completo de las 3.846 páginas, JSON comprimido](seo-audit-full.json.gz).
- [Respuestas DNS y límites de la comprobación pública](seo-domain-check.json).
- [Auditoría de contenido y plan editorial](seo-content-audit.md).
- [Inventario de 50 URLs prioritarias](seo-priority-50.json).
- [Captura móvil](seo-portada-movil-1793009794973.jpg) y [captura de escritorio](seo-portada-escritorio-1793009865498.jpg).

La documentación de Google sobre [contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies) y [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business) fundamenta los criterios editoriales y de marcado. Las cifras del sitio proceden de los archivos y pruebas enumerados, no de estimaciones de tráfico.
