import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/core/services/cotizaciones.service';

export async function GET(request: Request) {
    try {
        const data = await CotizacionesService.getMisCotizaciones(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        const status = error.message.includes('No autenticado') ? 401 : 400;
        return NextResponse.json({ success: false, error: error.message }, { status });
    }
}
