import { NextResponse } from 'next/server';
import { CatalogosService } from '@/core/services/catalogos.service';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ tipo: string; id: string }> }
) {
    try {
        const { tipo, id } = await params;
        const body = await request.json();
        
        if (typeof body.activo !== 'boolean') {
            return NextResponse.json({ success: false, error: 'El campo activo es requerido y debe ser booleano' }, { status: 400 });
        }

        const data = await CatalogosService.toggleEstatus(tipo, id, body.activo);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('invalido') ? 400 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ tipo: string; id: string }> }
) {
    try {
        const { tipo, id } = await params;
        
        await CatalogosService.remove(tipo, id);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(`DELETE /api/catalogos/[tipo]/[id] error:`, error);
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('en uso') ? 409 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
