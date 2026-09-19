import { createClient } from "@/core/db/server"

export class ActividadesRepository {

    // obtener datos de la actividad
    public static async get_actividad_data(id: string): Promise<any> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("actividades")
            .select()
            .eq('id', id)
            .single();

        if (error || !data) throw new Error(`Actividad no encontrada`);
        return data;
    }

    // obtener estatus id por nombre
    private static async getEstatusId(nombre: string): Promise<string> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('estatus_actividad')
            .select('id')
            .eq('nombre', nombre)
            .single();

        if (error || !data) throw new Error(`Estatus no encontrado: ${nombre}`);
        return data.id as string;
    }

    // obtener insumos de la actividad (notas y documentos del cliente)
    public static async getInsumos(actividadId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('actividades')
            .select(`
                cotizaciones(notas_cliente),
                documentos(id, nombre_archivo, ruta_archivo)
            `)
            .eq('id', actividadId)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // actualizar estatus de la actividad
    public static async actualizarEstatus(actividadId: string, nombreEstatus: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId(nombreEstatus);

        const { data, error } = await supabase
            .from('actividades')
            .update({ estatus_id: estatusId })
            .eq('id', actividadId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // insertar documento en la tabla documentos
    public static async insertarDocumento(payload: {
        actividad_id: string;
        organizacion_id: string;
        cliente_id: string;
        subido_por_id: string;
        nombre_archivo: string;
        ruta_archivo: string;
        categoria_documento_id?: string;
    }) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('documentos')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // subir archivo a supabase storage y retornar la ruta
    public static async subirArchivoStorage(
        bucket: string,
        path: string,
        file: Buffer,
        contentType: string
    ) {
        const supabase = await createClient();
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { contentType, upsert: false });

        if (error) throw new Error(`Error al subir archivo: ${error.message}`);
        return data.path;
    }

    // obtener resultados del cliente (actividades con documentos y estatus)
    public static async getResultados(clienteId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('actividades')
            .select(`
                *,
                documentos(id, nombre_archivo, ruta_archivo),
                estatus_actividad(nombre)
            `)
            .eq('cliente_id', clienteId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    // contador consulta sus actividades asignadas
    public static async findByContador(contadorId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('actividades')
            .select(`
                id, titulo, descripcion, fecha_creacion,
                estatus_actividad(nombre),
                usuarios!actividades_cliente_id_fkey(nombre, apellido_paterno)
            `)
            .eq('contador_id', contadorId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }


}