// importacion de conexion a supabase y tipos del modulo
import { createClient } from '@/lib/supabase/server';
import {
    CreateCotizacionDTO,
    FijarPrecioDTO,
    ResponderCotizacionDTO,
} from '../dtos/cotizacion.schema';

// mock temporal hasta que el middleware de auth este listo
const mockAdminId = 'mock-admin-uuid-0000-000000000000';
const mockClienteId = 'mock-cliente-uuid-0000-000000000000';

export class CotizacionesService {

    // obtiene todas las cotizaciones con estatus pendiente de cotizar
    static async getPendientes() {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .select('*')
            .eq('estatus', 'Pendiente de Cotizar')
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        return data;
    }

    // crea una fila en cotizaciones por cada servicio del array recibido
    // la tabla solo acepta un servicio por registro (actividad_catalogo_id)
    static async createCotizacion(dto: CreateCotizacionDTO) {
        const supabase = await createClient();

        // construimos el array de inserciones: una fila por servicio
        const filas = dto.servicios.map((servicio) => ({
            cliente_id: mockClienteId,
            actividad_catalogo_id: servicio.catalogo_servicio_id,
            notas_cliente: servicio.notas ?? null,
            archivos_adjuntos: servicio.archivos ?? null,
            estatus: 'Pendiente de Cotizar',
        }));

        const { data, error } = await supabase
            .from('cotizaciones')
            .insert(filas)
            .select();

        if (error) throw new Error(error.message);

        return data;
    }

    // admin asigna precio y cambia estatus a enviada al cliente
    static async fijarPrecio(cotizacionId: string, dto: FijarPrecioDTO) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({
                precio: dto.precio,
                notas_admin: dto.notas_admin ?? null,
                estatus: 'Enviada al Cliente',
                admin_id: mockAdminId,
            })
            .eq('id', cotizacionId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    // cliente responde aceptando o rechazando la cotizacion
    static async responderCotizacion(cotizacionId: string, dto: ResponderCotizacionDTO) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({
                estatus: dto.respuesta, // "Aceptada" o "Rechazada"
            })
            .eq('id', cotizacionId)
            .eq('cliente_id', mockClienteId) // validamos que la cotizacion pertenezca al cliente
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }
}
