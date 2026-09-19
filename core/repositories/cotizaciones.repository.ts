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
                notas_cliente: dto.notas_cliente ?? null,
                cliente_id: clienteId,
                organizacion_id: organizacionId,
                estatus_id: estatusId,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // admin fija el precio — verifica el estatus antes de actualizar
    // si la cotizacion estaba rechazada, la regresa a pendiente automaticamente
    static async fijarPrecio(cotizacionId: string, dto: FijarPrecioDTO) {
        const supabase = await createClient();

        // obtener cotizacion y su estatus actual
        const { data: cotizacion, error: fetchError } = await supabase
            .from('cotizaciones')
            .select('id, estatus_id, estatus_cotizacion(nombre)')
            .eq('id', cotizacionId)
            .single();

        if (fetchError?.code === 'PGRST116') throw new Error('Cotización no encontrada');
        if (fetchError) throw new Error(fetchError.message);

        const estatusActual = (cotizacion?.estatus_cotizacion as unknown as { nombre: string } | null)?.nombre;

        if (estatusActual === 'aceptada') {
            throw new Error('No se puede modificar el precio de una cotización ya aceptada');
        }
        if (estatusActual === 'cancelada') {
            throw new Error('No se puede modificar el precio de una cotización cancelada');
        }

        // si estaba rechazada, se regresa a pendiente al fijar nuevo precio
        const updatePayload: Record<string, unknown> = { precio: dto.precio };
        if (estatusActual === 'rechazada') {
            const pendienteId = await this.getEstatusId('pendiente');
            updatePayload.estatus_id = pendienteId;
        }

        const { data, error } = await supabase
            .from('cotizaciones')
            .update(updatePayload)
            .eq('id', cotizacionId)
            .select()
            .single();

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

    // cliente consulta el historial de sus propias cotizaciones
    static async findByCliente(clienteId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .select(`
                id, titulo, descripcion, precio, notas_cliente, fecha_creacion,
                estatus_cotizacion(nombre),
                lista_actividades(catalogo_actividades(nombre))
            `)
            .eq('cliente_id', clienteId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

}
