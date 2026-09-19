import { NextResponse } from 'next/server';
import { ActividadesService } from '@/core/services/actividades.service';

export async function GET(request: Request) {
    try {
        const data = await ActividadesService.getMisActividades(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        const status = error.message.includes('No autenticado') ? 401 : 400;
        return NextResponse.json({ success: false, error: error.message }, { status });
    }
}
