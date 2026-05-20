import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { validateRequest } from '../middlewares/validate';
import { authenticateJWT } from '../middlewares/auth';
import { logActivity } from '../utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seguridad_institucional_key_2026_xyz';

const registerSchema = z.object({
  body: z.object({
    nombre: z.string({ required_error: 'El nombre es requerido' }).min(3, 'Mínimo 3 caracteres'),
    email: z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo inválido'),
    password: z.string({ required_error: 'La contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
    rolId: z.enum(['SUPER_ADMIN', 'MODERATOR', 'VERIFIER', 'VISUALIZER'], {
      required_error: 'El rol de usuario es requerido'
    })
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo inválido'),
    password: z.string({ required_error: 'La contraseña es requerida' })
  })
});

// REGISTER USER
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  const { nombre, email, password, rolId } = req.body;

  try {
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.usuario.create({
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

    await logActivity({
      usuarioId: user.id,
      accion: 'REGISTRO_USUARIO',
      tabla: 'usuarios',
      registroId: user.id,
      detalles: { nombre: user.nombre, email: user.email, rolId: user.rolId },
      req
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, rolId: user.rolId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

// LOGIN USER
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: 'Credenciales inválidas o cuenta inactiva.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas o cuenta inactiva.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rolId: user.rolId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logActivity({
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
  } catch (error) {
    next(error);
  }
});

// GET PROFILE INFO
router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await prisma.usuario.findUnique({
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
  } catch (error) {
    next(error);
  }
});

export default router;
