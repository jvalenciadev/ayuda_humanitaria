"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET SYSTEM AUDIT LOGS (Super Admin only)
router.get('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPER_ADMIN']), async (req, res, next) => {
    const { accion, tabla, usuarioId, limit, offset } = req.query;
    try {
        const filters = {};
        if (accion)
            filters.accion = String(accion);
        if (tabla)
            filters.tabla = String(tabla);
        if (usuarioId)
            filters.usuarioId = String(usuarioId);
        const take = limit ? parseInt(String(limit), 10) : 100;
        const skip = offset ? parseInt(String(offset), 10) : 0;
        const [logs, total] = await db_1.default.$transaction([
            db_1.default.log.findMany({
                where: filters,
                include: { usuario: { select: { nombre: true, email: true, rolId: true } } },
                orderBy: { createdAt: 'desc' },
                take,
                skip
            }),
            db_1.default.log.count({ where: filters })
        ]);
        res.json({
            logs,
            pagination: {
                total,
                limit: take,
                offset: skip
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
