import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';

// get: cualquier usuario autenticado consulta su propio perfil completo
export async function GET(request: Request) {
    try {
        const data = await UsersService.getPerfil(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('no encontrado') ? 404 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
