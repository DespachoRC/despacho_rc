import { createClient } from "../db/server";

export interface CrearNotificacionDTO {
    usuario_id: string;
    titulo: string;
    mensaje: string;
    tipo: 'cotizacion' | 'mensaje' | 'actividad' | 'archivo' | 'asignacion';
    url_destino?: string;
}

export class NotificacionesRepository {

    public static async getAdminIds(organizacionId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('obtener_admin_ids_notificaciones', {
            p_organizacion_id: organizacionId,
        });

        if (error) {
            throw new Error(`Error al obtener administradores de la organización: ${error.message}`);
        }

        const adminIds = Array.isArray(data)
            ? [...new Set(data.filter((id): id is string => typeof id === 'string'))]
            : [];
        if (adminIds.length === 0) {
            console.error(`No se encontraron administradores para la organización ${organizacionId}`);
        }
        return adminIds;
    }

    // Insertar juntas las notificaciones de una misma transición de negocio.
    public static async crearNotificaciones(datos: CrearNotificacionDTO[]) {
        if (datos.length === 0) return;

        const supabase = await createClient();
        const { error } = await supabase
            .from('notificaciones')
            .insert(datos.map((dato) => ({
                usuario_id: dato.usuario_id,
                titulo: dato.titulo,
                mensaje: dato.mensaje,
                tipo: dato.tipo,
                url_destino: dato.url_destino ?? null,
            })));

        if (error) throw new Error(`Error al crear notificaciones: ${error.message}`);
    }

    // Obtener notificaciones del usuario autenticado
    public static async getNotificaciones(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw new Error(`Error al obtener notificaciones: ${error.message}`);
        return data;
    }

    // Crear una notificación individual
    public static async crearNotificacion(datos: CrearNotificacionDTO) {
        await this.crearNotificaciones([datos]);
        return true;
    }

    // Crear notificaciones solo para administradores de la organización correspondiente.
    public static async crearNotificacionParaAdmins(
        datos: Omit<CrearNotificacionDTO, 'usuario_id'>,
        organizacionId: string
    ) {
        const adminIds = await this.getAdminIds(organizacionId);
        await this.crearNotificaciones(adminIds.map((usuario_id) => ({ ...datos, usuario_id })));
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
