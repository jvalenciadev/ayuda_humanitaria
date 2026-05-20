import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const organizacionSchema = z.object({
  body: z.object({
    nombre: z.string().min(3, 'El nombre debe tener mínimo 3 caracteres'),
    responsable: z.string().min(3, 'El responsable debe tener mínimo 3 caracteres'),
    contacto: z.string(),
    email: z.string().email('Formato de correo electrónico inválido'),
    departamentoId: z.string(),
    ciudad: z.string(),
    descripcion: z.string().min(10, 'La descripción debe tener mínimo 10 caracteres'),
    logo: z.string().url().optional().nullable(),
    web: z.string().url().optional().nullable(),
    redesSociales: z.any().optional(),
    tipo: z.enum(['EMPRESA_PRIVADA', 'ORGANIZACION_SOCIAL', 'ONG', 'FUNDACION', 'INSTITUCION_PUBLICA', 'COLECTIVO_CIUDADANO']),
    sector: z.enum(['Salud', 'Alimentación', 'Refugio', 'Logística', 'Otros']),
  })
});

// GET ALL ORGANIZATIONS (Public with filters)
router.get('/', async (req, res, next) => {
  const { departamentoId, sector, tipo, verificado, query } = req.query;

  try {
    const filters: any = { deletedAt: null };

    if (departamentoId) filters.departamentoId = String(departamentoId);
    if (sector) filters.sector = String(sector);
    if (tipo) filters.tipo = String(tipo);
    if (verificado) filters.verificado = verificado === 'true';

    if (query) {
      filters.OR = [
        { nombre: { contains: String(query), mode: 'insensitive' } },
        { descripcion: { contains: String(query), mode: 'insensitive' } },
        { ciudad: { contains: String(query), mode: 'insensitive' } },
      ];
    }

    const organizations = await prisma.organizacion.findMany({
      where: filters,
      include: { departamento: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(organizations);
  } catch (error) {
    next(error);
  }
});

// GET ONE ORGANIZATION BY ID
router.get('/:id', async (req, res, next) => {
  try {
    const org = await prisma.organizacion.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        departamento: true,
        pronunciamientos: {
          where: { estado: 'VERIFICADO', deletedAt: null },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!org) {
      return res.status(404).json({ error: 'Organización no encontrada.' });
    }

    res.json(org);
  } catch (error) {
    next(error);
  }
});

// CREATE AN ORGANIZATION (Public registry)
router.post('/', validateRequest(organizacionSchema), async (req, res, next) => {
  try {
    const org = await prisma.organizacion.create({
      data: {
        ...req.body,
        verificado: false // All new public registrations are unverified by default
      }
    });

    await logActivity({
      accion: 'REGISTRO_ORGANIZACION_PUBLICA',
      tabla: 'organizaciones',
      registroId: org.id,
      detalles: { nombre: org.nombre, tipo: org.tipo, sector: org.sector },
      req
    });

    res.status(201).json(org);
  } catch (error) {
    next(error);
  }
});

// UPDATE AN ORGANIZATION
router.put('/:id', authenticateJWT, validateRequest(organizacionSchema), async (req, res, next) => {
  try {
    const existing = await prisma.organizacion.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Organización no encontrada.' });
    }

    const org = await prisma.organizacion.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ACTUALIZACION_ORGANIZACION',
      tabla: 'organizaciones',
      registroId: org.id,
      detalles: { nombre: org.nombre, tipo: org.tipo },
      req
    });

    res.json(org);
  } catch (error) {
    next(error);
  }
});

// APPROVE/VERIFY OR REJECT AN ORGANIZATION (Super Admin or Moderator)
router.patch('/:id/verificar', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  const { verificado } = req.body;

  if (typeof verificado !== 'boolean') {
    return res.status(400).json({ error: 'El campo "verificado" debe ser un booleano.' });
  }

  try {
    const existing = await prisma.organizacion.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Organización no encontrada.' });
    }

    const org = await prisma.organizacion.update({
      where: { id: req.params.id },
      data: { verificado }
    });

    // Write verification history
    await prisma.verificacion.create({
      data: {
        usuarioId: req.user!.id,
        organizacionId: org.id,
        observacion: verificado ? 'Organización verificada e incorporada al directorio institucional.' : 'Organización desmarcada como verificada.',
        estadoAnterior: String(existing.verificado),
        estadoNuevo: String(verificado)
      }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: verificado ? 'APROBACION_ORGANIZACION' : 'DESAPROBACION_ORGANIZACION',
      tabla: 'organizaciones',
      registroId: org.id,
      detalles: { nombre: org.nombre, verificado },
      req
    });

    res.json(org);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE ORGANIZATION
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const existing = await prisma.organizacion.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Organización no encontrada o ya eliminada.' });
    }

    await prisma.organizacion.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ELIMINACION_ORGANIZACION',
      tabla: 'organizaciones',
      registroId: req.params.id,
      detalles: { nombre: existing.nombre },
      req
    });

    res.json({ message: 'Organización eliminada exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
