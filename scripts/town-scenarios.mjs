// Escenarios de consulta orientativos: nunca se presentan como trabajos realizados ni averías reales.
const contexts=[
 ['Un telefonillo que no suena','Comprueba si el timbre funciona en otras viviendas antes de atribuir el fallo a la placa.'],
 ['La puerta no se libera','Distingue entre escuchar el zumbido del abrepuertas y que la cerradura llegue a soltarse.'],
 ['Audio con ruido o cortes','Anota si la interferencia aparece al hablar, al recibir la llamada o durante toda la conversación.'],
 ['Una pantalla sin imagen','Separa una pantalla negra de una imagen borrosa o con interferencias; la comprobación cambia.'],
 ['Renovar la placa exterior','Conviene conocer cuántas viviendas y accesos utiliza la instalación y si existen repuestos.'],
 ['Pasar de audio a vídeo','La tecnología del sistema y el recorrido de cables determinan si puede aprovecharse parte de la instalación.'],
 ['Atender llamadas desde el móvil','Hay que comprobar la compatibilidad del monitor, la conexión y los permisos de la aplicación.'],
 ['Sustituir un único terminal','La marca por sí sola no garantiza que el nuevo telefonillo sea compatible con la placa común.'],
 ['Una segunda entrada que falla','Indica si el problema aparece en todas las viviendas o únicamente al llamar desde una placa.'],
 ['Apertura intermitente','Anota si sucede siempre, tras varias llamadas o solo cuando la puerta está cerrada con presión.'],
 ['Llamadas que llegan a otro piso','Revisa la identificación de la vivienda y los ajustes del sistema sin manipular el cuadro común.'],
 ['Un equipo que se reinicia','Explica cuándo se reinicia: al llamar, al hablar, al abrir o al utilizar la pantalla.']
];
const settings=[
 ['Piso en comunidad','Es útil preguntar a otro vecino si observa el mismo síntoma.'],
 ['Portal con varias viviendas','La revisión puede incluir elementos comunes y terminales individuales.'],
 ['Casa con acceso exterior','Indica la distancia entre la entrada y el terminal interior.'],
 ['Local con atención al público','Conviene explicar los horarios y cómo se recibe actualmente a los visitantes.'],
 ['Edificio con dos portales','Identifica la placa y el acceso concreto donde aparece el problema.'],
 ['Vivienda con monitor adicional','Indica si los dos terminales presentan el mismo comportamiento.'],
 ['Comunidad que quiere renovar','Una propuesta comparable debe separar elementos comunes y equipos de cada vivienda.'],
 ['Acceso con teclado o llavero','Aclara si falla la llamada, la apertura por credencial o ambas funciones.']
];
const preparations=[
 'Una fotografía legible de la referencia del equipo evita confundir familias de productos.',
 'No manipules fuentes de alimentación ni cableado comunitario sin personal cualificado.',
 'Indica si el fallo comenzó tras un corte de luz, una obra o un cambio de equipo.',
 'Si la instalación tiene varias placas, identifica cuál presenta el síntoma.',
 'Describe lo que funciona correctamente además de lo que falla.',
 'Si el problema es de conectividad, comprueba si el uso local del monitor sigue funcionando.',
 'En una comunidad, identifica a la persona que puede facilitar acceso a los elementos comunes.',
 'Si quieres renovar, señala las funciones que necesitas conservar.'
];
const hashCode=value=>{let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
export function townScenario(town){
 const seed=hashCode(town.code+':scenario:v1');
 const scenario=contexts[seed%contexts.length];
 const setting=settings[Math.floor(seed/contexts.length)%settings.length];
 const tip=preparations[Math.floor(seed/(contexts.length*settings.length))%preparations.length];
 return {title:scenario[0],intro:scenario[1],setting:setting[0],detail:setting[1],tip};
}
