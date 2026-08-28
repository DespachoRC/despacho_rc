// importacion de conexion a supabase y tipos del modulo
import { createClient } from '@/core/db/server';
import {
    CreateCotizacionDTO,
    FijarPrecioDTO,
    ResponderCotizacionDTO,
} from '../schemas/cotizacion.schema';

// mock temporal hasta que el middleware de auth este listo
const mockAdminId = 'mock-admin-uuid-0000-000000000000';
const mockClienteId = 'mock-cliente-uuid-0000-000000000000';

export class CotizacionesService {

    // helper privado para buscar el UUID real en el catalogo sin quemar textos
    private static async getEstatusId(nombreEstatus: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('estatus_cotizacion') // catalogo de estatus
            .select('id')
            .eq('nombre', nombreEstatus)
            .single();

        if (error) throw new Error(`Estatus no encontrado en catálogo: ${nombreEstatus}`);
        return data.id;
    }

    // obtiene todas las cotizaciones con estatus pendiente
    static async getPendientes() {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('pendiente');

        const { data, error } = await supabase
            .from('cotizaciones')
            .select('*')
            .eq('estatus_id', estatusId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    // crea cotizaciones e inserta sus documentos asociados de forma relacional
    static async createCotizacion(dto: CreateCotizacionDTO) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('pendiente');

        // 1. preparamos y creamos los registros de cotizacion
        const filasCotizacion = dto.servicios.map((servicio) => ({
            cliente_id: mockClienteId,
            actividad_catalogo_id: servicio.catalogo_servicio_id,
            notas_cliente: servicio.notas ?? null,
            estatus_id: estatusId,
        }));

        const { data: cotizaciones, error: errorCotizacion } = await supabase
            .from('cotizaciones')
            .insert(filasCotizacion)
            .select();

        if (errorCotizacion) throw new Error(errorCotizacion.message);

        // 2. si hay archivos, los iteramos y los insertamos en la tabla documentos
        const filasDocumentos: any[] = [];
        dto.servicios.forEach((servicio, index) => {
            if (servicio.archivos && servicio.archivos.length > 0) {
                servicio.archivos.forEach((archivo: any) => {
                    filasDocumentos.push({
                        cotizacion_id: cotizaciones[index].id,
                        cliente_id: mockClienteId,
                        nombre_archivo: archivo.nombre,
                        ruta_archivo: archivo.url,
                    });
                });
            }
        });

        if (filasDocumentos.length > 0) {
            const { error: errorDocs } = await supabase
                .from('documentos')
                .insert(filasDocumentos);
            if (errorDocs) throw new Error(errorDocs.message);
        }

        return cotizaciones;
    }

    // admin asigna precio y cambia estatus
    static async fijarPrecio(cotizacionId: string, dto: FijarPrecioDTO) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('enviada');

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({
                precio: dto.precio,
                notas_admin: dto.notas_admin ?? null,
                estatus_id: estatusId,
            })
            .eq('id', cotizacionId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // cliente responde aceptando o rechazando
    static async responderCotizacion(cotizacionId: string, dto: ResponderCotizacionDTO) {
        const supabase = await createClient();

        // mapeamos la respuesta del DTO (Aceptada/Rechazada) al nombre en BD
        const estatusNombre = dto.respuesta === 'Aceptada' ? 'aceptada' : 'rechazada';
        const estatusId = await this.getEstatusId(estatusNombre);

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({
                estatus_id: estatusId,
            })
            .eq('id', cotizacionId)
            .eq('cliente_id', mockClienteId) // capa extra de seguridad
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}