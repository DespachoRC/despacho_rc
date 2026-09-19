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
        return await ActividadesRepository.insertarDocumento({
            actividad_id: actividadId,
            organizacion_id: actividad.organizacion_id,
            cliente_id: user.id,
            subido_por_id: user.id,
            nombre_archivo: archivo.name,
            ruta_archivo: rutaGuardada,
            categoria_documento_id: categoriId ?? undefined,
        });
    }

    // contador sube el entregable final y cierra la actividad como completada
    static async subirEntregable(
        actividadId: string,
        request: Request,
        formData: FormData
    ) {
        const user = await getAuthUser(request);

        const archivo = formData.get('archivo') as File;
        if (!archivo) throw new Error('El archivo es requerido');

        const buffer = Buffer.from(await archivo.arrayBuffer());
        const extension = archivo.name.split('.').pop();
        const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const rutaStorage = `actividades/${actividadId}/entregables/${nombreUnico}`;

        // 1. subimos el archivo a storage
        const rutaGuardada = await ActividadesRepository.subirArchivoStorage(
            'documentos',
            rutaStorage,
            buffer,
            archivo.type
        );

        // 2. obtenemos datos de la actividad para llenar cliente_id y organizacion_id
        const actividad = await ActividadesRepository.get_actividad_data(actividadId);

        // 3. marcamos la actividad como completada
        await ActividadesRepository.actualizarEstatus(actividadId, 'completada');

        // 4. insertamos el documento entregable
        return await ActividadesRepository.insertarDocumento({
            actividad_id: actividadId,
            organizacion_id: actividad.organizacion_id,
            cliente_id: actividad.cliente_id,
            subido_por_id: user.id,
            nombre_archivo: archivo.name,
            ruta_archivo: rutaGuardada,
        });
    }

    static async getResultados(request: Request) {
        const user = await getAuthUser(request);
        return await ActividadesRepository.getResultados(user.id);
    }

    // contador consulta sus actividades asignadas
    static async getMisActividades(request: Request) {
        const user = await getAuthUser(request);
        return await ActividadesRepository.findByContador(user.id);
    }

}
