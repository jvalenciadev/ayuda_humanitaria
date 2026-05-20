import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const comunicadoSchema = z.object({
  body: z.object({
    titulo: z.string().min(5, 'Título de comunicado muy corto'),
    contenido: z.string().min(10, 'Contenido de comunicado requerido'),
    fuente: z.string().min(3, 'Fuente oficial del comunicado es requerida'),
    documentoUrl: z.string().url().optional().nullable(),
  })
});

// GET OFFICIAL bulletins (Public news center)
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.comunicado.findMany({
      where: { estado: 'VERIFICADO', deletedAt: null },
      include: { autor: { select: { nombre: true, email: true } } },
      orderBy: { fechaHora: 'desc' }
    });
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// GET ALL bulletins INCLUDING MODERATION STATUS (Dashboard)
router.get('/all', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const list = await prisma.comunicado.findMany({
      where: { deletedAt: null },
      include: { autor: { select: { nombre: true, email: true } } },
      orderBy: { fechaHora: 'desc' }
    });
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// POST OFFICIAL BULLETINS (Authenticated Admins/Mods)
router.post('/', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), validateRequest(comunicadoSchema), async (req, res, next) => {
  try {
    const pub = await prisma.comunicado.create({
      data: {
        ...req.body,
        autorId: req.user!.id,
        estado: 'VERIFICADO'
      }
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'PUBLICACION_COMUNICADO_OFICIAL',
      tabla: 'comunicados',
      registroId: pub.id,
      detalles: { titulo: pub.titulo, fuente: pub.fuente },
      req
    });

    res.status(201).json(pub);
  } catch (error) {
    next(error);
  }
});

// EDIT COMMUNIQUE (Authenticated Admins/Mods)
router.put('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), validateRequest(comunicadoSchema), async (req, res, next) => {
  try {
    const existing = await prisma.comunicado.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Comunicado no encontrado.' });
    }

    const updated = await prisma.comunicado.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'EDICION_COMUNICADO_OFICIAL',
      tabla: 'comunicados',
      registroId: updated.id,
      detalles: { titulo: updated.titulo },
      req
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE COMMUNIQUE
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const existing = await prisma.comunicado.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Comunicado no encontrado o ya eliminado.' });
    }

    await prisma.comunicado.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user!.id,
      accion: 'ELIMINACION_COMUNICADO_OFICIAL',
      tabla: 'comunicados',
      registroId: req.params.id,
      detalles: { titulo: existing.titulo },
      req
    });

    res.json({ message: 'Comunicado eliminado exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
