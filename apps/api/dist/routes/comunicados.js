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
const comunicadoSchema = zod_1.z.object({
    body: zod_1.z.object({
        titulo: zod_1.z.string().min(5, 'Título de comunicado muy corto'),
        contenido: zod_1.z.string().min(10, 'Contenido de comunicado requerido'),
        fuente: zod_1.z.string().min(3, 'Fuente oficial del comunicado es requerida'),
        documentoUrl: zod_1.z.string().url().optional().nullable(),
    })
});
// GET OFFICIAL bulletins (Public news center)
router.get('/', async (req, res, next) => {
    try {
        const list = await db_1.default.comunicado.findMany({
            where: { estado: 'VERIFICADO', deletedAt: null },
            include: { autor: { select: { nombre: true, email: true } } },
            orderBy: { fechaHora: 'desc' }
        });
        res.json(list);
    }
    catch (error) {
        next(error);
    }
});
// GET ALL bulletins INCLUDING MODERATION STATUS (Dashboard)
router.get('/all', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const list = await db_1.default.comunicado.findMany({
            where: { deletedAt: null },
            include: { autor: { select: { nombre: true, email: true } } },
            orderBy: { fechaHora: 'desc' }
        });
        res.json(list);
    }
    catch (error) {
        next(error);
    }
});
// POST OFFICIAL BULLETINS (Authenticated Admins/Mods)
router.post('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), (0, validate_1.validateRequest)(comunicadoSchema), async (req, res, next) => {
    try {
        const pub = await db_1.default.comunicado.create({
            data: {
                ...req.body,
                autorId: req.user.id,
                estado: 'VERIFICADO'
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'PUBLICACION_COMUNICADO_OFICIAL',
            tabla: 'comunicados',
            registroId: pub.id,
            detalles: { titulo: pub.titulo, fuente: pub.fuente },
            req
        });
        res.status(201).json(pub);
    }
    catch (error) {
        next(error);
    }
});
// EDIT COMMUNIQUE (Authenticated Admins/Mods)
router.put('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), (0, validate_1.validateRequest)(comunicadoSchema), async (req, res, next) => {
    try {
        const existing = await db_1.default.comunicado.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Comunicado no encontrado.' });
        }
        const updated = await db_1.default.comunicado.update({
            where: { id: req.params.id },
            data: req.body
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'EDICION_COMUNICADO_OFICIAL',
            tabla: 'comunicados',
            registroId: updated.id,
            detalles: { titulo: updated.titulo },
            req
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// SOFT DELETE COMMUNIQUE
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const existing = await db_1.default.comunicado.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Comunicado no encontrado o ya eliminado.' });
        }
        await db_1.default.comunicado.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user.id,
            accion: 'ELIMINACION_COMUNICADO_OFICIAL',
            tabla: 'comunicados',
            registroId: req.params.id,
            detalles: { titulo: existing.titulo },
            req
        });
        res.json({ message: 'Comunicado eliminado exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
