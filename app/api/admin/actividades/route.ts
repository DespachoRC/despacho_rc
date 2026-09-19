import { NextResponse } from 'next/server';
import { getAuthUser } from '@/core/db/get-user';
import { UserRepository } from '@/core/repositories/usuarios.repository';
import { createClient } from '@/core/db/server';

// get: admin obtiene todas las actividades de su organizacion
export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request);
        const organizacionId = await UserRepository.get_org_id_repository(user.id);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('actividades')
            .select(`
                id, titulo, descripcion, precio, fecha_creacion,
                estatus_actividad(nombre),
                usuarios!actividades_cliente_id_fkey(nombre, apellido_paterno),
                contador:usuarios!actividades_contador_id_fkey(nombre, apellido_paterno)
            `)
            .eq('organizacion_id', organizacionId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
