import { NextResponse } from 'next/server';
import { ActividadesService } from '@/core/services/actividades.service';

// cliente sube un documento a una actividad
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        const data = await ActividadesService.subirDocumentoCliente(id, request, formData);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
