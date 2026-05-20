import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const victimaSchema = z.object({
  body: z.object({
    nombre: z.string().min(3, 'Nombre completo es requerido'),
    documentoIdentidad: z.string().optional().nullable(),
    edad: z.number().int().positive().max(120).optional().nullable(),
    genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']).optional().nullable(),
    afectacionTipo: z.enum(['LESIONADO', 'DESAPARECIDO', 'FALLECIDO', 'DAMNIFICADO']),
    detalles: z.string().min(5, 'Detalles de la afectación son requeridos'),
    contactoFamiliar: z.string().optional().nullable(),
    departamentoId: z.string(),
    localidad: z.string().min(3, 'Localidad o barrio es requerido'),
  })
});

// SENSITIVE: RESTRICTED TO ADMINS, MODERATORS, AND VERIFIERS
router.get('/', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER']), async (req, res, next) => {
  const { departamentoId, afectacion, search } = req.query;

  try {
    const filters: any = { deletedAt: null };

    if (departamentoId) filters.departamentoId = String(departamentoId);
    if (afectacion) filters.afectacionTipo = String(afectacion);

    if (search) {
      filters.OR = [
        { nombre: { contains: String(search), mode: 'insensitive' } },
        { documentoIdentidad: { contains: String(search), mode: 'insensitive' } },
        { detalles: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const victimas = await prisma.victima.findMany({
      where: filters,
      include: { departamento: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(victimas);
  } catch (error) {
    next(error);
  }
});

// GET SENSITIVE VICTIM PROFILE BY ID
router.get('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const victima = await prisma.victima.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { departamento: true }
    });

    if (!victima) {
      return res.status(404).json({ error: 'Registro de víctima no encontrado.' });
    }

    res.json(victima);
  } catch (error) {
    next(error);
  }
});

// CREATE NEW VICTIM PROFILE
router.post('/', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER']), validateRequest(victimaSchema), async (req, res, next) => {
  try {
    const victima = await prisma.victima.create({
      data: req.body
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'REGISTRO_VICTIMA',
      tabla: 'victimas',
      registroId: victima.id,
      detalles: { nombre: victima.nombre, afectacion: victima.afectacionTipo, departamentoId: victima.departamentoId },
      req
    });

    res.status(201).json(victima);
  } catch (error) {
    next(error);
  }
});

// UPDATE SENSITIVE PROFILE
router.put('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), validateRequest(victimaSchema), async (req, res, next) => {
  try {
    const existing = await prisma.victima.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Registro de víctima no encontrado.' });
    }

    const updated = await prisma.victima.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'ACTUALIZACION_VICTIMA',
      tabla: 'victimas',
      registroId: updated.id,
      detalles: { nombre: updated.nombre, afectacion: updated.afectacionTipo },
      req
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE SENSITIVE PROFILE
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const existing = await prisma.victima.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Registro de víctima no encontrado o ya eliminado.' });
    }

    await prisma.victima.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'ELIMINACION_VICTIMA',
      tabla: 'victimas',
      registroId: req.params.id,
      detalles: { nombre: existing.nombre },
      req
    });

    res.json({ message: 'Registro de víctima eliminado exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
