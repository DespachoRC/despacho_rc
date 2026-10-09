import { createClient } from '@/core/db/server';
import { CreateCotizacionDTO, FijarPrecioDTO } from '../schemas/cotizacion.schema';
import { CrearNotificacionDTO, NotificacionesRepository } from './notificaciones.repository';

export class CotizacionesRepository {

    private static async crearNotificacionesDeCotizacion(
        organizacionId: string,
        clienteId: string,
        actorId: string,
        notificacionAdmin: Omit<CrearNotificacionDTO, 'usuario_id'>,
        notificacionCliente: Omit<CrearNotificacionDTO, 'usuario_id'>,
        notificacionesAdicionales: CrearNotificacionDTO[] = []
    ) {
        const adminIds = await NotificacionesRepository.getAdminIds(organizacionId);
        const notificaciones: CrearNotificacionDTO[] = [
            ...adminIds
                .filter((usuario_id) => usuario_id !== actorId)
                .map((usuario_id) => ({ ...notificacionAdmin, usuario_id })),
            ...(clienteId !== actorId ? [{ ...notificacionCliente, usuario_id: clienteId }] : []),
            ...notificacionesAdicionales.filter(({ usuario_id }) => usuario_id !== actorId),
        ];

        await NotificacionesRepository.crearNotificaciones(notificaciones);
    }

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

    // obtener cotizaciones de una organizacion (con su estatus y usuario)
    static async findAllAdmin(organizacionId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .select('*, usuarios(nombre, apellido_paterno), estatus_cotizacion(nombre), cotizacion_actividades(id, titulo_snapshot, notas_cliente)')
            .eq('organizacion_id', organizacionId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    // obtener cotizaciones pendientes de una organizacion
    static async findPendientes(organizacionId: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('pendiente');

        const { data, error } = await supabase
            .from('cotizaciones')
            .select('*, usuarios(nombre, apellido_paterno), estatus_cotizacion(nombre), cotizacion_actividades(id, titulo_snapshot, notas_cliente)')
            .eq('estatus_id', estatusId)
            .eq('organizacion_id', organizacionId)
            .order('fecha_creacion', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    // crear una cotizacion
    static async create(dto: CreateCotizacionDTO, clienteId: string, organizacionId: string) {
        const supabase = await createClient();

        const descripcionFinal = dto.notas_cliente 
            ? `${dto.descripcion || ''}\n\nNota del cliente: ${dto.notas_cliente}`.trim()
            : (dto.descripcion ?? null);

        let data: unknown;
        if (dto.actividades?.length) {
            const { data: cotizacion, error } = await supabase.rpc('crear_cotizacion_agrupada', {
                p_titulo: dto.titulo,
                p_descripcion: descripcionFinal,
                p_actividades: dto.actividades,
            });

            if (error) throw new Error(error.message);
            if (!cotizacion) throw new Error('No se pudo crear la cotización agrupada');
            data = cotizacion;
        } else {
            if (!dto.actividad_catalogo_id) {
                throw new Error('La cotización debe incluir al menos una actividad');
            }

            const estatusId = await this.getEstatusId('pendiente');
            const { data: cotizacion, error } = await supabase
                .from('cotizaciones')
                .insert({
                    titulo: dto.titulo,
                    descripcion: descripcionFinal,
                    actividad_catalogo_id: null,
                    cliente_id: clienteId,
                    organizacion_id: organizacionId,
                    estatus_id: estatusId,
                })
                .select()
                .single();

            if (error) throw new Error(error.message);
            data = cotizacion;
        }

        await this.crearNotificacionesDeCotizacion(
            organizacionId,
            clienteId,
            clienteId,
            {
                titulo: 'Nueva cotización solicitada',
                mensaje: `Un cliente solicitó la cotización "${dto.titulo}".`,
                tipo: 'cotizacion',
                url_destino: '/dashboard/tasks',
            },
            {
                titulo: 'Solicitud de cotización enviada',
                mensaje: `Tu solicitud "${dto.titulo}" fue enviada al despacho.`,
                tipo: 'cotizacion',
                url_destino: '/cliente/dashboard/budgets',
            }
        );

        return data;
    }

    // admin fija el precio — verifica el estatus antes de actualizar
    // si la cotizacion estaba rechazada, la regresa a pendiente automaticamente
    static async fijarPrecio(cotizacionId: string, dto: FijarPrecioDTO, actorId: string) {
        const supabase = await createClient();

        const { data: cotizacion, error: fetchError } = await supabase
            .from('cotizaciones')
            .select('id, titulo, cliente_id, organizacion_id, estatus_id')
            .eq('id', cotizacionId)
            .single();

        if (fetchError?.code === 'PGRST116') throw new Error('Cotización no encontrada');
        if (fetchError) throw new Error(fetchError.message);

        const estatusPendiente = await this.getEstatusId('pendiente');
        const estatusRechazada = await this.getEstatusId('rechazada');
        if (cotizacion.estatus_id !== estatusPendiente && cotizacion.estatus_id !== estatusRechazada) {
            throw new Error('No se puede fijar el precio de una cotización que no esté pendiente o rechazada');
        }

        const updatePayload: Record<string, unknown> = { precio: dto.precio };
        if (cotizacion.estatus_id === estatusRechazada) {
            updatePayload.estatus_id = estatusPendiente;
        }

        const { data, error } = await supabase
            .from('cotizaciones')
            .update(updatePayload)
            .eq('id', cotizacionId)
            .eq('estatus_id', cotizacion.estatus_id)
            .select()
            .single();

        if (error?.code === 'PGRST116') {
            throw new Error('La cotización cambió de estado; actualiza la lista e inténtalo de nuevo');
        }
        if (error) throw new Error(error.message);

        await this.crearNotificacionesDeCotizacion(
            cotizacion.organizacion_id,
            cotizacion.cliente_id,
            actorId,
            {
                titulo: 'Precio de cotización actualizado',
                mensaje: `Se asignó un precio a la cotización "${cotizacion.titulo || 'Solicitud'}".`,
                tipo: 'cotizacion',
                url_destino: '/dashboard/tasks',
            },
            {
                titulo: 'Presupuesto listo',
                mensaje: `Ya puedes revisar el precio de tu cotización "${cotizacion.titulo || 'Solicitud'}".`,
                tipo: 'cotizacion',
                url_destino: '/cliente/dashboard/budgets',
            }
        );

        return data;
    }

    // cliente acepta o rechaza — se verifica que sea el cliente dueño
    static async responder(cotizacionId: string, estatusNombre: string, clienteId: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId(estatusNombre);
        const estatusPendiente = await this.getEstatusId('pendiente');

        const { data: cotizacion, error: fetchError } = await supabase
            .from('cotizaciones')
            .select('id, titulo, cliente_id, organizacion_id, estatus_id, precio')
            .eq('id', cotizacionId)
            .eq('cliente_id', clienteId)
            .single();

        if (fetchError?.code === 'PGRST116') throw new Error('Cotización no encontrada o no autorizado');
        if (fetchError) throw new Error(fetchError.message);
        if (cotizacion.estatus_id !== estatusPendiente) {
            throw new Error('Solo puedes responder una cotización pendiente');
        }
        if (cotizacion.precio === null) {
            throw new Error('El despacho aún no ha fijado el precio de esta cotización');
        }

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({ estatus_id: estatusId })
            .eq('id', cotizacionId)
            .eq('cliente_id', clienteId)
            .eq('estatus_id', estatusPendiente)
            .select()
            .single();

        if (error?.code === 'PGRST116') throw new Error('Cotización no encontrada o no autorizado');
        if (error) throw new Error(error.message);

        const accion = estatusNombre === 'aceptada' ? 'aceptó' : 'rechazó';
        const adicionales: CrearNotificacionDTO[] = [];

        if (estatusNombre === 'aceptada') {
            const { data: cliente, error: clienteError } = await supabase
                .from('usuarios')
                .select('contador_id')
                .eq('id', clienteId)
                .single();

            if (clienteError) {
                throw new Error(`La cotización fue aceptada, pero no se pudo verificar el contador asignado al cliente: ${clienteError.message}`);
            }

            const { data: actividades, error: actividadesError } = await supabase
                .from('actividades')
                .select('contador_id')
                .eq('cotizacion_id', cotizacionId);

            if (actividadesError) {
                throw new Error(`La cotización fue aceptada, pero no se pudieron verificar las actividades asignadas: ${actividadesError.message}`);
            }

            const actividadesPorContador = new Map<string, number>();
            for (const actividad of actividades ?? []) {
                if (actividad.contador_id) {
                    actividadesPorContador.set(
                        actividad.contador_id,
                        (actividadesPorContador.get(actividad.contador_id) ?? 0) + 1
                    );
                }
            }

            if (cliente.contador_id && !actividadesPorContador.has(cliente.contador_id)) {
                actividadesPorContador.set(cliente.contador_id, 0);
            }

            for (const [contadorId, totalActividades] of actividadesPorContador) {
                adicionales.push({
                    usuario_id: contadorId,
                    titulo: totalActividades > 0 ? 'Nuevas actividades asignadas' : 'Cotización aceptada',
                    mensaje: totalActividades > 0
                        ? `La cotización "${cotizacion.titulo}" fue aceptada y tienes ${totalActividades} actividad${totalActividades === 1 ? '' : 'es'} asignada${totalActividades === 1 ? '' : 's'}.`
                        : `Tu cliente aceptó la cotización "${cotizacion.titulo}".`,
                    tipo: totalActividades > 0 ? 'actividad' : 'cotizacion',
                    url_destino: `/contador/dashboard/clients/details?cliente_id=${clienteId}`,
                });
            }
        }

        await this.crearNotificacionesDeCotizacion(
            cotizacion.organizacion_id,
            clienteId,
            clienteId,
            {
                titulo: estatusNombre === 'aceptada' ? 'Cotización aceptada por el cliente' : 'Cotización rechazada por el cliente',
                mensaje: `El cliente ${accion} la cotización "${cotizacion.titulo}".`,
                tipo: 'cotizacion',
                url_destino: '/dashboard/tasks',
            },
            {
                titulo: estatusNombre === 'aceptada' ? 'Cotización aceptada' : 'Cotización rechazada',
                mensaje: `Tu respuesta para la cotización "${cotizacion.titulo}" fue registrada.`,
                tipo: 'cotizacion',
                url_destino: '/cliente/dashboard/budgets',
            },
            adicionales
        );

        return data;
    }

    // cliente consulta el historial de sus propias cotizaciones
    static async findByCliente(clienteId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('cotizaciones')
            .select(`
                id, titulo, descripcion, precio, fecha_creacion,
                estatus_cotizacion(nombre),
                cotizacion_actividades(id, titulo_snapshot, notas_cliente)
            `)
            .eq('cliente_id', clienteId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    // admin rechaza directamente una cotizacion (sin enviarla al cliente)
    static async rechazarPorAdmin(cotizacionId: string, actorId: string) {
        const supabase = await createClient();
        const estatusId = await this.getEstatusId('rechazada');
        const estatusPendiente = await this.getEstatusId('pendiente');

        const { data: cotizacion, error: fetchError } = await supabase
            .from('cotizaciones')
            .select('id, titulo, cliente_id, organizacion_id, estatus_id')
            .eq('id', cotizacionId)
            .single();

        if (fetchError?.code === 'PGRST116') throw new Error('Cotización no encontrada');
        if (fetchError) throw new Error(fetchError.message);
        if (cotizacion.estatus_id !== estatusPendiente) {
            throw new Error('Solo se puede rechazar una cotización pendiente');
        }

        const { data, error } = await supabase
            .from('cotizaciones')
            .update({ estatus_id: estatusId })
            .eq('id', cotizacionId)
            .eq('estatus_id', estatusPendiente)
            .select()
            .single();

        if (error?.code === 'PGRST116') throw new Error('Cotización no encontrada');
        if (error) throw new Error(error.message);

        await this.crearNotificacionesDeCotizacion(
            cotizacion.organizacion_id,
            cotizacion.cliente_id,
            actorId,
            {
                titulo: 'Cotización rechazada',
                mensaje: `La cotización "${cotizacion.titulo}" fue rechazada por el despacho.`,
                tipo: 'cotizacion',
                url_destino: '/dashboard/tasks',
            },
            {
                titulo: 'Actualización de cotización',
                mensaje: `El despacho rechazó la cotización "${cotizacion.titulo}".`,
                tipo: 'cotizacion',
                url_destino: '/cliente/dashboard/budgets',
            }
        );

        return data;
    }

}
