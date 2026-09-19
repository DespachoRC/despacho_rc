import { NextResponse } from 'next/server';
import { getAuthUser } from '@/core/db/get-user';
import { createClient } from '@/core/db/server';
import { UserRepository } from '@/core/repositories/usuarios.repository';

export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request);
        const supabase = await createClient();

        // 1. Obtener org_id del usuario
        const org_id = await UserRepository.get_org_id_repository(user.id);
        const role = await UserRepository.getRoleName(user.id);

        if (role !== 'admin' && role !== 'owner') {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
        }

        // 2. Fetch ids para 'cliente', 'contador', 'activo'
        const { data: roles } = await supabase.from('roles').select('id, nombre').in('nombre', ['cliente', 'contador']);
        const clienteRoleId = roles?.find(r => r.nombre === 'cliente')?.id;
        const contadorRoleId = roles?.find(r => r.nombre === 'contador')?.id;

        const { data: estatusUsuarios } = await supabase.from('estatus_usuarios').select('id, nombre').eq('nombre', 'activo').single();
        const estatusActivoId = estatusUsuarios?.id;

        // 3. Contar clientes activos
        const { count: clientesCount } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('organizacion_id', org_id)
            .eq('rol_id', clienteRoleId)
            .eq('estatus_id', estatusActivoId);

        // 4. Contar contadores activos
        const { count: contadoresCount } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('organizacion_id', org_id)
            .eq('rol_id', contadorRoleId)
            .eq('estatus_id', estatusActivoId);

        // 5. Contar tareas pendientes (esperando respuesta de admin/contador)
        const { data: estatusCot } = await supabase.from('estatus_cotizacion').select('id, nombre').eq('nombre', 'pendiente').single();
        const pendienteId = estatusCot?.id;

        const { count: tareasCount } = await supabase
            .from('cotizaciones')
            .select('*', { count: 'exact', head: true })
            .eq('organizacion_id', org_id)
            .eq('estatus_id', pendienteId);

        return NextResponse.json({ 
            success: true, 
            data: {
                clientesActivos: clientesCount || 0,
                contadoresActivos: contadoresCount || 0,
                tareasPendientes: tareasCount || 0
            }
        });
    } catch (error) {
        console.error("GET /api/admin/metrics error:", error);
        return NextResponse.json({ success: false, error: 'Error al obtener métricas' }, { status: 500 });
    }
}
