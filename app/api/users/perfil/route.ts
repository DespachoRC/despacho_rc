import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';

// get: cualquier usuario autenticado consulta su propio perfil completo
export async function GET(request: Request) {
    try {
        const rawData = await UsersService.getPerfil(request);
        
        // Mapear los joins de Supabase al interface UserProfile del frontend
        const data = {
            ...rawData,
            rol: (rawData.roles as any)?.nombre,
            organizacion_nombre: (rawData.organizaciones as any)?.nombre || '',
        };
        // Limpiamos los objetos crudos anidados para que la respuesta sea plana
        delete data.roles;
        delete data.organizaciones;
        delete data.estatus_usuarios;
        delete data.regimenes_fiscales;

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('no encontrado') ? 404 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
