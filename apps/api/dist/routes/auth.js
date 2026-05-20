"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
const validate_1 = require("../middlewares/validate");
const auth_1 = require("../middlewares/auth");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'seguridad_institucional_key_2026_xyz';
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z.string({ required_error: 'El nombre es requerido' }).min(3, 'Mínimo 3 caracteres'),
        email: zod_1.z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo inválido'),
        password: zod_1.z.string({ required_error: 'La contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
        rolId: zod_1.z.enum(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER', 'VISUALIZER'], {
            required_error: 'El rol de usuario es requerido'
        })
    })
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo inválido'),
        password: zod_1.z.string({ required_error: 'La contraseña es requerida' })
    })
});
// REGISTER USER
router.post('/register', (0, validate_1.validateRequest)(registerSchema), async (req, res, next) => {
    const { nombre, email, password, rolId } = req.body;
    try {
        const existingUser = await db_1.default.usuario.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await db_1.default.usuario.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
                rolId
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                rolId: true,
                createdAt: true
            }
        });
        await (0, logger_1.logActivity)({
            usuarioId: user.id,
            accion: 'REGISTRO_USUARIO',
            tabla: 'usuarios',
            registroId: user.id,
            detalles: { nombre: user.nombre, email: user.email, rolId: user.rolId },
            req
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, rolId: user.rolId }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        next(error);
    }
});
// LOGIN USER
router.post('/login', (0, validate_1.validateRequest)(loginSchema), async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await db_1.default.usuario.findUnique({
            where: { email },
            include: { rol: true }
        });
        if (!user || user.deletedAt) {
            return res.status(401).json({ error: 'Credenciales inválidas o cuenta inactiva.' });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas o cuenta inactiva.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, rolId: user.rolId }, JWT_SECRET, { expiresIn: '24h' });
        await (0, logger_1.logActivity)({
            usuarioId: user.id,
            accion: 'INICIO_SESION',
            tabla: 'usuarios',
            registroId: user.id,
            detalles: { email: user.email, rolId: user.rolId },
            req
        });
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rolId: user.rolId,
                rol: user.rol
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// GET PROFILE INFO
router.get('/me', auth_1.authenticateJWT, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        const user = await db_1.default.usuario.findUnique({
            where: { id: req.user.id },
            include: { rol: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rolId: user.rolId,
            rol: user.rol
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
