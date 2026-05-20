"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
const validate_1 = require("../middlewares/validate");
const auth_1 = require("../middlewares/auth");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const reporteSchema = zod_1.z.object({
    body: zod_1.z.object({
        titulo: zod_1.z.string().min(5, 'El título del reporte es muy corto'),
        descripcion: zod_1.z.string().min(10, 'La descripción detallada es requerida'),
        fuenteSocial: zod_1.z.string().url().optional().nullable(),
        departamentoId: zod_1.z.string(),
    })
});
const verificarReporteSchema = zod_1.z.object({
    body: zod_1.z.object({
        estado: zod_1.z.enum(['VERIFICADO', 'EN_REVISION', 'INFORMACION_FALSA']),
        observacion: zod_1.z.string().min(5, 'Se requiere una justificación/observación técnica'),
    })
});
// GET ALL CITIZEN REPORTS (Public)
router.get('/', async (req, res, next) => {
    const { departamentoId, estado, search } = req.query;
    try {
        const filters = { deletedAt: null };
        if (departamentoId)
            filters.departamentoId = String(departamentoId);
        if (estado)
            filters.estado = String(estado);
        if (search) {
            filters.OR = [
                { titulo: { contains: String(search), mode: 'insensitive' } },
                { descripcion: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        const reports = await db_1.default.reporte.findMany({
            where: filters,
            include: { departamento: true, multimedia: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    }
    catch (error) {
        next(error);
    }
});
// CITIZEN SUBMIT REPORT (Public)
router.post('/', (0, validate_1.validateRequest)(reporteSchema), async (req, res, next) => {
    const { titulo, descripcion, fuenteSocial, departamentoId } = req.body;
    try {
        const report = await db_1.default.reporte.create({
            data: {
                titulo,
                descripcion,
                fuenteSocial,
                departamentoId,
                estado: 'EN_REVISION' // Always default to revision until audited
            }
        });
        await (0, logger_1.logActivity)({
            accion: 'REGISTRO_REPORTE_CIUDADANO',
            tabla: 'reportes',
            registroId: report.id,
            detalles: { titulo: report.titulo, departamentoId: report.departamentoId },
            req
        });
        res.status(201).json(report);
    }
    catch (error) {
        next(error);
    }
});
// MODERATE/VERIFY CITIZEN REPORT (Authenticated Officers)
router.put('/:id/verificar', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER']), (0, validate_1.validateRequest)(verificarReporteSchema), async (req, res, next) => {
    const { estado, observacion } = req.body;
    try {
        const existing = await db_1.default.reporte.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Reporte ciudadano no encontrado.' });
        }
        const updated = await db_1.default.reporte.update({
            where: { id: req.params.id },
            data: { estado }
        });
        // Create verification log
        await db_1.default.verificacion.create({
            data: {
                usuarioId: req.user.id,
                reporteId: updated.id,
                observacion,
                estadoAnterior: existing.estado,
                estadoNuevo: updated.estado
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'MODERACION_REPORTE_CIUDADANO',
            tabla: 'reportes',
            registroId: updated.id,
            detalles: { estadoAnterior: existing.estado, estadoNuevo: updated.estado, observacion },
            req
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// SOFT DELETE CITIZEN REPORT
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const existing = await db_1.default.reporte.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Reporte no encontrado o ya eliminado.' });
        }
        await db_1.default.reporte.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'ELIMINACION_REPORTE_CIUDADANO',
            tabla: 'reportes',
            registroId: req.params.id,
            detalles: { titulo: existing.titulo },
            req
        });
        res.json({ message: 'Reporte ciudadano eliminado exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
