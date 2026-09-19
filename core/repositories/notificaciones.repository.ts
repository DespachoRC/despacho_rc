import { createClient } from "../db/server";

export interface CrearNotificacionDTO {
    usuario_id: string;
    titulo: string;
    mensaje: string;
    tipo: 'cotizacion' | 'mensaje' | 'actividad' | 'archivo' | 'asignacion';
    url_destino?: string;
}

export class NotificacionesRepository {

    // Obtener notificaciones del usuario autenticado
    public static async getNotificaciones(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw new Error(error.message);
        return data;
    }

    // Crear una notificación individual
    public static async crearNotificacion(datos: CrearNotificacionDTO) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('notificaciones')
            .insert({
                usuario_id: datos.usuario_id,
                titulo: datos.titulo,
                mensaje: datos.mensaje,
                tipo: datos.tipo,
                url_destino: datos.url_destino ?? null,
            });

        if (error) {
            console.error('Error al crear notificación:', error.message);
            return false;
        }
        return true;
    }

    // Crear notificaciones masivas para todos los administradores/owners
    public static async crearNotificacionParaAdmins(datos: Omit<CrearNotificacionDTO, 'usuario_id'>) {
        const supabase = await createClient();

        // Buscar IDs de administradores y owners
        const { data: rolesAdmins } = await supabase
            .from('roles')
            .select('id')
            .in('nombre', ['admin', 'owner']);

        if (!rolesAdmins || rolesAdmins.length === 0) return;

        const roleIds = rolesAdmins.map((r) => r.id);

        const { data: admins } = await supabase
            .from('usuarios')
            .select('id')
            .in('rol_id', roleIds);

        if (!admins || admins.length === 0) return;

        const notificaciones = admins.map((admin) => ({
            usuario_id: admin.id,
            titulo: datos.titulo,
            mensaje: datos.mensaje,
            tipo: datos.tipo,
            url_destino: datos.url_destino ?? null,
        }));

        const { error } = await supabase.from('notificaciones').insert(notificaciones);
        if (error) console.error('Error al notificar a admins:', error.message);
    }

    // Marcar una notificación como leída
    public static async marcarComoLeida(id: string, userId: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('id', id)
            .eq('usuario_id', userId);

        if (error) throw new Error(error.message);
        return true;
    }

    // Marcar todas las notificaciones como leídas
    public static async marcarTodasComoLeidas(userId: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('usuario_id', userId)
            .eq('leida', false);

        if (error) throw new Error(error.message);
        return true;
    }
}
