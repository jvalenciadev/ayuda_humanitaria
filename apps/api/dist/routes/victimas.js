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
const victimaSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z.string().min(3, 'Nombre completo es requerido'),
        documentoIdentidad: zod_1.z.string().optional().nullable(),
        edad: zod_1.z.number().int().positive().max(120).optional().nullable(),
        genero: zod_1.z.enum(['MASCULINO', 'FEMENINO', 'OTRO']).optional().nullable(),
        afectacionTipo: zod_1.z.enum(['LESIONADO', 'DESAPARECIDO', 'FALLECIDO', 'DAMNIFICADO']),
        detalles: zod_1.z.string().min(5, 'Detalles de la afectación son requeridos'),
        contactoFamiliar: zod_1.z.string().optional().nullable(),
        departamentoId: zod_1.z.string(),
        localidad: zod_1.z.string().min(3, 'Localidad o barrio es requerido'),
    })
});
// SENSITIVE: RESTRICTED TO ADMINS, MODERATORS, AND VERIFIERS
router.get('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER']), async (req, res, next) => {
    const { departamentoId, afectacion, search } = req.query;
    try {
        const filters = { deletedAt: null };
        if (departamentoId)
            filters.departamentoId = String(departamentoId);
        if (afectacion)
            filters.afectacionTipo = String(afectacion);
        if (search) {
            filters.OR = [
                { nombre: { contains: String(search), mode: 'insensitive' } },
                { documentoIdentidad: { contains: String(search), mode: 'insensitive' } },
                { detalles: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        const victimas = await db_1.default.victima.findMany({
            where: filters,
            include: { departamento: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(victimas);
    }
    catch (error) {
        next(error);
    }
});
// GET SENSITIVE VICTIM PROFILE BY ID
router.get('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const victima = await db_1.default.victima.findFirst({
            where: { id: req.params.id, deletedAt: null },
            include: { departamento: true }
        });
        if (!victima) {
            return res.status(404).json({ error: 'Registro de víctima no encontrado.' });
        }
        res.json(victima);
    }
    catch (error) {
        next(error);
    }
});
// CREATE NEW VICTIM PROFILE
router.post('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER']), (0, validate_1.validateRequest)(victimaSchema), async (req, res, next) => {
    try {
        const victima = await db_1.default.victima.create({
            data: req.body
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'REGISTRO_VICTIMA',
            tabla: 'victimas',
            registroId: victima.id,
            detalles: { nombre: victima.nombre, afectacion: victima.afectacionTipo, departamentoId: victima.departamentoId },
            req
        });
        res.status(201).json(victima);
    }
    catch (error) {
        next(error);
    }
});
// UPDATE SENSITIVE PROFILE
router.put('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), (0, validate_1.validateRequest)(victimaSchema), async (req, res, next) => {
    try {
        const existing = await db_1.default.victima.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Registro de víctima no encontrado.' });
        }
        const updated = await db_1.default.victima.update({
            where: { id: req.params.id },
            data: req.body
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'ACTUALIZACION_VICTIMA',
            tabla: 'victimas',
            registroId: updated.id,
            detalles: { nombre: updated.nombre, afectacion: updated.afectacionTipo },
            req
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// SOFT DELETE SENSITIVE PROFILE
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN']), async (req, res, next) => {
    try {
        const existing = await db_1.default.victima.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Registro de víctima no encontrado o ya eliminado.' });
        }
        await db_1.default.victima.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'ELIMINACION_VICTIMA',
            tabla: 'victimas',
            registroId: req.params.id,
            detalles: { nombre: existing.nombre },
            req
        });
        res.json({ message: 'Registro de víctima eliminado exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
