import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';

// put: admin reactiva un usuario que habia sido dado de baja
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await UsersService.reactivar(id);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('no encontrado') ? 404 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
