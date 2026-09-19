import { NextResponse } from 'next/server';
import { DocumentosService } from '@/core/services/documentos.service';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const url = await DocumentosService.generarUrlFirmada(id, request);
        return NextResponse.json({ success: true, data: url }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('encontrado') ? 404 : 403;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
