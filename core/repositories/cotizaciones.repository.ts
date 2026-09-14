import { createClient } from '@/core/db/server';
import { CreateCotizacionDTO, FijarPrecioDTO } from '../schemas/cotizacion.schema';

export class CotizacionesRepository {

    // helper privado para obtener el uuid del estatus por nombre
    private static async getEstatusId(nombre: string): Promise<string> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('estatus_cotizacion')
            .select('id')
            .eq('nombre', nombre)
            .single();

        if (error || !data) throw new Error(`Estatus no encontrado: ${nombre}`);
        return data.id;
    }

    // obtener cotizaciones pendientes de una organizacion
    static async findPendientes(organizacionId: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('pendiente');

        const { data, error } = await supabase
            .from('cotizaciones')
            .select('*, usuarios(nombre, apellido_paterno)')
            .eq('estatus_id', estatusId)
            .eq('organizacion_id', organizacionId)
            .order('fecha_creacion', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    // crear una cotizacion
    static async create(dto: CreateCotizacionDTO, clienteId: string, organizacionId: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('pendiente');

        const { data, error } = await supabase
            .from('cotizaciones')
            .insert({
                titulo: dto.titulo,
                descripcion: dto.descripcion ?? null,
                actividad_catalogo_id: dto.actividad_catalogo_id,
                cliente_id: clienteId,
                organizacion_id: organizacionId,
                estatus_id: estatusId,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // admin fija el precio — estatus se mantiene en pendiente hasta que el cliente responda
    static async fijarPrecio(cotizacionId: string, dto: FijarPrecioDTO) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({ precio: dto.precio })
            .eq('id', cotizacionId)
            .select()
            .single();

        if (error?.code === 'PGRST116') throw new Error('Cotización no encontrada');
        if (error) throw new Error(error.message);
        return data;
    }

    // cliente acepta o rechaza — se verifica que sea el cliente dueño
    static async responder(cotizacionId: string, estatusNombre: string, clienteId: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId(estatusNombre);

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({ estatus_id: estatusId })
            .eq('id', cotizacionId)
            .eq('cliente_id', clienteId) // seguridad: solo el dueño puede responder
            .select()
            .single();

        // si no encontró la fila puede ser que el id no sea del cliente
        if (error?.code === 'PGRST116') throw new Error('Cotización no encontrada o no autorizado');
        if (error) throw new Error(error.message);
        return data;
    }

}
