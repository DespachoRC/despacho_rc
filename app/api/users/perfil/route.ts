import { NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import { UserRepository } from '@/core/repositories/usuarios.repository';

// devuelve el perfil del usuario autenticado (sesión por cookie)
export async function GET() {
    try {
        const supabase = await createClient();

        // obtiene el usuario de la sesión actual (cookie-based, no Bearer)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'No autenticado' },
                { status: 401 }
            );
        }

        // busca el perfil en la tabla public.usuarios
        const perfil = await UserRepository.findById(user.id);

        if (!perfil) {
            return NextResponse.json(
                { success: false, error: 'Perfil no encontrado' },
                { status: 404 }
            );
        }

        // resuelve el nombre del rol desde la tabla roles
        const rolNombre = await UserRepository.getRoleName(user.id, perfil.rol_id);

        return NextResponse.json({
            success: true,
            data: {
                id:               perfil.id,
                nombre:           perfil.nombre,
                apellido_paterno: perfil.apellido_paterno,
                apellido_materno: perfil.apellido_materno,
                email:            perfil.email,
                rfc:              perfil.rfc,
                rol:              rolNombre,
                organizacion_nombre: '',   // se puede enriquecer después si es necesario
                fecha_creacion:   perfil.fecha_creacion,
            },
        }, { status: 200 });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
