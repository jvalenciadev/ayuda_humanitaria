import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const ayudaSchema = z.object({
  body: z.object({
    tipologia: z.enum(['MEDICAMENTOS', 'OXIGENO', 'ALIMENTOS', 'TRANSPORTE', 'REFUGIO', 'DONACIONES', 'RESCATE_ANIMAL', 'APOYO_PSICOLOGICO']),
    descripcion: z.string().min(5, 'La descripción es muy corta'),
    urgencia: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']),
    solicitante: z.string().min(3, 'Nombre de solicitante es requerido'),
    contacto: z.string().min(5, 'Contacto de referencia es requerido'),
    departamentoId: z.string(),
    direccion: z.string().min(5, 'Dirección exacta es requerida'),
    latitud: z.number().optional().nullable(),
    longitud: z.number().optional().nullable(),
  })
});

const updateAyudaSchema = z.object({
  body: z.object({
    estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'ATENDIDO', 'RECHAZADO']),
    seguimiento: z.string().optional().nullable(),
    urgencia: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
  })
});

// GET ALL HELP REQUESTS (Public, supports filters & geolocation checks)
router.get('/', async (req, res, next) => {
  const { tipologia, urgencia, departamentoId, estado, search } = req.query;

  try {
    const filters: any = { deletedAt: null };

    if (tipologia) filters.tipologia = String(tipologia);
    if (urgencia) filters.urgencia = String(urgencia);
    if (departamentoId) filters.departamentoId = String(departamentoId);
    if (estado) filters.estado = String(estado);

    if (search) {
      filters.OR = [
        { descripcion: { contains: String(search), mode: 'insensitive' } },
        { solicitante: { contains: String(search), mode: 'insensitive' } },
        { direccion: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const ayudas = await prisma.ayudaHumanitaria.findMany({
      where: filters,
      include: { departamento: true, evidencias: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ayudas);
  } catch (error) {
    next(error);
  }
});

// GET SINGLE HELP REQUEST BY ID
router.get('/:id', async (req, res, next) => {
  try {
    const ayuda = await prisma.ayudaHumanitaria.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { departamento: true, evidencias: true }
    });

    if (!ayuda) {
      return res.status(404).json({ error: 'Solicitud de ayuda no encontrada.' });
    }

    res.json(ayuda);
  } catch (error) {
    next(error);
  }
});

// SUBMIT NEW HELP REQUEST (Public or Private)
router.post('/', validateRequest(ayudaSchema), async (req, res, next) => {
  try {
    const ayuda = await prisma.ayudaHumanitaria.create({
      data: {
        ...req.body,
        estado: 'PENDIENTE'
      }
    });

    await logActivity({
      accion: 'CREACION_SOLICITUD_AYUDA',
      tabla: 'ayudas_humanitarias',
      registroId: ayuda.id,
      detalles: { tipologia: ayuda.tipologia, urgencia: ayuda.urgencia, solicitante: ayuda.solicitante },
      req
    });

    res.status(201).json(ayuda);
  } catch (error) {
    next(error);
  }
});

// UPDATE HELP STATUS AND SEGUIMIENTO (Authenticated Officers)
router.put('/:id', authenticateJWT, validateRequest(updateAyudaSchema), async (req, res, next) => {
  try {
    const existing = await prisma.ayudaHumanitaria.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Solicitud de ayuda no encontrada.' });
    }

    const updated = await prisma.ayudaHumanitaria.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ACTUALIZACION_SOLICITUD_AYUDA',
      tabla: 'ayudas_humanitarias',
      registroId: updated.id,
      detalles: { estadoAnterior: existing.estado, estadoNuevo: updated.estado, urgencia: updated.urgencia },
      req
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE HELP REQUEST
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const existing = await prisma.ayudaHumanitaria.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Solicitud de ayuda no encontrada o ya eliminada.' });
    }

    await prisma.ayudaHumanitaria.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ELIMINACION_SOLICITUD_AYUDA',
      tabla: 'ayudas_humanitarias',
      registroId: req.params.id,
      detalles: { solicitante: existing.solicitante },
      req
    });

    res.json({ message: 'Solicitud de ayuda eliminada exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
