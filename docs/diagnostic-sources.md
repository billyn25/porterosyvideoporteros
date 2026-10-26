# Catálogo de averías y preguntas: criterios y fuentes

Revisión: 26 de octubre de 2026.

## Alcance del contenido

El catálogo contiene **48 casos orientativos** y **48 preguntas frecuentes**. Se conservan los 16 diagnósticos y las 24 preguntas originales, con sus identificadores, y se añaden 32 casos y 24 respuestas. Las nuevas entradas cubren situaciones diferentes: llamada, audio, imagen, apertura, funcionamiento del sistema, conexión remota y uso del terminal.

Los textos se han redactado para esta web. El artículo facilitado por el cliente, [«Las 5 averías más frecuentes en vídeoporteros», de Electro Villanueva](https://electrovillanueva.com/blog/las-5-averias-mas-frecuentes-en-videoporteros/), se ha consultado para entender el tipo de contenido solicitado. No se reproducen sus párrafos, su orden de cinco apartados ni sus afirmaciones de diagnóstico. Las posibilidades técnicas se contrastan con documentación del fabricante y se presentan como comprobaciones orientativas.

La selección por municipio no representa averías registradas, incidencia estadística, trabajo realizado ni especialización de esa localidad. Los casos sirven para que una persona describa su problema y encuentre el servicio correspondiente. Su presencia no permite confirmar una pieza averiada sin comprobar la instalación.

## Contrato de datos

Cada diagnóstico conserva `id`, `title`, `symptom`, `scope`, `summary`, `checks`, `nextStep` y `serviceId`. Se añade `topic` con uno de estos valores:

| Valor | Función editorial |
| --- | --- |
| `llamada` | Aviso, pulsadores, destinatario y ocupación |
| `audio` | Escucha, micrófono, volumen, auricular y continuidad |
| `imagen` | Cámara, señal, iluminación, selección y pantalla |
| `apertura` | Orden de apertura, acceso, llaveros y cierre |
| `sistema` | Incidencias comunes, integración, reinicios y estados |
| `conectividad` | Aplicación, cuentas, red y recepción remota |
| `uso` | Manejo, memoria, reloj y facilidad para atender |

Las entradas nuevas incluyen `sourceIds`, que remiten a la siguiente tabla. Esos identificadores documentan las funciones y los límites técnicos considerados. **No significan que el fabricante haya diagnosticado el caso ni que todas las causas posibles procedan de un único manual.** Las propuestas de observación, comparación entre terminales y preparación del aviso son redacción editorial propia. Las dos preguntas sobre fotos y registro de incidencias son pautas editoriales y no atribuyen un diagnóstico a una fuente.

La selección de páginas debe mantenerse estable por municipio. Cambiar de casos en cada visita dificultaría la lectura, la revisión y el seguimiento de una consulta. Un catálogo completo accesible permite encontrar los casos que no aparezcan en la selección local.

## Documentación primaria consultada

| ID | Fuente del fabricante | Qué se ha contrastado |
| --- | --- | --- |
| `golmar-soul` | [Golmar S5110/ART 7W, ficha oficial](https://www.golmar.es/products/s5110-art-7w) y [manual de usuario e instalación, revisión 0125](https://d7rh5s3nxmpy4.cloudfront.net/CMP5021/files/IM_ENG_REV0125_S5110%24ART_7W.pdf) | En este sistema existen placas múltiples, estados de ocupado, monitores principal y adicionales, opciones de memoria, iluminación, auxiliares y control de acceso. Se ha usado para evitar presentar esas funciones como universales. |
| `bticino-classe100` | [BTicino Classe 100V16B, referencia 344652](https://www.bticino.com/products/video-door-entry-systems/2-wires-internal-solutions/classe-100-internal-units/bt-344652) y [ficha técnica ST-00000691](https://dar.bticino.com/asset/Documents/ST_00000691_EN.pdf) | Separación de ajustes de llamada y conversación; regulación de imagen; botones configurables; necesidad de configuración. La referencia consultada no incorpora memoria ni conexión a smartphone. |
| `auta-onex` | [Auta ONEX WiFi, manual HI-984 V1.0](https://auta.es/wp-content/uploads/MONITOR-ONEX-WIFI-2-HILOS_ES_EN-HI-984.pdf) | Activación de la pantalla táctil, modos de uso, reloj, ajustes de imagen y requisitos propios de su sistema de dos hilos. No se extrapolan compatibilidades a otras marcas. |
| `comelit-mini` | [Comelit Mini con auricular ViP, 6702W, manual de usuario](https://staticpro.comelitgroup.com/storage/2018/11/10388/MU_6702W_EN.pdf) | Estados y controles de usuario, opciones dependientes de configuración y accesorios, fecha/hora, memoria y funciones de apertura. |
| `fermax-prueba-local` | [Fermax: cómo comprobar el funcionamiento del videoportero](https://soporte.fermax.com/portal/es/kb/articles/mi-videoportero-no-se-escucha-o-no-tiene-imagen) | Separar llamada, audio, vídeo y apertura; comprobar primero el funcionamiento del terminal antes de atribuir todo a la aplicación. No se generalizan los tiempos o botones de los modelos de ejemplo. |
| `fermax-ocupado` | [Fermax: vídeo o autoencendido no disponible](https://soporte.fermax.com/portal/es/kb/articles/error-al-solicitar-autoencendido) | Diferencia entre canal ocupado, uso local del monitor y problemas de vídeo remoto. |
| `fermax-puertas` | [Fermax: puertas principales en DuoxMe](https://soporte.fermax.com/portal/es/kb/articles/ajustes-de-accesos) | Relación entre cámaras y accesos y gestión de puertas según cuenta, modelo e instalación. No se publican límites de ese producto como capacidades de todos los sistemas. |
| `fermax-corte-apertura` | [Fermax: vista previa, atención y finalización tras abrir](https://soporte.fermax.com/portal/es/kb/articles/tras-abrir-la-puerta-se-corta-la-conexion) | Una vista previa no equivale a conversación aceptada; la finalización tras apertura puede depender del modo o la configuración. |
| `fermax-actualizacion` | [Fermax: indicadores del monitor durante una actualización](https://soporte.fermax.com/portal/es/kb/articles/actualizacion-firmware-auto) | Algunos parpadeos corresponden a una actualización temporal. El patrón descrito en la fuente se refiere a modelos concretos y no se aplica a cualquier luz intermitente. |
| `fermax-usuarios` | [Fermax: desvinculación al añadir otra cuenta](https://soporte.fermax.com/portal/es/kb/articles/mi-cuenta-ha-sido-desvinculada-por-que) | Distinción entre emparejar de nuevo e invitar a otro usuario autorizado. |
| `fermax-red` | [Fermax: requisitos de red de un monitor WiFi](https://soporte.fermax.com/portal/es/kb/articles/cuales-son-los-requisitos-de-configuracion-de-red-para-conectar-un-monitor-wifi) | La compatibilidad depende de banda, autenticación y configuración de red. No se recomienda retirar seguridad, abrir puertos sin necesidad ni compartir contraseñas. |
| `fermax-notificaciones` | [Fermax: las llamadas no llegan, tardan o no suenan](https://soporte.fermax.com/portal/es/kb/articles/no-recibo-las-llamadas-en-mi-smartphone-o-tardan-o-no-suenan) y [configuración del smartphone](https://soporte.fermax.com/portal/es/kb/articles/configuracion-recomendada-del-smartphone) | Permisos y actividad de la aplicación, estado de conexión y diferencia entre retraso, falta de sonido y falta de aviso. |
| `fermax-abrepuertas` | [Fermax: ficha del abrepuertas 540AD-S MAX](https://fermax.com/.doc-download?index=0&lang=es&slug=f28201-abrepuertas-estandar-540ad-s-max&type=product_techsheet) | Existencia de distintos modos de funcionamiento, desbloqueo y ajuste mecánico. Estos detalles justifican revisar el conjunto de cierre, sin prescribir un recambio antes de comprobarlo. |

## Límites de las recomendaciones

Los pasos para la persona que consulta se limitan a los controles habituales, la observación externa y la descripción del fallo. No indican abrir fuentes, intervenir en cableado, puentear circuitos, cambiar direcciones, borrar usuarios o restablecer de fábrica. Las tareas de instalación, medida y configuración técnica corresponden a la revisión del sistema.

El catálogo no califica estas situaciones como las más frecuentes ni les asigna porcentajes, tiempos de reparación o causas seguras. Tampoco afirma que todos los equipos de dos hilos sean intercambiables, que WiFi elimine el cableado o que todas las aplicaciones y monitores tengan las mismas funciones.
