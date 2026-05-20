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
const hospitalSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z.string().min(5, 'El nombre del establecimiento es requerido'),
        departamentoId: zod_1.z.string(),
        oxigenoDisponibilidad: zod_1.z.enum(['SUFICIENTE', 'LIMITADO', 'CRITICO', 'AGOTADO']),
        camasLibres: zod_1.z.number().nonnegative('El número de camas no puede ser negativo'),
        estadoGeneral: zod_1.z.enum(['ESTABLE', 'ALERTA', 'EMERGENCIA']),
        responsableNombre: zod_1.z.string().min(3, 'Nombre del responsable del reporte es requerido'),
        responsableContacto: zod_1.z.string().min(5, 'Contacto del responsable es requerido'),
        evidenciaUrl: zod_1.z.string().url().optional().nullable(),
    })
});
// GET ALL HOSPITALS STATUS (Public dashboard)
router.get('/', async (req, res, next) => {
    const { departamentoId, oxigeno, estado } = req.query;
    try {
        const filters = { deletedAt: null };
        if (departamentoId)
            filters.departamentoId = String(departamentoId);
        if (oxigeno)
            filters.oxigenoDisponibilidad = String(oxigeno);
        if (estado)
            filters.estadoGeneral = String(estado);
        const hospitals = await db_1.default.hospital.findMany({
            where: filters,
            include: { departamento: true, reportadoPor: { select: { nombre: true, email: true } } },
            orderBy: { fechaReporte: 'desc' }
        });
        res.json(hospitals);
    }
    catch (error) {
        next(error);
    }
});
// POST REAL-TIME HOSPITAL STATUS REPORT (Authenticated Officials)
router.post('/', auth_1.authenticateJWT, (0, validate_1.validateRequest)(hospitalSchema), async (req, res, next) => {
    try {
        const report = await db_1.default.hospital.create({
            data: {
                ...req.body,
                reportadoPorId: req.user.id,
                fechaReporte: new Date()
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'REGISTRO_REPORTE_HOSPITALARIO',
            tabla: 'hospitales',
            registroId: report.id,
            detalles: { nombre: report.nombre, oxigeno: report.oxigenoDisponibilidad, estado: report.estadoGeneral },
            req
        });
        res.status(201).json(report);
    }
    catch (error) {
        next(error);
    }
});
// UPDATE HOSPITAL RECORD (Authenticated)
router.put('/:id', auth_1.authenticateJWT, (0, validate_1.validateRequest)(hospitalSchema), async (req, res, next) => {
    try {
        const existing = await db_1.default.hospital.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Establecimiento hospitalario no encontrado.' });
        }
        const updated = await db_1.default.hospital.update({
            where: { id: req.params.id },
            data: req.body
        });
        await (0, logger_1.logActivity)({
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
    }
    catch (error) {
        next(error);
    }
});
// SOFT DELETE HOSPITAL STATUS REPORT
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const existing = await db_1.default.hospital.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Reporte hospitalario no encontrado o ya eliminado.' });
        }
        await db_1.default.hospital.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'ELIMINACION_REPORTE_HOSPITALARIO',
            tabla: 'hospitales',
            registroId: req.params.id,
            detalles: { nombre: existing.nombre },
            req
        });
        res.json({ message: 'Reporte hospitalario eliminado exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
