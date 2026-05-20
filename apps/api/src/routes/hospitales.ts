import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const hospitalSchema = z.object({
  body: z.object({
    nombre: z.string().min(5, 'El nombre del establecimiento es requerido'),
    departamentoId: z.string(),
    oxigenoDisponibilidad: z.enum(['SUFICIENTE', 'LIMITADO', 'CRITICO', 'AGOTADO']),
    camasLibres: z.number().nonnegative('El número de camas no puede ser negativo'),
    estadoGeneral: z.enum(['ESTABLE', 'ALERTA', 'EMERGENCIA']),
    responsableNombre: z.string().min(3, 'Nombre del responsable del reporte es requerido'),
    responsableContacto: z.string().min(5, 'Contacto del responsable es requerido'),
    evidenciaUrl: z.string().url().optional().nullable(),
  })
});

// GET ALL HOSPITALS STATUS (Public dashboard)
router.get('/', async (req, res, next) => {
  const { departamentoId, oxigeno, estado } = req.query;

  try {
    const filters: any = { deletedAt: null };

    if (departamentoId) filters.departamentoId = String(departamentoId);
    if (oxigeno) filters.oxigenoDisponibilidad = String(oxigeno);
    if (estado) filters.estadoGeneral = String(estado);

    const hospitals = await prisma.hospital.findMany({
      where: filters,
      include: { departamento: true, reportadoPor: { select: { nombre: true, email: true } } },
      orderBy: { fechaReporte: 'desc' }
    });

    res.json(hospitals);
  } catch (error) {
    next(error);
  }
});

// POST REAL-TIME HOSPITAL STATUS REPORT (Authenticated Officials)
router.post('/', authenticateJWT, validateRequest(hospitalSchema), async (req, res, next) => {
  try {
    const report = await prisma.hospital.create({
      data: {
        ...req.body,
        reportadoPorId: req.user!.id,
        fechaReporte: new Date()
      }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'REGISTRO_REPORTE_HOSPITALARIO',
      tabla: 'hospitales',
      registroId: report.id,
      detalles: { nombre: report.nombre, oxigeno: report.oxigenoDisponibilidad, estado: report.estadoGeneral },
      req
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

// UPDATE HOSPITAL RECORD (Authenticated)
router.put('/:id', authenticateJWT, validateRequest(hospitalSchema), async (req, res, next) => {
  try {
    const existing = await prisma.hospital.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Establecimiento hospitalario no encontrado.' });
    }

    const updated = await prisma.hospital.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ACTUALIZACION_REPORTE_HOSPITALARIO',
      tabla: 'hospitales',
      registroId: updated.id,
      detalles: {
        nombre: updated.nombre,
        oxigenoAnterior: existing.oxigenoDisponibilidad,
        oxigenoNuevo: updated.oxigenoDisponibilidad
      },
      req
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE HOSPITAL STATUS REPORT
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const existing = await prisma.hospital.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reporte hospitalario no encontrado o ya eliminado.' });
    }

    await prisma.hospital.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ELIMINACION_REPORTE_HOSPITALARIO',
      tabla: 'hospitales',
      registroId: req.params.id,
      detalles: { nombre: existing.nombre },
      req
    });

    res.json({ message: 'Reporte hospitalario eliminado exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
