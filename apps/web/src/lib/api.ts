// API Client with hybrid localStorage fallback
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rolId: string;
}

export interface Departamento {
  id: string;
  nombre: string;
}

export interface Organizacion {
  id: string;
  nombre: string;
  responsable: string;
  contacto: string;
  email: string;
  departamentoId: string;
  ciudad: string;
  descripcion: string;
  logo?: string | null;
  web?: string | null;
  tipo: string;
  sector: string;
  verificado: boolean;
  createdAt: string;
}

export interface AyudaHumanitaria {
  id: string;
  tipologia: string;
  descripcion: string;
  urgencia: string;
  solicitante: string;
  contacto: string;
  departamentoId: string;
  direccion: string;
  estado: string;
  seguimiento?: string | null;
  evidenciaMedia?: string | null;
  createdAt: string;
}

export interface Hospital {
  id: string;
  nombre: string;
  departamentoId: string;
  oxigenoDisponibilidad: string;
  camasLibres: number;
  estadoGeneral: string;
  responsableNombre: string;
  responsableContacto: string;
  fechaReporte: string;
  evidenciaMedia?: string | null;
}

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  fuenteSocial?: string | null;
  departamentoId: string;
  estado: string;
  evidenciaMedia?: string | null;
  createdAt: string;
}

export interface Pronunciamiento {
  id: string;
  titulo: string;
  contenido: string;
  organizacion: {
    nombre: string;
    logo?: string | null;
    ciudad: string;
    tipo: string;
  };
  fechaHora: string;
  respaldos?: number;
  organizacionesRespaldadoras?: string[];
  esRepudio?: boolean;
}

export interface AccionRealizada {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string; // "PUENTE_AEREO" | "RESCATE" | "ABASTECIMIENTO"
  departamentoId: string;
  origen: string;
  destino: string;
  detallesLogistica: string;
  fecha: string;
  estado: string; // "COMPLETADO" | "EN_CURSO" | "PROGRAMADO"
}



export interface Victima {
  id: string;
  nombre: string;
  documentoIdentidad?: string | null;
  edad?: number | null;
  genero?: string | null;
  afectacionTipo: string;
  detalles: string;
  contactoFamiliar?: string | null;
  departamentoId: string;
  localidad: string;
  fotografia?: string | null;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  usuarioNombre?: string | null;
  usuarioEmail?: string | null;
  accion: string;
  tabla: string;
  detalles: string;
  ipAddress?: string | null;
  createdAt: string;
}

// Seed Mock Data
const MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 'LP', nombre: 'La Paz' },
  { id: 'CB', nombre: 'Cochabamba' },
  { id: 'SC', nombre: 'Santa Cruz' },
  { id: 'OR', nombre: 'Oruro' },
  { id: 'PT', nombre: 'Potosí' },
  { id: 'TJ', nombre: 'Tarija' },
  { id: 'CH', nombre: 'Chuquisaca' },
  { id: 'BE', nombre: 'Beni' },
  { id: 'PD', nombre: 'Pando' },
];

const MOCK_ORGANIZACIONES: Organizacion[] = [
  {
    id: 'org-1',
    nombre: 'Cruz Roja Boliviana',
    responsable: 'Dr. Enrique Bustamente',
    contacto: '+591 2 2202020',
    email: 'contacto@cruzroja.org.bo',
    departamentoId: 'LP',
    ciudad: 'La Paz',
    descripcion: 'Institución de ayuda humanitaria voluntaria con presencia nacional, dedicada a socorrer en emergencias y desastres.',
    logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150',
    web: 'https://cruzroja.org.bo',
    tipo: 'ONG',
    sector: 'Salud',
    verificado: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: 'org-2',
    nombre: 'Cámara de Industria y Comercio (CAINCO)',
    responsable: 'Lic. Mario Anglarill',
    contacto: '+591 3 3383300',
    email: 'ayuda@cainco.org.bo',
    departamentoId: 'SC',
    ciudad: 'Santa Cruz de la Sierra',
    descripcion: 'Consorcio empresarial que articula donaciones de alimentos, insumos médicos y logística de transporte privado.',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    web: 'https://cainco.org.bo',
    tipo: 'EMPRESA_PRIVADA',
    sector: 'Logística',
    verificado: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'org-3',
    nombre: 'Cáritas Boliviana',
    responsable: 'Hermana Beatriz Mendez',
    contacto: '+591 4 6451221',
    email: 'caritas@iglesia.org.bo',
    departamentoId: 'CB',
    ciudad: 'Cochabamba',
    descripcion: 'Organización eclesial de ayuda solidaria enfocada en el acopio y distribución de alimentos y albergues transitorios.',
    logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150',
    web: 'https://caritas.org.bo',
    tipo: 'FUNDACION',
    sector: 'Alimentación',
    verificado: true,
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 'org-4',
    nombre: 'Colectivo Civil Solidario de Cobija',
    responsable: 'Dra. Gabriela Antelo',
    contacto: '76899120',
    email: 'sol-cobija@gmail.com',
    departamentoId: 'PD',
    ciudad: 'Cobija',
    descripcion: 'Iniciativa ciudadana para coordinar alimentos calientes y agua embotellada para familias damnificadas por desbordes.',
    logo: null,
    tipo: 'COLECTIVO_CIUDADANO',
    sector: 'Alimentación',
    verificado: false,
    createdAt: new Date().toISOString()
  }
];

const MOCK_HOSPITALES: Hospital[] = [
  {
    id: 'hosp-1',
    nombre: 'Hospital de Clínicas - Unidad de Emergencias',
    departamentoId: 'LP',
    oxigenoDisponibilidad: 'LIMITADO',
    camasLibres: 4,
    estadoGeneral: 'ALERTA',
    responsableNombre: 'Dra. Patricia Siles',
    responsableContacto: '77299182',
    fechaReporte: new Date().toISOString()
  },
  {
    id: 'hosp-2',
    nombre: 'Hospital Japonés - Santa Cruz',
    departamentoId: 'SC',
    oxigenoDisponibilidad: 'CRITICO',
    camasLibres: 1,
    estadoGeneral: 'EMERGENCIA',
    responsableNombre: 'Dr. Grover Soleto',
    responsableContacto: '78451122',
    fechaReporte: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'hosp-3',
    nombre: 'Hospital Viedma - Cochabamba',
    departamentoId: 'CB',
    oxigenoDisponibilidad: 'SUFICIENTE',
    camasLibres: 12,
    estadoGeneral: 'ESTABLE',
    responsableNombre: 'Dr. Marcelo Claros',
    responsableContacto: '70712345',
    fechaReporte: new Date().toISOString()
  }
];

const MOCK_AYUDAS: AyudaHumanitaria[] = [
  {
    id: 'ayuda-senda-verde',
    tipologia: 'RESCATE_ANIMAL',
    descripcion: 'Urgente: El Refugio de Vida Silvestre Senda Verde requiere alimentos para primates rescatados y suministros veterinarios específicos para atender quemaduras por incendios forestales.',
    urgencia: 'CRITICA',
    solicitante: 'Senda Verde Wildlife Sanctuary',
    contacto: '76298192 (Dra. Vicky Ossio)',
    departamentoId: 'LP',
    direccion: 'Yolosa, Coroico (Norte de La Paz)',
    estado: 'PENDIENTE',
    evidenciaMedia: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'ayuda-1',
    tipologia: 'OXIGENO',
    descripcion: 'Se requiere con urgencia 5 tubos de oxígeno medicinal para la sala de terapia intermedia debido a fallas de distribución local.',
    urgencia: 'CRITICA',
    solicitante: 'Centro de Salud Integral Villa Tunari',
    contacto: '71928374 (Dr. Jorge Quiroga)',
    departamentoId: 'CB',
    direccion: 'Av. Integración, Villa Tunari',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'ayuda-2',
    tipologia: 'MEDICAMENTOS',
    descripcion: 'Solicitud de analgésicos, gasas estériles y sueros fisiológicos para la atención de damnificados por la inundación.',
    urgencia: 'ALTA',
    solicitante: 'Puesto de Auxilio Comunitario Cliza',
    contacto: '68923489',
    departamentoId: 'CB',
    direccion: 'Plaza Principal Cliza, lado Iglesia',
    estado: 'EN_PROCESO',
    seguimiento: 'Cáritas Cochabamba coordinando el envío de un botiquín de primeros auxilios.',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'ayuda-3',
    tipologia: 'ALIMENTOS',
    descripcion: 'Se necesitan víveres no perecederos (arroz, fideos, aceite, agua embotellada) para abastecer al albergue comunal de 45 familias damnificadas.',
    urgencia: 'ALTA',
    solicitante: 'Albergue Temporal Colcapirhua',
    contacto: '72591283',
    departamentoId: 'CB',
    direccion: 'Coliseo Municipal Colcapirhua',
    estado: 'PENDIENTE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ayuda-4',
    tipologia: 'REFUGIO',
    descripcion: 'Familias afectadas por deslizamiento requieren carpas de campaña e insumos de abrigo (frazadas, colchones).',
    urgencia: 'CRITICA',
    solicitante: 'Junta de Vecinos Bajo Llojeta',
    contacto: '77523190',
    departamentoId: 'LP',
    direccion: 'Av. principal esq. calle 3, Bajo Llojeta',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  }
];

const MOCK_COMUNICADOS = [
  {
    id: 'com-1',
    titulo: 'Comunicado Oficial: Activación del Plan Nacional de Respuesta Inmediata ante Inundaciones',
    contenido: 'Ante el incremento inusual de las precipitaciones en la cuenca amazónica y el desborde de ríos en el departamento de Beni y el trópico de Cochabamba, el Gobierno de la Nación activa los protocolos de emergencia civil. Se disponen puentes aéreos inmediatos para el rescate y abastecimiento con 10 toneladas de ayuda humanitaria inicial.',
    fuente: 'Ministerio de Defensa y Defensa Civil',
    autorNombre: 'Ing. Alejandro Vargas',
    fechaHora: new Date().toISOString()
  }
];

const MOCK_PRONUNCIAMIENTOS: Pronunciamiento[] = [
  {
    id: 'pron-1',
    titulo: 'Declaración Interinstitucional: Respaldo y repudio de hechos de violencia en zonas de conflicto',
    contenido: 'Las organizaciones firmantes expresamos nuestro absoluto rechazo y repudio ante cualquier hecho de violencia que afecte a la población civil e impida el paso de ambulancias, cisternas de oxígeno y ayuda humanitaria en los corredores viales nacionales. Exigimos respeto inmediato a las brigadas de auxilio médico y ratificamos nuestro compromiso inquebrantable de coordinar asistencia en condiciones de neutralidad e imparcialidad.',
    organizacion: { nombre: 'Cruz Roja Boliviana', logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150', ciudad: 'La Paz', tipo: 'ONG' },
    fechaHora: new Date().toISOString(),
    respaldos: 3,
    organizacionesRespaldadoras: ['Cámara de Industria y Comercio (CAINCO)', 'Cáritas Boliviana'],
    esRepudio: true
  }
];

const MOCK_ACCIONES_REALIZADAS: AccionRealizada[] = [
  {
    id: 'accion-1',
    titulo: 'Puente Aéreo LP-01: Envío de Concentradores y Cilindros de Oxígeno',
    descripcion: 'Operación conjunta entre el Viceministerio de Defensa Civil y la Fuerza Aérea Boliviana. Se transportaron 45 concentradores de oxígeno de alta capacidad para la red de hospitales de Cochabamba debido a los bloqueos de carreteras.',
    tipo: 'PUENTE_AEREO',
    departamentoId: 'CB',
    origen: 'La Paz (Base Aérea El Alto)',
    destino: 'Cochabamba (Aeropuerto Jorge Wilstermann)',
    detallesLogistica: 'Avión Hércules C-130 - 4.5 Toneladas de insumos médicos de emergencia',
    fecha: new Date(Date.now() - 6 * 3600000).toISOString(),
    estado: 'COMPLETADO'
  },
  {
    id: 'accion-2',
    titulo: 'Puente Aéreo SC-02: Abastecimiento Crítico de Medicamentos y Sueros',
    descripcion: 'Ruta aérea directa habilitada para sortear puntos de conflicto y abastecer los depósitos de salud en el departamento de Beni.',
    tipo: 'PUENTE_AEREO',
    departamentoId: 'BE',
    origen: 'Santa Cruz (Viru Viru)',
    destino: 'Trinidad (Aeropuerto Teniente Jorge Henrich)',
    detallesLogistica: 'Aeronave FAB de transporte mediano - 2 toneladas de medicamentos esenciales',
    fecha: new Date().toISOString(),
    estado: 'EN_CURSO'
  },
  {
    id: 'accion-3',
    titulo: 'Operación Senda Verde: Evacuación y Resguardo de Fauna Silvestre',
    descripcion: 'Brigadas terrestres del SERNAP y Defensa Civil coordinaron el traslado de emergencia de 18 animales silvestres afectados por los focos de calor y humo hacia recintos limpios en el santuario.',
    tipo: 'RESCATE',
    departamentoId: 'LP',
    origen: 'Zona de Incendios Chulumani',
    destino: 'Refugio Senda Verde, Yolosa',
    detallesLogistica: 'Camiones de rescate animal y biólogos especializados del Viceministerio de Medio Ambiente',
    fecha: new Date(Date.now() - 18 * 3600000).toISOString(),
    estado: 'COMPLETADO'
  }
];

const MOCK_REPORTES: Reporte[] = [
  {
    id: 'rep-1',
    titulo: 'Derrumbe en carretera El Sillar interrumpe paso vehicular de carga pesada',
    descripcion: 'Se reporta deslizamiento de gran magnitud a la altura del kilómetro 115 de la doble vía a Cochabamba - Santa Cruz, sector El Sillar. Gran cantidad de lodo y rocas obstruyen ambos carriles. Cientos de camiones de carga con alimentos y cisternas están parados. Se solicita maquinaria pesada.',
    fuenteSocial: 'https://facebook.com/reportesbolivia/posts/1928374',
    departamentoId: 'CB',
    estado: 'VERIFICADO',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rep-2',
    titulo: 'Alerta de desborde del Río Acre en Cobija - Inundaciones en barrio Frontera',
    descripcion: 'Vecinos de Cobija reportan mediante redes sociales que el caudal del Río Acre ha sobrepasado los niveles de alerta máxima e inunda las viviendas aledañas en el barrio Frontera. Se necesita evacuación de ancianos y niños en botes.',
    fuenteSocial: 'https://twitter.com/CobijaAlert/status/1283928',
    departamentoId: 'PD',
    estado: 'EN_REVISION',
    createdAt: new Date().toISOString()
  }
];

const MOCK_VICTIMAS: Victima[] = [
  {
    id: 'vic-1',
    nombre: 'Juan Carlos Mamani Choque',
    documentoIdentidad: '4839201 LP',
    edad: 42,
    genero: 'MASCULINO',
    afectacionTipo: 'LESIONADO',
    detalles: 'Fractura expuesta de tibia y peroné producto del derrumbe en Bajo Llojeta. Trasladado al Hospital de Clínicas. Estado estable.',
    contactoFamiliar: '77239281 (Esposa: Maria Quispe)',
    departamentoId: 'LP',
    localidad: 'Bajo Llojeta, La Paz',
    fotografia: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vic-2',
    nombre: 'Sofia Valentina Rocha Rojas',
    documentoIdentidad: '8392011 CB',
    edad: 9,
    genero: 'FEMENINO',
    afectacionTipo: 'DAMNIFICADA',
    detalles: 'Familia perdió vivienda completa en inundación en Cliza. Actualmente resguardada en el coliseo municipal de Cliza.',
    contactoFamiliar: '68923489 (Padre: Pedro Rocha)',
    departamentoId: 'CB',
    localidad: 'Comunidad Villa El Carmen, Cliza',
    fotografia: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vic-3',
    nombre: 'Mario Becerra Justiniano',
    documentoIdentidad: '1092834 BE',
    edad: 58,
    genero: 'MASCULINO',
    afectacionTipo: 'DESAPARECIDO',
    detalles: 'Visto por última vez intentando resguardar ganado durante la crecida del río en San Borja. Equipos de rescate fluvial en búsqueda.',
    contactoFamiliar: '78392019 (Hijo: Luis Becerra)',
    departamentoId: 'BE',
    localidad: 'San Borja, Beni',
    fotografia: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    createdAt: new Date().toISOString()
  }
];

const MOCK_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    usuarioNombre: 'Ing. Alejandro Vargas',
    usuarioEmail: 'admin@humanitaria.gob.bo',
    accion: 'INICIO_SESION',
    tabla: 'usuarios',
    detalles: 'Sesión iniciada con credenciales institucionales seguras.',
    ipAddress: '192.168.10.45',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-2',
    usuarioNombre: 'Lic. Claudia Mendoza',
    usuarioEmail: 'moderador@humanitaria.gob.bo',
    accion: 'APROBACION_ORGANIZACION',
    tabla: 'organizaciones',
    detalles: 'Aprobación de registro para "Cruz Roja Boliviana".',
    ipAddress: '192.168.10.46',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// LocalStorage Helper functions
const getStored = (key: string, defaultVal: any) => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(`ayuda_${key}`);
  if (!stored) {
    localStorage.setItem(`ayuda_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(stored);
};

const setStored = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ayuda_${key}`, JSON.stringify(value));
};

export class HelpApi {
  // Check if API is available, otherwise fallback silently
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Toggle fallback state if fetch fails
  public static useMock = true;

  // Initialize storage
  public static init() {
    getStored('organizaciones', MOCK_ORGANIZACIONES);
    getStored('hospitales', MOCK_HOSPITALES);
    getStored('ayudas', MOCK_AYUDAS);
    getStored('comunicados', MOCK_COMUNICADOS);
    getStored('pronunciamientos', MOCK_PRONUNCIAMIENTOS);
    getStored('reportes', MOCK_REPORTES);
    getStored('victimas', MOCK_VICTIMAS);
    getStored('logs', MOCK_LOGS);
    getStored('departamentos', MOCK_DEPARTAMENTOS);
    getStored('acciones_realizadas', MOCK_ACCIONES_REALIZADAS);
  }

  // DEPARTAMENTOS
  public static getDepartamentos(): Departamento[] {
    return MOCK_DEPARTAMENTOS;
  }

  // ORGANIZACIONES
  public static getOrganizaciones(): Organizacion[] {
    this.init();
    return getStored('organizaciones', MOCK_ORGANIZACIONES).filter((o: any) => !o.deletedAt);
  }

  public static addOrganizacion(org: Omit<Organizacion, 'id' | 'createdAt' | 'verificado'>): Organizacion {
    this.init();
    const list = getStored('organizaciones', MOCK_ORGANIZACIONES);
    const newOrg: Organizacion = {
      ...org,
      id: `org-${Math.round(Math.random() * 100000)}`,
      verificado: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newOrg);
    setStored('organizaciones', list);
    this.addLog('REGISTRO_ORGANIZACION_PUBLICA', 'organizaciones', `Organización "${newOrg.nombre}" registrada públicamente.`);
    return newOrg;
  }

  public static verifyOrganizacion(id: string, verificado: boolean) {
    this.init();
    const list = getStored('organizaciones', MOCK_ORGANIZACIONES);
    const item = list.find((o: any) => o.id === id);
    if (item) {
      item.verificado = verificado;
      setStored('organizaciones', list);
      this.addLog(verificado ? 'APROBACION_ORGANIZACION' : 'DESAPROBACION_ORGANIZACION', 'organizaciones', `Organización "${item.nombre}" estado verificado: ${verificado}`);
    }
  }

  // HOSPITALES
  public static getHospitales(): Hospital[] {
    this.init();
    return getStored('hospitales', MOCK_HOSPITALES).filter((h: any) => !h.deletedAt);
  }

  public static updateHospital(id: string, update: Partial<Hospital>): Hospital | null {
    this.init();
    const list = getStored('hospitales', MOCK_HOSPITALES);
    const idx = list.findIndex((h: any) => h.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...update, fechaReporte: new Date().toISOString() };
      setStored('hospitales', list);
      this.addLog('ACTUALIZACION_REPORTE_HOSPITALARIO', 'hospitales', `Hospital "${list[idx].nombre}" - Oxigeno: ${list[idx].oxigenoDisponibilidad}, Camas: ${list[idx].camasLibres}`);
      return list[idx];
    }
    return null;
  }

  public static addHospital(hosp: Omit<Hospital, 'id' | 'fechaReporte'>): Hospital {
    this.init();
    const list = getStored('hospitales', MOCK_HOSPITALES);
    const newHosp: Hospital = {
      ...hosp,
      id: `hosp-${Math.round(Math.random() * 100000)}`,
      fechaReporte: new Date().toISOString()
    };
    list.unshift(newHosp);
    setStored('hospitales', list);
    this.addLog('REGISTRO_REPORTE_HOSPITALARIO', 'hospitales', `Hospital "${newHosp.nombre}" registrado exitosamente.`);
    return newHosp;
  }

  // AYUDAS HUMANITARIAS
  public static getAyudas(): AyudaHumanitaria[] {
    this.init();
    return getStored('ayudas', MOCK_AYUDAS).filter((a: any) => !a.deletedAt);
  }

  public static addAyuda(ayuda: Omit<AyudaHumanitaria, 'id' | 'createdAt' | 'estado'>): AyudaHumanitaria {
    this.init();
    const list = getStored('ayudas', MOCK_AYUDAS);
    const newAyuda: AyudaHumanitaria = {
      ...ayuda,
      id: `ayuda-${Math.round(Math.random() * 100000)}`,
      estado: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };
    list.unshift(newAyuda);
    setStored('ayudas', list);
    this.addLog('CREACION_SOLICITUD_AYUDA', 'ayudas_humanitarias', `Solicitud de ayuda "${newAyuda.tipologia}" creada por "${newAyuda.solicitante}".`);
    return newAyuda;
  }

  public static updateAyuda(id: string, update: Partial<AyudaHumanitaria>) {
    this.init();
    const list = getStored('ayudas', MOCK_AYUDAS);
    const idx = list.findIndex((a: any) => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...update };
      setStored('ayudas', list);
      this.addLog('ACTUALIZACION_SOLICITUD_AYUDA', 'ayudas_humanitarias', `Solicitud "${list[idx].id}" - Estado: ${list[idx].estado}`);
      return list[idx];
    }
    return null;
  }

  // COMUNICADOS
  public static getComunicados() {
    this.init();
    return getStored('comunicados', MOCK_COMUNICADOS);
  }

  public static addComunicado(titulo: string, contenido: string, fuente: string, autorNombre: string) {
    this.init();
    const list = getStored('comunicados', MOCK_COMUNICADOS);
    const newCom = {
      id: `com-${Math.round(Math.random() * 100000)}`,
      titulo,
      contenido,
      fuente,
      autorNombre,
      fechaHora: new Date().toISOString()
    };
    list.unshift(newCom);
    setStored('comunicados', list);
    this.addLog('PUBLICACION_COMUNICADO_OFICIAL', 'comunicados', `Comunicado oficial "${titulo}" publicado.`);
    return newCom;
  }

  // PRONUNCIAMIENTOS
  public static getPronunciamientos() {
    this.init();
    return getStored('pronunciamientos', MOCK_PRONUNCIAMIENTOS);
  }

  public static addPronunciamiento(titulo: string, contenido: string, orgId: string) {
    this.init();
    const orgs = this.getOrganizaciones();
    const org = orgs.find((o) => o.id === orgId) || { nombre: 'Organización Externa', logo: null, ciudad: 'Bolivia', tipo: 'ONG' };
    const list = getStored('pronunciamientos', MOCK_PRONUNCIAMIENTOS);
    const newPron = {
      id: `pron-${Math.round(Math.random() * 100000)}`,
      titulo,
      contenido,
      organizacion: {
        nombre: org.nombre,
        logo: org.logo,
        ciudad: org.ciudad,
        tipo: org.tipo
      },
      fechaHora: new Date().toISOString()
    };
    list.unshift(newPron);
    setStored('pronunciamientos', list);
    this.addLog('REGISTRO_PRONUNCIAMIENTO_ORGANIZACION', 'pronunciamientos', `Pronunciamiento de "${org.nombre}" registrado.`);
    return newPron;
  }

  // REPORTES CIUDADANOS
  public static getReportes(): Reporte[] {
    this.init();
    return getStored('reportes', MOCK_REPORTES).filter((r: any) => !r.deletedAt);
  }

  public static addReporte(rep: Omit<Reporte, 'id' | 'createdAt' | 'estado'>): Reporte {
    this.init();
    const list = getStored('reportes', MOCK_REPORTES);
    const newRep: Reporte = {
      ...rep,
      id: `rep-${Math.round(Math.random() * 100000)}`,
      estado: 'EN_REVISION',
      createdAt: new Date().toISOString()
    };
    list.unshift(newRep);
    setStored('reportes', list);
    this.addLog('REGISTRO_REPORTE_CIUDADANO', 'reportes', `Reporte ciudadano "${newRep.titulo}" registrado.`);
    return newRep;
  }

  public static verifyReporte(id: string, estado: string) {
    this.init();
    const list = getStored('reportes', MOCK_REPORTES);
    const item = list.find((r: any) => r.id === id);
    if (item) {
      item.estado = estado;
      setStored('reportes', list);
      this.addLog('MODERACION_REPORTE_CIUDADANO', 'reportes', `Reporte "${item.titulo}" moderado a estado: ${estado}`);
    }
  }

  // VICTIMAS (SENSITIVE - Restricted Access)
  public static getVictimas(): Victima[] {
    this.init();
    return getStored('victimas', MOCK_VICTIMAS).filter((v: any) => !v.deletedAt);
  }

  public static addVictima(vic: Omit<Victima, 'id' | 'createdAt'>): Victima {
    this.init();
    const list = getStored('victimas', MOCK_VICTIMAS);
    const newVic: Victima = {
      ...vic,
      id: `vic-${Math.round(Math.random() * 100000)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newVic);
    setStored('victimas', list);
    this.addLog('REGISTRO_VICTIMA', 'victimas', `Víctima "${newVic.nombre}" registrada en localidad "${newVic.localidad}".`);
    return newVic;
  }

  // LOGS (SUPER ADMIN ONLY)
  public static getLogs(): SystemLog[] {
    this.init();
    return getStored('logs', MOCK_LOGS);
  }

  // ACCIONES REALIZADAS
  public static getAccionesRealizadas(): AccionRealizada[] {
    this.init();
    return getStored('acciones_realizadas', MOCK_ACCIONES_REALIZADAS);
  }

  public static addAccionRealizada(accion: Omit<AccionRealizada, 'id' | 'fecha'>): AccionRealizada {
    this.init();
    const list = getStored('acciones_realizadas', MOCK_ACCIONES_REALIZADAS);
    const newAccion: AccionRealizada = {
      ...accion,
      id: `accion-${Math.round(Math.random() * 100000)}`,
      fecha: new Date().toISOString()
    };
    list.unshift(newAccion);
    setStored('acciones_realizadas', list);
    this.addLog('CREACION_ACCION_LOGISTICA', 'acciones_realizadas', `Acción logística "${newAccion.titulo}" registrada.`);
    return newAccion;
  }

  // RESPALDAR PRONUNCIAMIENTO
  public static respaldarPronunciamiento(id: string, orgNombre: string) {
    this.init();
    const list = getStored('pronunciamientos', MOCK_PRONUNCIAMIENTOS);
    const item = list.find((p: any) => p.id === id);
    if (item) {
      if (!item.organizacionesRespaldadoras) item.organizacionesRespaldadoras = [];
      if (!item.organizacionesRespaldadoras.includes(orgNombre)) {
        item.organizacionesRespaldadoras.push(orgNombre);
        item.respaldos = (item.respaldos || 0) + 1;
        setStored('pronunciamientos', list);
        this.addLog('RESPALDO_PRONUNCIAMIENTO', 'pronunciamientos', `Respaldo a pronunciamiento "${item.titulo}" dado por "${orgNombre}".`);
      }
    }
    return item;
  }

  private static addLog(accion: string, tabla: string, detalles: string) {
    if (typeof window === 'undefined') return;
    const list = getStored('logs', MOCK_LOGS);

    // Retrieve logged user from session storage
    let userSession = sessionStorage.getItem('ayuda_usuario');
    let usuarioNombre = 'Ciudadano / Público';
    let usuarioEmail = 'no-auth@humanitaria.gob.bo';

    if (userSession) {
      const u = JSON.parse(userSession);
      usuarioNombre = u.nombre;
      usuarioEmail = u.email;
    }

    const newLog: SystemLog = {
      id: `log-${Math.round(Math.random() * 100000)}`,
      usuarioNombre,
      usuarioEmail,
      accion,
      tabla,
      detalles,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    list.unshift(newLog);
    setStored('logs', list);
  }
}
