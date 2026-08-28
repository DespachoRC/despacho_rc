import { NextResponse } from 'next/server';
import { UsuariosService } from '@/core/services/usuarios.service';

// get: lista los contadores activos disponibles para la vista de asignacion de cartera
export async function GET() {
    try {
        const data = await UsuariosService.getContadoresActivos();
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
