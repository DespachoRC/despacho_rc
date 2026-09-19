import { NextResponse } from 'next/server';
import { NotificacionesService } from '@/core/services/notificaciones.service';

export async function GET(request: Request) {
    try {
        const data = await NotificacionesService.getMisNotificaciones(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
