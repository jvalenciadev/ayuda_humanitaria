import { Request } from 'express';
import prisma from '../config/db';

export async function logActivity({
  usuarioId,
  accion,
  tabla,
  registroId,
  detalles,
  req,
}: {
  usuarioId?: string | null;
  accion: string;
  tabla: string;
  registroId?: string | null;
  detalles: any;
  req?: Request;
}) {
  try {
    let ipAddress = req?.ip || null;
    let userAgent = req?.headers['user-agent'] || null;

    // Standardize localhost IPs if needed
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1';
    }

    await prisma.log.create({
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
  } catch (error) {
    console.error('Error writing audit log to database:', error);
  }
}
