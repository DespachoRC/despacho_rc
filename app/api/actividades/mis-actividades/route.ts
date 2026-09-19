import { NextResponse } from 'next/server';
import { ActividadesService } from '@/core/services/actividades.service';

// get: contador consulta las actividades asignadas a el
export async function GET(request: Request) {
    try {
        const data = await ActividadesService.getMisActividades(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
