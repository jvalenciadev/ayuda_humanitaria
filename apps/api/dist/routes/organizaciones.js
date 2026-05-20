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
const organizacionSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z.string().min(3, 'El nombre debe tener mínimo 3 caracteres'),
        responsable: zod_1.z.string().min(3, 'El responsable debe tener mínimo 3 caracteres'),
        contacto: zod_1.z.string(),
        email: zod_1.z.string().email('Formato de correo electrónico inválido'),
        departamentoId: zod_1.z.string(),
        ciudad: zod_1.z.string(),
        descripcion: zod_1.z.string().min(10, 'La descripción debe tener mínimo 10 caracteres'),
        logo: zod_1.z.string().url().optional().nullable(),
        web: zod_1.z.string().url().optional().nullable(),
        redesSociales: zod_1.z.any().optional(),
        tipo: zod_1.z.enum(['EMPRESA_PRIVADA', 'ORGANIZACION_SOCIAL', 'ONG', 'FUNDACION', 'INSTITUCION_PUBLICA', 'COLECTIVO_CIUDADANO']),
        sector: zod_1.z.enum(['Salud', 'Alimentación', 'Refugio', 'Logística', 'Otros']),
    })
});
// GET ALL ORGANIZATIONS (Public with filters)
router.get('/', async (req, res, next) => {
    const { departamentoId, sector, tipo, verificado, query } = req.query;
    try {
        const filters = { deletedAt: null };
        if (departamentoId)
            filters.departamentoId = String(departamentoId);
        if (sector)
            filters.sector = String(sector);
        if (tipo)
            filters.tipo = String(tipo);
        if (verificado)
            filters.verificado = verificado === 'true';
        if (query) {
            filters.OR = [
                { nombre: { contains: String(query), mode: 'insensitive' } },
                { descripcion: { contains: String(query), mode: 'insensitive' } },
                { ciudad: { contains: String(query), mode: 'insensitive' } },
            ];
        }
        const organizations = await db_1.default.organizacion.findMany({
            where: filters,
            include: { departamento: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(organizations);
    }
    catch (error) {
        next(error);
    }
});
// GET ONE ORGANIZATION BY ID
router.get('/:id', async (req, res, next) => {
    try {
        const org = await db_1.default.organizacion.findFirst({
            where: { id: req.params.id, deletedAt: null },
            include: {
                departamento: true,
                pronunciamientos: {
                    where: { estado: 'VERIFICADO', deletedAt: null },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!org) {
            return res.status(404).json({ error: 'Organización no encontrada.' });
        }
        res.json(org);
    }
    catch (error) {
        next(error);
    }
});
// CREATE AN ORGANIZATION (Public registry)
router.post('/', (0, validate_1.validateRequest)(organizacionSchema), async (req, res, next) => {
    try {
        const org = await db_1.default.organizacion.create({
            data: {
                ...req.body,
                verificado: false // All new public registrations are unverified by default
            }
        });
        await (0, logger_1.logActivity)({
            accion: 'REGISTRO_ORGANIZACION_PUBLICA',
            tabla: 'organizaciones',
            registroId: org.id,
            detalles: { nombre: org.nombre, tipo: org.tipo, sector: org.sector },
            req
        });
        res.status(201).json(org);
    }
    catch (error) {
        next(error);
    }
});
// UPDATE AN ORGANIZATION
router.put('/:id', auth_1.authenticateJWT, (0, validate_1.validateRequest)(organizacionSchema), async (req, res, next) => {
    try {
        const existing = await db_1.default.organizacion.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Organización no encontrada.' });
        }
        const org = await db_1.default.organizacion.update({
            where: { id: req.params.id },
            data: req.body
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'ACTUALIZACION_ORGANIZACION',
            tabla: 'organizaciones',
            registroId: org.id,
            detalles: { nombre: org.nombre, tipo: org.tipo },
            req
        });
        res.json(org);
    }
    catch (error) {
        next(error);
    }
});
// APPROVE/VERIFY OR REJECT AN ORGANIZATION (Super Admin or Moderator)
router.patch('/:id/verificar', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN', 'MODERATOR']), async (req, res, next) => {
    const { verificado } = req.body;
    if (typeof verificado !== 'boolean') {
        return res.status(400).json({ error: 'El campo "verificado" debe ser un booleano.' });
    }
    try {
        const existing = await db_1.default.organizacion.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Organización no encontrada.' });
        }
        const org = await db_1.default.organizacion.update({
            where: { id: req.params.id },
            data: { verificado }
        });
        // Write verification history
        await db_1.default.verificacion.create({
            data: {
                usuarioId: req.user.id,
                organizacionId: org.id,
                observacion: verificado ? 'Organización verificada e incorporada al directorio institucional.' : 'Organización desmarcada como verificada.',
                estadoAnterior: String(existing.verificado),
                estadoNuevo: String(verificado)
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: verificado ? 'APROBACION_ORGANIZACION' : 'DESAPROBACION_ORGANIZACION',
            tabla: 'organizaciones',
            registroId: org.id,
            detalles: { nombre: org.nombre, verificado },
            req
        });
        res.json(org);
    }
    catch (error) {
        next(error);
    }
});
// SOFT DELETE ORGANIZATION
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN']), async (req, res, next) => {
    try {
        const existing = await db_1.default.organizacion.findFirst({
            where: { id: req.params.id, deletedAt: null }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Organización no encontrada o ya eliminada.' });
        }
        await db_1.default.organizacion.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        await (0, logger_1.logActivity)({
            usuarioId: req.user?.id,
            accion: 'ELIMINACION_ORGANIZACION',
            tabla: 'organizaciones',
            registroId: req.params.id,
            detalles: { nombre: existing.nombre },
            req
        });
        res.json({ message: 'Organización eliminada exitosamente (Soft Delete).' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
