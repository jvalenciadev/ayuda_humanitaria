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
