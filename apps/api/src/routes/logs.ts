import { Router } from 'express';
import prisma from '../config/db';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// GET SYSTEM AUDIT LOGS (Super Admin only)
router.get('/', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req, res, next) => {
  const { accion, tabla, usuarioId, limit, offset } = req.query;

  try {
    const filters: any = {};

    if (accion) filters.accion = String(accion);
    if (tabla) filters.tabla = String(tabla);
    if (usuarioId) filters.usuarioId = String(usuarioId);

    const take = limit ? parseInt(String(limit), 10) : 100;
    const skip = offset ? parseInt(String(offset), 10) : 0;

    const [logs, total] = await prisma.$transaction([
      prisma.log.findMany({
        where: filters,
        include: { usuario: { select: { nombre: true, email: true, rolId: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      prisma.log.count({ where: filters })
    ]);

    res.json({
      logs,
      pagination: {
        total,
        limit: take,
        offset: skip
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
