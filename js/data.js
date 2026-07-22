// ======================== DATA ========================
const countries = [
  { id:'GT', name:'Guatemala', abbr:'GT', level:'rojo', lat:15.5, lon:-90.25, events:12, fallecidos:3, heridos:18, familias:1240, evacuados:3200, entity:'CONRED' },
  { id:'HN', name:'Honduras', abbr:'HN', level:'naranja', lat:14.1, lon:-87.2, events:8, fallecidos:1, heridos:7, familias:890, evacuados:2100, entity:'COPECO' },
  { id:'SV', name:'El Salvador', abbr:'SV', level:'amarillo', lat:13.7, lon:-89.2, events:5, fallecidos:0, heridos:3, familias:320, evacuados:780, entity:'P. Civil' },
  { id:'NI', name:'Nicaragua', abbr:'NI', level:'naranja', lat:12.8, lon:-85.2, events:7, fallecidos:2, heridos:11, familias:670, evacuados:1540, entity:'SINAPRED' },
  { id:'CR', name:'Costa Rica', abbr:'CR', level:'amarillo', lat:10.0, lon:-84.0, events:4, fallecidos:0, heridos:2, familias:210, evacuados:430, entity:'CNE' },
  { id:'PA', name:'Panamá', abbr:'PA', level:'verde', lat:8.5, lon:-80.0, events:2, fallecidos:0, heridos:0, familias:85, evacuados:120, entity:'SINAPROC' },
  { id:'BZ', name:'Belice', abbr:'BZ', level:'verde', lat:17.2, lon:-88.5, events:1, fallecidos:0, heridos:0, familias:40, evacuados:60, entity:'NEMO' },
  { id:'DO', name:'Rep. Dominicana', abbr:'DO', level:'amarillo', lat:18.7, lon:-70.2, events:6, fallecidos:1, heridos:5, familias:450, evacuados:980, entity:'Defensa Civil' },
];
const levelColors = { rojo:'#ef4444', naranja:'#f97316', amarillo:'#eab308', verde:'#22c55e' };
const levelOrder = { rojo:0, naranja:1, amarillo:2, verde:3 };

const events = [
  { id:1, type:'Tormenta Tropical', name:'TT Andrea', country:'Regional', severity:'rojo', time:'10 Jul 14:30', source:'oficial', icon:'🌀', detail:'Categoría TT con vientos de 95 km/h. Desplazamiento NW a 15 km/h. Presión central 998 mb.' },
  { id:2, type:'Inundación', name:'Río Motagua', country:'Guatemala', severity:'rojo', time:'10 Jul 12:15', source:'sensor', icon:'🌊', detail:'Nivel del río superó umbral crítico en 1.2m. Comunidades ribereñas afectadas en Izabal.' },
  { id:3, type:'Sismo', name:'M5.2 Golfo de Fonseca', country:'Honduras / El Salvador', severity:'naranja', time:'10 Jul 10:42', source:'oficial', icon:'🔴', detail:'Magnitud 5.2, profundidad 38km. Epicentro en Golfo de Fonseca. Sentido en HN, SV y NI.' },
  { id:4, type:'Deslizamiento', name:'Cerro El Pital', country:'El Salvador', severity:'amarillo', time:'10 Jul 09:20', source:'oficial', icon:'⛰️', detail:'Deslizamiento parcial en ladera norte. Carretera CA-4 bloqueada. 3 familias evacuadas.' },
  { id:5, type:'Erupción', name:'Volcán Fuego', country:'Guatemala', severity:'naranja', time:'10 Jul 08:00', source:'sensor', icon:'🌋', detail:'Explosiones moderadas cada 4-6 horas. Columna de ceniza a 4,800 msnm. Flujo piroclástico moderado.' },
  { id:6, type:'Inundación', name:'Río Coco', country:'Nicaragua', severity:'naranja', time:'10 Jul 06:30', source:'oficial', icon:'🌊', detail:'Crecida súbita del Río Coco. 12 comunidades incomunicadas en RAAN.' },
  { id:7, type:'Lluvia intensa', name:'Zona Caribe', country:'Costa Rica', severity:'amarillo', time:'09 Jul 22:00', source:'sensor', icon:'🌧️', detail:'Acumulados de 120mm en 6h. Alerta amarilla por IMN para Limón y Sarapiquí.' },
  { id:8, type:'Marejada', name:'Costa Pacífico', country:'Panamá', severity:'verde', time:'09 Jul 18:45', source:'oficial', icon:'🌊', detail:'Oleaje de 2.5-3.0m en costa pacífica. Precaución para embarcaciones menores.' },
];

const recommendations = [
  { priority:'CRÍTICA', css:'critica', text:'Activar protocolo de vigilancia regional por TT Andrea. Convocar reunión técnica CEPREDENAC de emergencia.', color:'#ef4444' },
  { priority:'ALTA', css:'alta', text:'Recomendar preposicionamiento de ayuda humanitaria en Guatemala y Honduras — activar corredores logísticos.', color:'#f97316' },
  { priority:'ALTA', css:'alta', text:'Emitir boletín regional conjunto sobre riesgo de inundaciones en cuenca del Motagua y Río Coco.', color:'#f97316' },
  { priority:'MEDIA', css:'media', text:'Monitorear réplicas sísmicas en Golfo de Fonseca. Coordinar con COPECO y Protección Civil SV.', color:'#eab308' },
  { priority:'MEDIA', css:'media', text:'Activar modelo predictivo de lahares para Volcán Fuego — horizonte 48h. Coordinar con INSIVUMEH.', color:'#eab308' },
];

const actions = [
  { label:'Emitir Boletín Regional', icon:'📢', color:'#ef4444' },
  { label:'Convocar Reunión Técnica', icon:'📞', color:'#f97316' },
  { label:'Activar Preposicionamiento', icon:'📦', color:'#eab308' },
  { label:'Generar Informe Situacional', icon:'📊', color:'#3b82f6' },
];

const sysStatus = [
  { label:'Ingesta de datos', val:'Activo' },
  { label:'Motor NLP', val:'Procesando' },
  { label:'Correlación regional', val:'Activo' },
  { label:'Modelos predictivos', val:'3 activos' },
  { label:'Última actualización', val:'Hace 2 min' },
];

const timelineData = [
  {t:'04:00',v:1},{t:'06:00',v:3},{t:'08:00',v:6},{t:'10:00',v:9},{t:'12:00',v:14},{t:'14:00',v:17},{t:'16:00',v:13},{t:'18:00',v:10},{t:'20:00',v:7},{t:'22:00',v:5},{t:'00:00',v:2}
];

const predictiveHorizons = {
  '24h': { prob:78, desc:'Alta probabilidad de inundaciones en cuenca Motagua-Polochic. Lluvias acumuladas >100mm previstas. TT Andrea a 280km de costa caribeña.', threats:['Inundación','Deslizamiento','Viento fuerte'], risk:'ALTO' },
  '48h': { prob:62, desc:'TT Andrea podría intensificarse a Cat-1. Trayectoria proyectada hacia costa caribeña HN-NI. Banda de lluvia afectará todo el istmo.', threats:['Tormenta Tropical','Marejada','Inundación','Lahares'], risk:'ALTO' },
  '72h': { prob:45, desc:'Posible degradación a depresión tropical sobre tierra. Riesgo residual de saturación de suelos en toda la región centroamericana.', threats:['Lluvia persistente','Deslizamiento','Inundación residual'], risk:'MODERADO' },
};

const connections = [['GT','HN'],['GT','SV'],['GT','BZ'],['HN','NI'],['HN','SV'],['NI','CR'],['CR','PA']];