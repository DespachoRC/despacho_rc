import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';

// get: cualquier usuario autenticado consulta su propio perfil completo
export async function GET(request: Request) {
    try {
        const rawData = await UsersService.getPerfil(request);
        const { roles, organizaciones, estatus_usuarios, regimenes_fiscales, ...rest } = rawData as any;
        
        // Mapear los joins de Supabase al interface UserProfile del frontend
        const data = {
            ...rest,
            rol: (roles as any)?.nombre || (Array.isArray(roles) ? roles[0]?.nombre : undefined),
            organizacion_nombre: (organizaciones as any)?.nombre || '',
        };

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('no encontrado') ? 404 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
