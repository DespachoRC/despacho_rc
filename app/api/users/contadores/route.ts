import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';

// get: lista los contadores activos de la organizacion
export async function GET(request: Request) {
    try {
        const data = await UsersService.getContadoresActivos(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
