"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const db_1 = __importDefault(require("../config/db"));
async function logActivity({ usuarioId, accion, tabla, registroId, detalles, req, }) {
    try {
        let ipAddress = req?.ip || null;
        let userAgent = req?.headers['user-agent'] || null;
        // Standardize localhost IPs if needed
        if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
            ipAddress = '127.0.0.1';
        }
        await db_1.default.log.create({
            data: {
                usuarioId: usuarioId || null,
                accion,
                tabla,
                registroId: registroId || null,
                detalles: typeof detalles === 'string' ? detalles : JSON.stringify(detalles),
                ipAddress,
                userAgent,
            },
        });
    }
    catch (error) {
        console.error('Error writing audit log to database:', error);
    }
}
