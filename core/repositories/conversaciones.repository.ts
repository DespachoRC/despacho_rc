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
                tipo,
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

    // Buscar una conversación existente por criterios
    public static async buscarConversacion(criterios: {
        tipo: 'contador_cliente' | 'cliente_admin';
        cliente_id: string;
        contador_id?: string;
        admin_id?: string;
    }) {
        const supabase = await createClient();
        let query = supabase
            .from('conversaciones')
            .select(`
                id, 
                tipo,
                fecha_creacion,
                cliente_id,
                contador_id,
                admin_id,
                cotizacion_id,
                actividad_id
            `)
            .eq('tipo', criterios.tipo)
            .eq('cliente_id', criterios.cliente_id);

        if (criterios.contador_id) {
            query = query.eq('contador_id', criterios.contador_id);
        }
        if (criterios.admin_id) {
            query = query.eq('admin_id', criterios.admin_id);
        }

        const { data, error } = await query.maybeSingle();
        if (error) return null;
        return data;
    }

    // Crear una nueva conversación
    public static async crearConversacion(datos: {
        organizacion_id: string;
        tipo: 'contador_cliente' | 'cliente_admin';
        cliente_id: string;
        contador_id?: string;
        admin_id?: string;
        cotizacion_id?: string;
        actividad_id?: string;
    }) {
        const supabase = await createClient();

        // Limpiar campos undefined para evitar enviar llaves inválidas o nulas
        const payload: Record<string, any> = {
            organizacion_id: datos.organizacion_id,
            tipo: datos.tipo,
            cliente_id: datos.cliente_id,
        };

        if (datos.contador_id) payload.contador_id = datos.contador_id;
        if (datos.admin_id) payload.admin_id = datos.admin_id;
        if (datos.cotizacion_id) payload.cotizacion_id = datos.cotizacion_id;
        if (datos.actividad_id) payload.actividad_id = datos.actividad_id;

        console.log('[DEBUG] Intentando insertar conversacion:', JSON.stringify(payload, null, 2));

        const { data, error } = await supabase
            .from('conversaciones')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('[ERROR] Supabase insert conversaciones:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                payload
            });
            throw new Error(error.message);
        }
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
