import { ActualizarEstatusDTO, SubirEntregableDTO } from '../schemas/actividad.schema';
import { ActividadesRepository } from '../repositories/actividades.repository';
import { getAuthUser } from '../db/get-user';

export class ActividadesService {

    static async get_actividad(id: string) {
        return await ActividadesRepository.get_actividad_data(id);
    }

    static async getInsumos(actividadId: string) {
        return await ActividadesRepository.getInsumos(actividadId);
    }

    static async actualizarEstatus(actividadId: string, dto: ActualizarEstatusDTO) {
        return await ActividadesRepository.actualizarEstatus(actividadId, dto.estatus);
    }

    // cliente sube un documento a la actividad
    static async subirDocumentoCliente(
        actividadId: string,
        request: Request,
        formData: FormData
    ) {
        const user = await getAuthUser(request);

        // extraemos los campos del form
        const archivo = formData.get('archivo') as File;
        const categoriId = formData.get('categoria_documento_id') as string | null;

        if (!archivo) throw new Error('El archivo es requerido');

        // convertimos el archivo a buffer para subirlo a storage
        const buffer = Buffer.from(await archivo.arrayBuffer());
        const extension = archivo.name.split('.').pop();
        const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const rutaStorage = `actividades/${actividadId}/${nombreUnico}`;

        // 1. subimos el archivo a storage
        const rutaGuardada = await ActividadesRepository.subirArchivoStorage(
            'documentos',
            rutaStorage,
            buffer,
            archivo.type
        );

        // 2. obtenemos los datos del usuario para llenar los campos requeridos
        const actividad = await ActividadesRepository.get_actividad_data(actividadId);

        // 3. insertamos el registro en la tabla documentos
        const docRes = await ActividadesRepository.insertarDocumento({
            actividad_id: actividadId,
            organizacion_id: actividad.organizacion_id,
            cliente_id: user.id,
            subido_por_id: user.id,
            nombre_archivo: archivo.name,
            ruta_archivo: rutaGuardada,
            categoria_documento_id: categoriId ?? undefined,
        });

        // Notificar al contador asignado
        const { UserRepository } = await import('@/core/repositories/usuarios.repository');
        const perfilCliente = await UserRepository.getPerfil(user.id);
        if (perfilCliente?.contador_id) {
            const { NotificacionesRepository } = await import('../repositories/notificaciones.repository');
            NotificacionesRepository.crearNotificacion({
                usuario_id: perfilCliente.contador_id,
                titulo: 'Nuevo Insumo de Cliente',
                mensaje: `El cliente ${perfilCliente.nombre || ''} subió "${archivo.name}" en una actividad.`,
                tipo: 'archivo',
                url_destino: `/contador/dashboard/clients/details?cliente_id=${user.id}`,
            }).catch(console.error);
        }

        return docRes;
    }

    // contador sube el entregable final y cierra la actividad como completada
    static async subirEntregable(
        actividadId: string,
        request: Request,
        formData: FormData
    ) {
        const user = await getAuthUser(request);

        const archivos = formData.getAll('archivo') as File[];
        if (!archivos || archivos.length === 0) throw new Error('Se requiere al menos un archivo entregable');

        // 1. obtenemos datos de la actividad para llenar cliente_id y organizacion_id
        const actividad = await ActividadesRepository.get_actividad_data(actividadId);

        const documentosInsertados = [];

        for (const archivo of archivos) {
            const buffer = Buffer.from(await archivo.arrayBuffer());
            const extension = archivo.name.split('.').pop();
            const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const rutaStorage = `actividades/${actividadId}/entregables/${nombreUnico}`;

            // 2. subimos el archivo a storage
            const rutaGuardada = await ActividadesRepository.subirArchivoStorage(
                'documentos',
                rutaStorage,
                buffer,
                archivo.type
            );

            // 3. insertamos el documento entregable
            const entregableDoc = await ActividadesRepository.insertarDocumento({
                actividad_id: actividadId,
                organizacion_id: actividad.organizacion_id,
                cliente_id: actividad.cliente_id,
                subido_por_id: user.id,
                nombre_archivo: archivo.name,
                ruta_archivo: rutaGuardada,
            });
            documentosInsertados.push(entregableDoc);
        }

        // 4. marcamos la actividad como completada (una sola vez)
        await ActividadesRepository.actualizarEstatus(actividadId, 'completada');

        // 5. Notificar al cliente que su actividad fue completada y tiene nuevos entregables
        if (actividad.cliente_id) {
            const { NotificacionesRepository } = await import('../repositories/notificaciones.repository');
            const mensajeExt = archivos.length > 1 
                ? `Se completó la actividad y se subieron ${archivos.length} entregables.`
                : `Se completó la actividad y se subió el entregable "${archivos[0].name}".`;

            NotificacionesRepository.crearNotificacion({
                usuario_id: actividad.cliente_id,
                titulo: 'Entregable Final Disponible',
                mensaje: mensajeExt,
                tipo: 'actividad',
                url_destino: '/cliente/dashboard/results',
            }).catch(console.error);
        }

        return documentosInsertados;
    }

    static async getResultados(request: Request) {
        const user = await getAuthUser(request);
        const { UserRepository } = await import('@/core/repositories/usuarios.repository');
        const role = await UserRepository.getRoleName(user.id);
        
        const url = new URL(request.url);
        const cliente_id = url.searchParams.get('cliente_id');
        
        if (role === 'contador') {
            if (!cliente_id) throw new Error('El cliente_id es requerido para el contador');
            const soloPendientes = url.searchParams.get('solo_pendientes') === 'true';
            if (soloPendientes) {
                return await ActividadesRepository.getPendientesByCliente(cliente_id);
            }
            return await ActividadesRepository.getResultados(cliente_id);
        }

        // Si es cliente, usa su propio ID
        return await ActividadesRepository.getResultados(user.id);
    }

    // contador consulta sus actividades asignadas
    static async getMisActividades(request: Request) {
        const user = await getAuthUser(request);
        return await ActividadesRepository.findByContador(user.id);
    }

}
