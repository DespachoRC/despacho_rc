import { NextResponse } from 'next/server';
import { ActividadesService } from '@/lib/services/actividades.service';

// cliente consulta sus actividades con estatus y urls de descarga si estan listas
export async function GET() {
    try {
        const data = await ActividadesService.getResultados();
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
