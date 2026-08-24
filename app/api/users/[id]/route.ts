import { NextResponse } from 'next/server';
import { UsuariosService } from '@/lib/services/usuarios.service';

// delete: ejecuta la baja logica — setea activo = false, no elimina el registro
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await UsuariosService.bajaLogica(id);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
