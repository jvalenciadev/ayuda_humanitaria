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
const pronunciamientoSchema = zod_1.z.object({
    body: zod_1.z.object({
        titulo: zod_1.z.string().min(5, 'Título muy corto'),
        contenido: zod_1.z.string().min(10, 'Contenido del pronunciamiento es requerido'),
        organizacionId: zod_1.z.string(),
        evidencia: zod_1.z.string().url().optional().nullable(),
    })
});
const moderacionSchema = zod_1.z.object({
    body: zod_1.z.object({
        estado: zod_1.z.enum(['PENDIENTE', 'VERIFICADO', 'RECHAZADO']),
        observacion: zod_1.z.string().min(5, 'Debe adjuntar una justificación institucional'),
    })
});
// GET VERIFIED STATEMENTS (Public feed)
router.get('/', async (req, res, next) => {
    try {
        const list = await db_1.default.pronunciamiento.findMany({
            where: { estado: 'VERIFICADO', deletedAt: null },
            include: {
                organizacion: { select: { nombre: true, logo: true, ciudad: true, tipo: true } },
                autor: { select: { nombre: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(list);
    }
    catch (error) {
        next(error);
    }
});
// GET ALL STATEMENTS (Dashboard moderation queue)
router.get('/all', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const list = await db_1.default.pronunciamiento.findMany({
            where: { deletedAt: null },
            include: {
                organizacion: { select: { nombre: true, logo: true } },
                autor: { select: { nombre: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(list);
    }
    catch (error) {
        next(error);
    }
});
// POST STATEMENT FROM ORGANIZATION (Authenticated)
router.post('/', auth_1.authenticateJWT, (0, validate_1.validateRequest)(pronunciamientoSchema), async (req, res, next) => {
    try {
        const post = await db_1.default.pronunciamiento.create({
            data: {
                ...req.body,
                autorId: req.user.id,
                estado: 'PENDIENTE' // All statements from organizations start as pending moderation
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'REGISTRO_PRONUNCIAMIENTO_ORGANIZACION',
            tabla: 'pronunciamientos',
            registroId: post.id,
            detalles: { titulo: post.titulo, organizacionId: post.organizacionId },
            req
        });
        res.status(201).json(post);
    }
    catch (error) {
        next(error);
    }
});
// MODERATE/AUDIT PRONUNCIAMIENTO (Admins or Moderators)
router.put('/:id/moderacion', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), (0, validate_1.validateRequest)(moderacionSchema), async (req, res, next) => {
    const { estado, observacion } = req.body;
    try {
        const existing = await db_1.default.pronunciamiento.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Pronunciamiento no encontrado.' });
        }
        const updated = await db_1.default.pronunciamiento.update({
            where: { id: req.params.id },
            data: { estado }
        });
        // Save validation log
        await db_1.default.verificacion.create({
            data: {
                usuarioId: req.user.id,
                pronunciamientoId: updated.id,
                observacion,
                estadoAnterior: existing.estado,
                estadoNuevo: updated.estado
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'MODERACION_PRONUNCIAMIENTO',
            tabla: 'pronunciamientos',
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
// SOFT DELETE STATEMENT
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const existing = await db_1.default.pronunciamiento.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Pronunciamiento no encontrado o ya eliminado.' });
        }
        await db_1.default.pronunciamiento.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'ELIMINACION_PRONUNCIAMIENTO',
            tabla: 'pronunciamientos',
            registroId: req.params.id,
            detalles: { titulo: existing.titulo },
            req
        });
        res.json({ message: 'Pronunciamiento eliminado exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
