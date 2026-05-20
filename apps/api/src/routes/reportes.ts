import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();

const reporteSchema = z.object({
  body: z.object({
    titulo: z.string().min(5, 'El título del reporte es muy corto'),
    descripcion: z.string().min(10, 'La descripción detallada es requerida'),
    fuenteSocial: z.string().url().optional().nullable(),
    departamentoId: z.string(),
  })
});

const verificarReporteSchema = z.object({
  body: z.object({
    estado: z.enum(['VERIFICADO', 'EN_REVISION', 'INFORMACION_FALSA']),
    observacion: z.string().min(5, 'Se requiere una justificación/observación técnica'),
  })
});

// GET ALL CITIZEN REPORTS (Public)
router.get('/', async (req, res, next) => {
  const { departamentoId, estado, search } = req.query;

  try {
    const filters: any = { deletedAt: null };

    if (departamentoId) filters.departamentoId = String(departamentoId);
    if (estado) filters.estado = String(estado);

    if (search) {
      filters.OR = [
        { titulo: { contains: String(search), mode: 'insensitive' } },
        { descripcion: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const reports = await prisma.reporte.findMany({
      where: filters,
      include: { departamento: true, multimedia: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// CITIZEN SUBMIT REPORT (Public)
router.post('/', validateRequest(reporteSchema), async (req, res, next) => {
  const { titulo, descripcion, fuenteSocial, departamentoId } = req.body;

  try {
    const report = await prisma.reporte.create({
      data: {
        titulo,
        descripcion,
        fuenteSocial,
        departamentoId,
        estado: 'EN_REVISION' // Always default to revision until audited
      }
    });

    await logActivity({
      accion: 'REGISTRO_REPORTE_CIUDADANO',
      tabla: 'reportes',
      registroId: report.id,
      detalles: { titulo: report.titulo, departamentoId: report.departamentoId },
      req
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

// MODERATE/VERIFY CITIZEN REPORT (Authenticated Officers)
router.put('/:id/verificar', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER']), validateRequest(verificarReporteSchema), async (req, res, next) => {
  const { estado, observacion } = req.body;

  try {
    const existing = await prisma.reporte.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reporte ciudadano no encontrado.' });
    }

    const updated = await prisma.reporte.update({
      where: { id: req.params.id },
      data: { estado }
    });

    // Create verification log
    await prisma.verificacion.create({
      data: {
        usuarioId: req.user!.id,
        reporteId: updated.id,
        observacion,
        estadoAnterior: existing.estado,
        estadoNuevo: updated.estado
      }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'MODERACION_REPORTE_CIUDADANO',
      tabla: 'reportes',
      registroId: updated.id,
      detalles: { estadoAnterior: existing.estado, estadoNuevo: updated.estado, observacion },
      req
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// SOFT DELETE CITIZEN REPORT
router.delete('/:id', authenticateJWT, requireRole(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
  try {
    const existing = await prisma.reporte.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reporte no encontrado o ya eliminado.' });
    }

    await prisma.reporte.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      usuarioId: req.user?.id,
      accion: 'ELIMINACION_REPORTE_CIUDADANO',
      tabla: 'reportes',
      registroId: req.params.id,
      detalles: { titulo: existing.titulo },
      req
    });

    res.json({ message: 'Reporte ciudadano eliminado exitosamente (Soft Delete).' });
  } catch (error) {
    next(error);
  }
});

export default router;
