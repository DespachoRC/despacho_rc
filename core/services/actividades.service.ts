// importacion de conexion a supabase y tipos del modulo
import { createClient } from '@/core/db/server';
import { ActualizarEstatusDTO, SubirEntregableDTO } from '../schemas/actividad.schema';

// mock temporal hasta que el middleware de auth este listo
const mockContadorId = 'mock-contador-uuid-0000-000000000000';
const mockClienteId = 'mock-cliente-uuid-0000-000000000000';

export class ActividadesService {

    // buscamos el uuid del estatus en el catalogo por su nombre
    private static async getEstatusId(nombre: string): Promise<string> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('estatus_actividad')
            .select('id')
            .eq('nombre', nombre)
            .single();

        if (error || !data) throw new Error(`Estatus no encontrado en catalogo: ${nombre}`);
        return data.id as string;
    }

    // devuelve las notas y archivos que el cliente subio en la cotizacion asociada
    static async getInsumos(actividadId: string) {
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

    // contador cambia el estatus de la actividad a en_proceso o bloqueada
    static async actualizarEstatus(actividadId: string, dto: ActualizarEstatusDTO) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId(dto.estatus);

        const { data, error } = await supabase
            .from('actividades')
            .update({ estatus_id: estatusId })
            .eq('id', actividadId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // contador sube el entregable final y cierra la actividad como completada
    static async subirEntregable(actividadId: string, dto: SubirEntregableDTO) {
        const supabase = await createClient();

        // 1. obtenemos el uuid del estatus completada
        const estatusId = await this.getEstatusId('completada');

        // 2. marcamos la actividad como completada
        const { error: errorActividad } = await supabase
            .from('actividades')
            .update({ estatus_id: estatusId })
            .eq('id', actividadId);

        if (errorActividad) throw new Error(errorActividad.message);

        // 3. insertamos el documento entregable en la tabla documentos
        const { data, error: errorDoc } = await supabase
            .from('documentos')
            .insert({
                actividad_id: actividadId,
                cliente_id: mockClienteId,
                subido_por_id: mockContadorId,
                nombre_archivo: dto.nombre_archivo,
                ruta_archivo: dto.url_entregable,
            })
            .select()
            .single();

        if (errorDoc) throw new Error(errorDoc.message);
        return data;
    }

    // cliente consulta sus actividades con documentos y nombre de estatus
    static async getResultados() {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('actividades')
            .select(`
                *,
                documentos(id, nombre_archivo, ruta_archivo),
                estatus_actividad(nombre)
            `)
            .eq('cliente_id', mockClienteId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }
}
