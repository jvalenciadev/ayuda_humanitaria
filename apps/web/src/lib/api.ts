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

// // Seed Mock Data
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

const MOCK_AYUDAS: AyudaHumanitaria[] = [
  {
    id: 'ayuda-san-matias',
    tipologia: 'MEDICAMENTOS',
    descripcion: 'Urgente: Se requieren kits de rehidratación, colirios oftálmicos para quemaduras de humo y mascarillas de carbón activo para las brigadas de bomberos voluntarios que combaten los incendios forestales en el Área Natural de Manejo Integrado (ANMI) San Matías.',
    urgencia: 'CRITICA',
    solicitante: 'Comité de Operaciones de Emergencia Municipal (COEM) San Matías',
    contacto: '78592031 (Ing. Roly Cabrera)',
    departamentoId: 'SC',
    direccion: 'Zona Central, Frente a la Plaza Principal de San Matías',
    estado: 'PENDIENTE',
    evidenciaMedia: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'ayuda-cobija-inundaciones',
    tipologia: 'OXIGENO',
    descripcion: 'Solicitud de 8 concentradores de oxígeno portátiles y kits de primeros auxilios para los centros de salud ambulatorios habilitados temporalmente en Cobija tras el desborde del Río Acre.',
    urgencia: 'CRITICA',
    solicitante: 'Servicio Departamental de Salud (SEDES) Pando',
    contacto: '72084931 (Dra. Mónica Flores)',
    departamentoId: 'PD',
    direccion: 'Coliseo Cerrado de Cobija (Albergue Transitorio)',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'ayuda-pasorapa-sequia',
    tipologia: 'DONACIONES',
    descripcion: 'Requerimiento de pastillas potabilizadoras de agua, tanques flexibles de almacenamiento (tipo Bladder) y forraje para ganado vacuno afectado por la sequía extrema en el Cono Sur de Cochabamba.',
    urgencia: 'ALTA',
    solicitante: 'Gobierno Autónomo Municipal de Pasorapa',
    contacto: '67493201 (Agron. Mateo Salinas)',
    departamentoId: 'CB',
    direccion: 'Alcaldía Municipal de Pasorapa, Pasorapa',
    estado: 'EN_PROCESO',
    seguimiento: 'Defensa Civil coordinando envío de tanques cisterna desde la central regional.',
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 'ayuda-achocalla-deslizamiento',
    tipologia: 'REFUGIO',
    descripcion: 'Familias afectadas por deslizamiento de talud en Achocalla requieren carpas térmicas familiares, frazadas de alto abrigo y colchonetas debido a las bajas temperaturas nocturnas en el sector.',
    urgencia: 'ALTA',
    solicitante: 'Asociación Comunitaria Arco Iris - Achocalla',
    contacto: '73291038 (Sra. Julia Apaza)',
    departamentoId: 'LP',
    direccion: 'Distrito 6, Zona Arco Iris, Achocalla',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString()
  },
  {
    id: 'ayuda-challapata-helada',
    tipologia: 'MEDICAMENTOS',
    descripcion: 'Insumos de reconstitución veterinaria y antibióticos para ganado camélido (alpacas y llamas) afectado por heladas extremas que destruyeron los pastizales altoandinos.',
    urgencia: 'MEDIA',
    solicitante: 'Asociación de Productores Camélidos Challapata',
    contacto: '71298412 (Don Hilarión Choque)',
    departamentoId: 'OR',
    direccion: 'Comunidad Central Challapata',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'ayuda-tipuani-riada',
    tipologia: 'TRANSPORTE',
    descripcion: 'Se requieren motobombas industriales de lodo y personal de rescate voluntario para succionar y despejar viviendas anegadas tras el colapso del muro de contención en Tipuani.',
    urgencia: 'CRITICA',
    solicitante: 'Centro Operativo Tipuani',
    contacto: '71589320 (Sgto. Hugo Machaca)',
    departamentoId: 'LP',
    direccion: 'Barrio Bajo, Av. Principal de Tipuani',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'ayuda-tupiza-frio',
    tipologia: 'REFUGIO',
    descripcion: 'Urgente: Frazadas, colchones y estufas eléctricas para el albergue invernal habilitado para adultos mayores en situación de calle ante la ola de frío polar.',
    urgencia: 'ALTA',
    solicitante: 'Centro de Acogida San Pedro de Tupiza',
    contacto: '68492019 (Hna. Teresa Tapia)',
    departamentoId: 'PT',
    direccion: 'Calle Suipacha s/n, Tupiza',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'ayuda-villamontes-chaco',
    tipologia: 'DONACIONES',
    descripcion: 'Dotación de cisternas de agua potable de emergencia para comunidades indígenas del Chaco boliviano aisladas por la sequía.',
    urgencia: 'CRITICA',
    solicitante: 'Capitanía Grande Guaraní del Chaco',
    contacto: '76049281 (Mburuvicha Nelson Rivas)',
    departamentoId: 'TJ',
    direccion: 'Zona Ibibobo, Villamontes',
    estado: 'EN_PROCESO',
    seguimiento: 'Envío de 2 cisternas militares de 10,000 litros coordinado con Defensa Civil.',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString()
  },
  {
    id: 'ayuda-cuatro-canadas',
    tipologia: 'ALIMENTOS',
    descripcion: 'Raciones secas (arroz, azúcar, fideos) y bidones de agua de mesa para 80 familias refugiadas en el colegio municipal debido a inundación de sembradíos.',
    urgencia: 'ALTA',
    solicitante: 'Alcaldía Municipal de Cuatro Cañadas',
    contacto: '65094821 (Lic. Javier Ortiz)',
    departamentoId: 'SC',
    direccion: 'Col. Germán Busch, Cuatro Cañadas',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 16 * 3600000).toISOString()
  },
  {
    id: 'ayuda-moxos-antiofidico',
    tipologia: 'MEDICAMENTOS',
    descripcion: 'Envío urgente de 30 ampollas de suero antiofídico polivalente y medicamentos contra vectores debido a inundaciones que provocaron la migración de reptiles.',
    urgencia: 'CRITICA',
    solicitante: 'Centro de Salud San Ignacio de Moxos',
    contacto: '72948201 (Dra. Clara Cuellar)',
    departamentoId: 'BE',
    direccion: 'Plaza de San Ignacio de Moxos, Beni',
    estado: 'PENDIENTE',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString()
  }
];

const MOCK_COMUNICADOS = [
  {
    id: 'com-1',
    titulo: 'Comunicado Oficial: Activación del Plan Nacional de Respuesta Civil ante Desbordes en la Amazonía',
    contenido: 'Debido al incremento extraordinario de las lluvias estacionales en las cuencas altas de los ríos Acre y Madre de Dios, el Gobierno Nacional ha dispuesto la declaración de Alerta Roja hidrológica. Se han desplegado 15 brigadas de rescate fluvial de la Armada Boliviana y se han establecido puentes aéreos para abastecer alimentos secos y medicamentos de emergencia.',
    fuente: 'Ministerio de Defensa y Viceministerio de Defensa Civil',
    autorNombre: 'Ing. Alejandro Vargas',
    fechaHora: new Date().toISOString()
  },
  {
    id: 'com-2',
    titulo: 'Boletín Meteorológico Especial: Alerta Naranja por Vientos y Ola de Frío en el Altiplano',
    contenido: 'El SENAMHI emite alerta naranja por descensos térmicos severos bajo cero en los departamentos de Oruro, Potosí y la región andina de La Paz. Se recomienda a los municipios activar comités de emergencia de protección camélida y dotar de abrigos térmicos a los albergues municipales.',
    fuente: 'Servicio Nacional de Meteorología e Hidrología (SENAMHI)',
    autorNombre: 'Lic. Claudia Mendoza',
    fechaHora: new Date(Date.now() - 18000000).toISOString()
  }
];

const MOCK_ACCIONES_REALIZADAS: AccionRealizada[] = [
  {
    id: 'accion-1',
    titulo: 'Puente Aéreo LP-01: Despliegue de Sueros y Concentradores de Oxígeno',
    descripcion: 'Transporte aéreo de emergencia de material hospitalario para sortear los bloqueos en las carreteras troncales y abastecer los almacenes de la red de salud central en el trópico.',
    tipo: 'PUENTE_AEREO',
    departamentoId: 'CB',
    origen: 'La Paz (Base Aérea de El Alto)',
    destino: 'Cochabamba (Aeropuerto Jorge Wilstermann)',
    detallesLogistica: 'Avión Hércules C-130 de la FAB - 4.5 Toneladas de insumos médicos de primera necesidad',
    fecha: new Date(Date.now() - 8 * 3600000).toISOString(),
    estado: 'COMPLETADO'
  },
  {
    id: 'accion-2',
    titulo: 'Puente Aéreo SC-02: Distribución de Fármacos y Pastillas Potabilizadoras',
    descripcion: 'Habilitación de puente logístico inmediato para la dotación de pastillas purificadoras y mosquiteros al departamento de Pando.',
    tipo: 'PUENTE_AEREO',
    departamentoId: 'PD',
    origen: 'Santa Cruz (Aeropuerto Viru Viru)',
    destino: 'Cobija (Aeropuerto Capitán Aníbal Arab)',
    detallesLogistica: 'Aeronave militar ligera bimotor - 1.8 toneladas de medicamentos antipalúdicos y potabilizadores',
    fecha: new Date().toISOString(),
    estado: 'EN_CURSO'
  },
  {
    id: 'accion-3',
    titulo: 'Operación Fluvial Mamoré: Evacuación y Salvamento Civil',
    descripcion: 'Búsqueda y rescate terrestre y fluvial de pobladores aislados por el desborde del río en las inmediaciones de San Borja.',
    tipo: 'RESCATE',
    departamentoId: 'BE',
    origen: 'Puerto Varador',
    destino: 'Comunidades Ribereñas de San Borja',
    detallesLogistica: 'Lanchas rápidas de la Armada Boliviana con socorristas y médicos del COE Beni',
    fecha: new Date(Date.now() - 20 * 3600000).toISOString(),
    estado: 'COMPLETADO'
  },
  {
    id: 'accion-4',
    titulo: 'Puente Aéreo TJ-03: Envío de Reconstituyentes Veterinarios a Villamontes',
    descripcion: 'Envío aéreo logístico de alimento concentrado y vacunas para camélidos y ganado ovino de comunidades andinas aisladas.',
    tipo: 'PUENTE_AEREO',
    departamentoId: 'TJ',
    origen: 'Tarija (Base Oriel Lea Plaza)',
    destino: 'Villamontes (Aeródromo Militar)',
    detallesLogistica: 'Avión de transporte mediano C-212 - 2.2 toneladas de insumos logísticos',
    fecha: new Date(Date.now() - 36 * 3600000).toISOString(),
    estado: 'COMPLETADO'
  }
];

const MOCK_REPORTES: Reporte[] = [
  {
    id: 'rep-1',
    titulo: 'Derrumbe severo en el Km 115 del tramo El Sillar paraliza circulación vehicular',
    descripcion: 'Gran volumen de mazamorra y lodo cayó sobre ambos carriles de la doble vía Cochabamba - Santa Cruz, a la altura de El Sillar. Hay cientos de vehículos de carga y buses de pasajeros varados en el lugar. Se requiere con urgencia maquinaria pesada de la ABC.',
    fuenteSocial: 'https://facebook.com/reportesboliviainmediato/posts/2910384',
    departamentoId: 'CB',
    estado: 'VERIFICADO',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'rep-2',
    titulo: 'Incendio forestal de copa activo cerca de la comunidad indígena Porvenir en Concepción',
    descripcion: 'Imágenes satelitales confirman avance rápido de focos de calor y humo espeso en la Chiquitanía, amenazando pastizales y viviendas de la comunidad Porvenir. El viento norte de 45 km/h dificulta el combate manual.',
    fuenteSocial: 'https://twitter.com/ChiquitaniaFuego/status/12839281',
    departamentoId: 'SC',
    estado: 'EN_REVISION',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'rep-3',
    titulo: 'Derrumbe en carretera La Paz - Caranavi sector Puente Armas',
    descripcion: 'Deslizamiento de piedras de gran tamaño bloquea el acceso terrestre a los Yungas. Se reporta un vehículo particular afectado sin daños personales de gravedad. Tránsito suspendido.',
    fuenteSocial: 'https://facebook.com/yungasnoticias/posts/1029302',
    departamentoId: 'LP',
    estado: 'VERIFICADO',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'rep-4',
    titulo: 'Granizada severa daña cultivos de vid y hortalizas en Luribay',
    descripcion: 'Granizada de 40 minutos en el valle de Luribay destruye plantaciones de uva y hortalizas prontas para la cosecha. Agricultores locales piden declaración de zona de desastre para recibir semillas.',
    fuenteSocial: 'https://facebook.com/luribayproductores/posts/402819',
    departamentoId: 'LP',
    estado: 'EN_REVISION',
    createdAt: new Date(Date.now() - 7 * 3600000).toISOString()
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
    detalles: 'Fractura expuesta de tibia y peroné producto del derrumbe de muro de contención en Bajo Llojeta. Trasladado al Hospital de Clínicas de La Paz. Estado actual estable.',
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
    detalles: 'Pérdida de vivienda por riada en Cliza. Actualmente resguardada en el coliseo municipal junto a sus padres y hermano menor.',
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
    detalles: 'Visto por última vez intentando rescatar cabezas de ganado durante la crecida del río en San Borja. Grupos de salvamento fluvial realizan búsqueda activa río abajo.',
    contactoFamiliar: '78392019 (Hijo: Luis Becerra)',
    departamentoId: 'BE',
    localidad: 'Comunidad Galilea, San Borja',
    fotografia: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vic-4',
    nombre: 'Carmen Rosa Soliz',
    documentoIdentidad: '6302912 SC',
    edad: 34,
    genero: 'FEMENINO',
    afectacionTipo: 'LESIONADA',
    detalles: 'Inhalación severa de monóxido de carbono durante los incendios en Concepción. Atendida con oxigenoterapia en el Centro de Salud local.',
    contactoFamiliar: '71520192 (Hermano: David Soliz)',
    departamentoId: 'SC',
    localidad: 'Comunidad indígena Porvenir, Concepción',
    fotografia: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
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
    detalles: 'Sesión iniciada exitosamente con firma digital.',
    ipAddress: '192.168.10.45',
    createdAt: new Date().toISOString()
  },
  {
    id: 'log-2',
    usuarioNombre: 'Lic. Claudia Mendoza',
    usuarioEmail: 'moderador@humanitaria.gob.bo',
    accion: 'APROBACION_REPORTE',
    tabla: 'reportes',
    detalles: 'Verificación del reporte de derrumbe en El Sillar.',
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
    getStored('ayudas', MOCK_AYUDAS);
    getStored('comunicados', MOCK_COMUNICADOS);
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
