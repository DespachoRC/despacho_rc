import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/core/services/cotizaciones.service';

// put: admin rechaza una cotizacion directamente
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await CotizacionesService.rechazarPorAdmin(id, request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
