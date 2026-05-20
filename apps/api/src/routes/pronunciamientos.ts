import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const pronunciamientoSchema = z.object({
  body: z.object({
    titulo: z.string().min(5, 'Título muy corto'),
    contenido: z.string().min(10, 'Contenido del pronunciamiento es requerido'),
    organizacionId: z.string(),
    evidencia: z.string().url().optional().nullable(),
  })
});

const moderacionSchema = z.object({
  body: z.object({
    estado: z.enum(['PENDIENTE', 'VERIFICADO', 'RECHAZADO']),
    observacion: z.string().min(5, 'Debe adjuntar una justificación institucional'),
  })
});

// GET VERIFIED STATEMENTS (Public feed)
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.pronunciamiento.findMany({
      where: { estado: 'VERIFICADO', deletedAt: null },
      include: {
        organizacion: { select: { nombre: true, logo: true, ciudad: true, tipo: true } },
        autor: { select: { nombre: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// GET ALL STATEMENTS (Dashboard moderation queue)
router.get('/all', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const list = await prisma.pronunciamiento.findMany({
      where: { deletedAt: null },
      include: {
        organizacion: { select: { nombre: true, logo: true } },
        autor: { select: { nombre: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// POST STATEMENT FROM ORGANIZATION (Authenticated)
router.post('/', authenticateJWT, validateRequest(pronunciamientoSchema), async (req, res, next) => {
  try {
    const post = await prisma.pronunciamiento.create({
      data: {
        ...req.body,
        autorId: req.user!.id,
        estado: 'PENDIENTE' // All statements from organizations start as pending moderation
      }
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'REGISTRO_PRONUNCIAMIENTO_ORGANIZACION',
      tabla: 'pronunciamientos',
      registroId: post.id,
      detalles: { titulo: post.titulo, organizacionId: post.organizacionId },
      req
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// MODERATE/AUDIT PRONUNCIAMIENTO (Admins or Moderators)
router.put('/:id/moderacion', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), validateRequest(moderacionSchema), async (req, res, next) => {
  const { estado, observacion } = req.body;

  try {
    const existing = await prisma.pronunciamiento.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Pronunciamiento no encontrado.' });
    }

    const updated = await prisma.pronunciamiento.update({
      where: { id: req.params.id },
      data: { estado }
    });

    // Save validation log
    await prisma.verificacion.create({
      data: {
        usuarioId: req.user!.id,
        pronunciamientoId: updated.id,
        observacion,
        estadoAnterior: existing.estado,
        estadoNuevo: updated.estado
      }
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'MODERACION_PRONUNCIAMIENTO',
      tabla: 'pronunciamientos',
      registroId: updated.id,
      detalles: { estadoAnterior: existing.estado, estadoNuevo: updated.estado, observacion },
      req
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE STATEMENT
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const existing = await prisma.pronunciamiento.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Pronunciamiento no encontrado o ya eliminado.' });
    }

    await prisma.pronunciamiento.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'ELIMINACION_PRONUNCIAMIENTO',
      tabla: 'pronunciamientos',
      registroId: req.params.id,
      detalles: { titulo: existing.titulo },
      req
    });

    res.json({ message: 'Pronunciamiento eliminado exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
