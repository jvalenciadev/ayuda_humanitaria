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
const ayudaSchema = zod_1.z.object({
    body: zod_1.z.object({
        tipologia: zod_1.z.enum(['MEDICAMENTOS', 'OXIGENO', 'ALIMENTOS', 'TRANSPORTE', 'REFUGIO', 'DONACIONES', 'RESCATE_ANIMAL', 'APOYO_PSICOLOGICO']),
        descripcion: zod_1.z.string().min(5, 'La descripción es muy corta'),
        urgencia: zod_1.z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']),
        solicitante: zod_1.z.string().min(3, 'Nombre de solicitante es requerido'),
        contacto: zod_1.z.string().min(5, 'Contacto de referencia es requerido'),
        departamentoId: zod_1.z.string(),
        direccion: zod_1.z.string().min(5, 'Dirección exacta es requerida'),
        latitud: zod_1.z.number().optional().nullable(),
        longitud: zod_1.z.number().optional().nullable(),
    })
});
const updateAyudaSchema = zod_1.z.object({
    body: zod_1.z.object({
        estado: zod_1.z.enum(['PENDIENTE', 'EN_PROCESO', 'ATENDIDO', 'RECHAZADO']),
        seguimiento: zod_1.z.string().optional().nullable(),
        urgencia: zod_1.z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
    })
});
// GET ALL HELP REQUESTS (Public, supports filters & geolocation checks)
router.get('/', async (req, res, next) => {
    const { tipologia, urgencia, departamentoId, estado, search } = req.query;
    try {
        const filters = { deletedAt: null };
        if (tipologia)
            filters.tipologia = String(tipologia);
        if (urgencia)
            filters.urgencia = String(urgencia);
        if (departamentoId)
            filters.departamentoId = String(departamentoId);
        if (estado)
            filters.estado = String(estado);
        if (search) {
            filters.OR = [
                { descripcion: { contains: String(search), mode: 'insensitive' } },
                { solicitante: { contains: String(search), mode: 'insensitive' } },
                { direccion: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        const ayudas = await db_1.default.ayudaHumanitaria.findMany({
            where: filters,
            include: { departamento: true, evidencias: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ayudas);
    }
    catch (error) {
        next(error);
    }
});
// GET SINGLE HELP REQUEST BY ID
router.get('/:id', async (req, res, next) => {
    try {
        const ayuda = await db_1.default.ayudaHumanitaria.findFirst({
            where: { id: req.params.id, deletedAt: null },
            include: { departamento: true, evidencias: true }
        });
        if (!ayuda) {
            return res.status(404).json({ error: 'Solicitud de ayuda no encontrada.' });
        }
        res.json(ayuda);
    }
    catch (error) {
        next(error);
    }
});
// SUBMIT NEW HELP REQUEST (Public or Private)
router.post('/', (0, validate_1.validateRequest)(ayudaSchema), async (req, res, next) => {
    try {
        const ayuda = await db_1.default.ayudaHumanitaria.create({
            data: {
                ...req.body,
                estado: 'PENDIENTE'
            }
        });
        await (0, logger_1.logActivity)({
            accion: 'CREACION_SOLICITUD_AYUDA',
            tabla: 'ayudas_humanitarias',
            registroId: ayuda.id,
            detalles: { tipologia: ayuda.tipologia, urgencia: ayuda.urgencia, solicitante: ayuda.solicitante },
            req
        });
        res.status(201).json(ayuda);
    }
    catch (error) {
        next(error);
    }
});
// UPDATE HELP STATUS AND SEGUIMIENTO (Authenticated Officers)
router.put('/:id', auth_1.authenticateJWT, (0, validate_1.validateRequest)(updateAyudaSchema), async (req, res, next) => {
    try {
        const existing = await db_1.default.ayudaHumanitaria.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Solicitud de ayuda no encontrada.' });
        }
        const updated = await db_1.default.ayudaHumanitaria.update({
            where: { id: req.params.id },
            data: req.body
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'ACTUALIZACION_SOLICITUD_AYUDA',
            tabla: 'ayudas_humanitarias',
            registroId: updated.id,
            detalles: { estadoAnterior: existing.estado, estadoNuevo: updated.estado, urgencia: updated.urgencia },
            req
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// SOFT DELETE HELP REQUEST
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    try {
        const existing = await db_1.default.ayudaHumanitaria.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Solicitud de ayuda no encontrada o ya eliminada.' });
        }
        await db_1.default.ayudaHumanitaria.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'ELIMINACION_SOLICITUD_AYUDA',
            tabla: 'ayudas_humanitarias',
            registroId: req.params.id,
            detalles: { solicitante: existing.solicitante },
            req
        });
        res.json({ message: 'Solicitud de ayuda eliminada exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
