import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/core/services/cotizaciones.service';

// get: cliente consulta el historial completo de sus cotizaciones
export async function GET(request: Request) {
    try {
        const data = await CotizacionesService.getMisCotizaciones(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
