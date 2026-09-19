import { NextResponse } from 'next/server';
import { NotificacionesService } from '@/core/services/notificaciones.service';

export async function POST(request: Request) {
    try {
        await NotificacionesService.marcarTodasLeidas(request);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
