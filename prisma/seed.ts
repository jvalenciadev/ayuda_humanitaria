import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Seed Roles
  const roles = [
    { id: 'SUPER_ADMIN', nombre: 'Super Administrador' },
    { id: 'MODERATOR', nombre: 'Moderador Institucional' },
    { id: 'VERIFIER', nombre: 'Verificador de Campo' },
    { id: 'VISUALIZER', nombre: 'Visualizador de Datos' },
  ];

  for (const r of roles) {
    await prisma.rol.upsert({
      where: { id: r.id },
      update: { nombre: r.nombre },
      create: r,
    });
  }
  console.log('Roles seeded successfully.');

  // 2. Seed Departments
  const departamentos = [
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

  for (const d of departamentos) {
    await prisma.departamento.upsert({
      where: { id: d.id },
      update: { nombre: d.nombre },
      create: d,
    });
  }
  console.log('Departments seeded successfully.');

  // 3. Seed Default Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const modPassword = await bcrypt.hash('mod123', salt);
  const verifierPassword = await bcrypt.hash('verifier123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@humanitaria.gob.bo' },
    update: {},
    create: {
      nombre: 'Ing. Alejandro Vargas',
      email: 'admin@humanitaria.gob.bo',
      password: adminPassword,
      rolId: 'SUPER_ADMIN',
    },
  });

  const moderator = await prisma.usuario.upsert({
    where: { email: 'moderador@humanitaria.gob.bo' },
    update: {},
    create: {
      nombre: 'Lic. Claudia Mendoza',
      email: 'moderador@humanitaria.gob.bo',
      password: modPassword,
      rolId: 'MODERATOR',
    },
  });

  const verifier = await prisma.usuario.upsert({
    where: { email: 'verificador@humanitaria.gob.bo' },
    update: {},
    create: {
      nombre: 'Dr. Fernando Rios',
      email: 'verificador@humanitaria.gob.bo',
      password: verifierPassword,
      rolId: 'VERIFIER',
    },
  });

  console.log('Default users seeded successfully.');

  // 4. Seed Organizations
  const org1 = await prisma.organizacion.create({
    data: {
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
    },
  });

  const org2 = await prisma.organizacion.create({
    data: {
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
    },
  });

  const org3 = await prisma.organizacion.create({
    data: {
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
    },
  });

  console.log('Organizations seeded.');

  // 5. Seed Hospitals with Oxygen Level details
  await prisma.hospital.createMany({
    data: [
      {
        nombre: 'Hospital de Clínicas - Unidad de Emergencias',
        departamentoId: 'LP',
        oxigenoDisponibilidad: 'LIMITADO',
        camasLibres: 4,
        estadoGeneral: 'ALERTA',
        responsableNombre: 'Dra. Patricia Siles',
        responsableContacto: '77299182',
        reportadoPorId: verifier.id,
        fechaReporte: new Date(),
      },
      {
        nombre: 'Hospital Japonés - Santa Cruz',
        departamentoId: 'SC',
        oxigenoDisponibilidad: 'CRITICO',
        camasLibres: 1,
        estadoGeneral: 'EMERGENCIA',
        responsableNombre: 'Dr. Grover Soleto',
        responsableContacto: '78451122',
        reportadoPorId: verifier.id,
        fechaReporte: new Date(),
      },
      {
        nombre: 'Hospital Viedma - Cochabamba',
        departamentoId: 'CB',
        oxigenoDisponibilidad: 'SUFICIENTE',
        camasLibres: 12,
        estadoGeneral: 'ESTABLE',
        responsableNombre: 'Dr. Marcelo Claros',
        responsableContacto: '70712345',
        reportadoPorId: verifier.id,
        fechaReporte: new Date(),
      },
    ],
  });
  console.log('Hospitals seeded.');

  // 6. Seed Help Requests
  await prisma.ayudaHumanitaria.createMany({
    data: [
      {
        tipologia: 'OXIGENO',
        descripcion: 'Se requiere con urgencia 5 tubos de oxígeno medicinal para la sala de terapia intermedia debido a fallas de distribución local.',
        urgencia: 'CRITICA',
        solicitante: 'Centro de Salud Integral Villa Tunari',
        contacto: '71928374 (Dr. Jorge Quiroga)',
        departamentoId: 'CB',
        direccion: 'Av. Integración, Villa Tunari',
        estado: 'PENDIENTE',
      },
      {
        tipologia: 'MEDICAMENTOS',
        descripcion: 'Solicitud de analgésicos, gasas estériles y sueros fisiológicos para la atención de damnificados por la inundación.',
        urgencia: 'ALTA',
        solicitante: 'Puesto de Auxilio Comunitario Cliza',
        contacto: '68923489',
        departamentoId: 'CB',
        direccion: 'Plaza Principal Cliza, lado Iglesia',
        estado: 'EN_PROCESO',
        seguimiento: 'Cáritas Cochabamba coordinando el envío de un botiquín de primeros auxilios.',
      },
      {
        tipologia: 'ALIMENTOS',
        descripcion: 'Se necesitan víveres no perecederos (arroz, fideos, aceite, agua embotellada) para abastecer al albergue comunal de 45 familias damnificadas.',
        urgencia: 'ALTA',
        solicitante: 'Albergue Temporal Colcapirhua',
        contacto: '72591283',
        departamentoId: 'CB',
        direccion: 'Coliseo Municipal Colcapirhua',
        estado: 'PENDIENTE',
      },
      {
        tipologia: 'REFUGIO',
        descripcion: 'Familias afectadas por deslizamiento requieren carpas de campaña e insumos de abrigo (frazadas, colchones).',
        urgencia: 'CRITICA',
        solicitante: 'Junta de Vecinos Bajo Llojeta',
        contacto: '77523190',
        departamentoId: 'LP',
        direccion: 'Av. principal esq. calle 3, Bajo Llojeta',
        estado: 'PENDIENTE',
      },
    ],
  });
  console.log('Help requests seeded.');

  // 7. Seed Official Comunicados
  await prisma.comunicado.create({
    data: {
      titulo: 'Comunicado Oficial: Activación del Plan Nacional de Respuesta Inmediata ante Inundaciones',
      contenido: 'Ante el incremento inusual de las precipitaciones en la cuenca amazónica y el desborde de ríos en el departamento de Beni y el trópico de Cochabamba, el Gobierno de la Nación activa los protocolos de emergencia civil. Se disponen puentes aéreos inmediatos para el rescate y abastecimiento con 10 toneladas de ayuda humanitaria inicial.',
      fuente: 'Ministerio de Defensa y Defensa Civil',
      autorId: superAdmin.id,
      estado: 'VERIFICADO',
    },
  });

  // 8. Seed Official Pronunciamientos from Organizations
  await prisma.pronunciamiento.create({
    data: {
      titulo: 'Pronunciamiento de Cruz Roja Boliviana ante los hechos en Bajo Llojeta',
      contenido: 'La Cruz Roja Boliviana expresa su profunda solidaridad con las familias afectadas por el deslizamiento en la zona de Bajo Llojeta en la ciudad de La Paz. Informamos que nuestros equipos de voluntarios ya se encuentran desplegados brindando primeros auxilios, apoyo psicológico y coordinando la distribución de albergue temporal junto con las autoridades municipales e institucionales nacionales.',
      organizacionId: org1.id,
      autorId: moderator.id,
      estado: 'VERIFICADO',
    },
  });
  console.log('Official announcements seeded.');

  // 9. Seed Citizen Reports for verification
  await prisma.reporte.create({
    data: {
      titulo: 'Derrumbe en carretera El Sillar interrumpe paso vehicular de carga pesada',
      descripcion: 'Se reporta deslizamiento de gran magnitud a la altura del kilómetro 115 de la doble vía a Cochabamba - Santa Cruz, sector El Sillar. Gran cantidad de lodo y rocas obstruyen ambos carriles. Cientos de camiones de carga con alimentos y cisternas están parados. Se solicita maquinaria pesada.',
      fuenteSocial: 'https://facebook.com/reportesbolivia/posts/1928374',
      departamentoId: 'CB',
      estado: 'VERIFICADO',
    },
  });

  await prisma.reporte.create({
    data: {
      titulo: 'Alerta de desborde del Río Acre en Cobija - Inundaciones en barrio Frontera',
      descripcion: 'Vecinos de Cobija reportan mediante redes sociales que el caudal del Río Acre ha sobrepasado los niveles de alerta máxima e inunda las viviendas aledañas en el barrio Frontera. Se necesita evacuación de ancianos y niños en botes.',
      fuenteSocial: 'https://twitter.com/CobijaAlert/status/1283928',
      departamentoId: 'PD',
      estado: 'EN_REVISION',
    },
  });

  console.log('Citizen reports seeded.');

  // 10. Seed Victims (Confidential Record)
  await prisma.victima.createMany({
    data: [
      {
        nombre: 'Juan Carlos Mamani Choque',
        documentoIdentidad: '4839201 LP',
        edad: 42,
        genero: 'MASCULINO',
        afectacionTipo: 'LESIONADO',
        detalles: 'Fractura expuesta de tibia y peroné producto del derrumbe en Bajo Llojeta. Trasladado al Hospital de Clínicas. Estado estable.',
        contactoFamiliar: '77239281 (Esposa: Maria Quispe)',
        departamentoId: 'LP',
        localidad: 'Bajo Llojeta, La Paz',
      },
      {
        nombre: 'Sofia Valentina Rocha Rojas',
        documentoIdentidad: '8392011 CB',
        edad: 9,
        genero: 'FEMENINO',
        afectacionTipo: 'DAMNIFICADA',
        detalles: 'Familia perdió vivienda completa en inundación en Cliza. Actualmente resguardada en el coliseo municipal de Cliza.',
        contactoFamiliar: '68923489 (Padre: Pedro Rocha)',
        departamentoId: 'CB',
        localidad: 'Comunidad Villa El Carmen, Cliza',
      },
      {
        nombre: 'Mario Becerra Justiniano',
        documentoIdentidad: '1092834 BE',
        edad: 58,
        genero: 'MASCULINO',
        afectacionTipo: 'DESAPARECIDO',
        detalles: 'Visto por última vez intentando resguardar ganado durante la crecida del río en San Borja. Equipos de rescate fluvial en búsqueda.',
        contactoFamiliar: '78392019 (Hijo: Luis Becerra)',
        departamentoId: 'BE',
        localidad: 'San Borja, Beni',
      },
    ],
  });
  console.log('Victims registry seeded.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
