import { createClient } from "../db/server";

export class ConversacionesRepository {
    
    // Obtener conversaciones donde participa el usuario actual
    public static async getConversaciones(userId: string) {
        const supabase = await createClient();
        
        // Supabase RLS garantiza que el usuario solo verá conversaciones donde participa, 
        // ya sea por cliente_id, contador_id o admin_id.
        const { data, error } = await supabase
            .from('conversaciones')
            .select(`
                id, 
                tipo_conversacion,
                fecha_creacion,
                cliente_id,
                contador_id,
                admin_id,
                cotizacion_id,
                actividad_id,
                clientes:usuarios!conversaciones_cliente_id_fkey(nombre, apellido_paterno),
                contadores:usuarios!conversaciones_contador_id_fkey(nombre, apellido_paterno),
                admins:usuarios!conversaciones_admin_id_fkey(nombre, apellido_paterno)
            `)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    // Obtener mensajes de una conversación
    public static async getMensajes(conversacionId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('mensajes')
            .select(`
                id,
                conversacion_id,
                remitente_id,
                contenido,
                fecha_envio,
                usuarios(nombre, apellido_paterno, roles(nombre))
            `)
            .eq('conversacion_id', conversacionId)
            .order('fecha_envio', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    // Crear una nueva conversación
    public static async crearConversacion(datos: {
        organizacion_id: string;
        tipo_conversacion: 'contador_cliente' | 'cliente_admin';
        cliente_id: string;
        contador_id?: string;
        admin_id?: string;
        cotizacion_id?: string;
        actividad_id?: string;
    }) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('conversaciones')
            .insert(datos)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // Enviar un mensaje
    public static async enviarMensaje(datos: {
        conversacion_id: string;
        remitente_id: string;
        contenido: string;
    }) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('mensajes')
            .insert(datos)
            .select(`
                id,
                conversacion_id,
                remitente_id,
                contenido,
                fecha_envio,
                usuarios(nombre, apellido_paterno, roles(nombre))
            `)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // Obtener detalles de una conversacion para validaciones
    public static async getConversacion(conversacionId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('conversaciones')
            .select('*')
            .eq('id', conversacionId)
            .single();

        if (error) throw new Error('Conversación no encontrada');
        return data;
    }
}
