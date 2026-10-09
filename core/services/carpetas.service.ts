import { createClient } from '@/core/db/server';
import { getAuthUser } from '@/core/db/get-user';
import { SubirArchivoGeneralDTO } from '../schemas/catalogo_carpeta.schema';

export class CarpetasService {

    // inserta un documento en la carpeta general sin vincular cotizacion ni actividad
    static async subirArchivoGeneral(request: Request, formData: FormData) {
        const user = await getAuthUser(request);
        const supabase = await createClient();

        const archivo = formData.get('archivo') as File;
        const tipoArchivoId = formData.get('tipo_archivo_id') as string | null;
        const clienteIdParam = formData.get('cliente_id') as string | null;

        if (!archivo) throw new Error('El archivo es requerido');

        // Si mandamos cliente_id (ej. contador), lo usamos. Si no, usamos el del usuario (ej. cliente)
        const cliente_id = clienteIdParam || user.id;

        // Convertir y subir a storage
        const buffer = Buffer.from(await archivo.arrayBuffer());
        const extension = archivo.name.split('.').pop();
        const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const rutaStorage = `carpetas_generales/${cliente_id}/${nombreUnico}`;

        const { ActividadesRepository } = await import('@/core/repositories/actividades.repository');
        
        const rutaGuardada = await ActividadesRepository.subirArchivoStorage(
            'documentos',
            rutaStorage,
            buffer,
            archivo.type
        );

        const { UserRepository } = await import('@/core/repositories/usuarios.repository');
        const org_id = await UserRepository.get_org_id_repository(user.id);

        let carpeta_id = null;
        const { data: carpetaData } = await supabase
            .from('carpetas')
            .select('id')
            .eq('cliente_id', cliente_id)
            .limit(1)
            .single();

        if (carpetaData) {
            carpeta_id = carpetaData.id;
        } else {
            const { data: nuevaCarpeta, error: errCarpeta } = await supabase
                .from('carpetas')
                .insert({
                    cliente_id: cliente_id,
                    organizacion_id: org_id,
                    nombre: 'General'
                })
                .select()
                .single();
            if (errCarpeta) throw new Error('Error al crear carpeta destino: ' + errCarpeta.message);
            carpeta_id = nuevaCarpeta.id;
        }

        const { data, error } = await supabase
            .from('documentos')
            .insert({
                cliente_id: cliente_id,
                organizacion_id: org_id,
                subido_por_id: user.id,
                categoria_documento_id: tipoArchivoId ?? null,
                nombre_archivo: archivo.name,
                ruta_archivo: rutaGuardada,
                carpeta_id: carpeta_id
                // actividad_id va nulo
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Notificación condicional:
        // Si lo subió el cliente, verificamos si tiene contador asignado
        if (user.id === cliente_id) {
            const { UserRepository } = await import('@/core/repositories/usuarios.repository');
            const { NotificacionesRepository } = await import('@/core/repositories/notificaciones.repository');
            const perfilCliente = await UserRepository.getPerfil(cliente_id);

            const nombreCliente = `${perfilCliente.nombre || 'Cliente'} ${perfilCliente.apellido_paterno || ''}`.trim();

            if (perfilCliente?.contador_id) {
                // Notificar al contador asignado
                NotificacionesRepository.crearNotificacion({
                    usuario_id: perfilCliente.contador_id,
                    titulo: 'Nuevo Documento en Carpeta',
                    mensaje: `${nombreCliente} subió "${archivo.name}" a su carpeta general.`,
                    tipo: 'archivo',
                    url_destino: `/contador/dashboard/clients/details?cliente_id=${cliente_id}`,
                }).catch(console.error);
            } else {
                // Notificar a admins si el cliente aún no tiene contador
                NotificacionesRepository.crearNotificacionParaAdmins({
                    titulo: 'Nuevo Documento (Sin Contador)',
                    mensaje: `${nombreCliente} subió "${archivo.name}" a su carpeta general.`,
                    tipo: 'archivo',
                    url_destino: '/admin/dashboard/folders',
                }, org_id).catch(console.error);
            }
        }

        return data;
    }
    // admin consulta las carpetas de todos los clientes agrupados por contador
    static async getArchivosGenerales(request: Request) {
        const user = await getAuthUser(request);
        const { UserRepository } = await import('@/core/repositories/usuarios.repository');
        const role = await UserRepository.getRoleName(user.id);
        
        if (role !== 'admin' && role !== 'owner') {
            throw new Error('No tienes permisos para ver las carpetas generales del despacho');
        }

        const org_id = await UserRepository.get_org_id_repository(user.id);
        const { CarpetasRepository } = await import('@/core/repositories/carpetas.repository');
        return await CarpetasRepository.getCarpetasAdmin(org_id);
    }

    // obtiene los archivos de la carpeta general de un cliente
    static async getArchivosCliente(request: Request) {
        const user = await getAuthUser(request);
        const { UserRepository } = await import('@/core/repositories/usuarios.repository');
        const role = await UserRepository.getRoleName(user.id);
        
        const url = new URL(request.url);
        const cliente_id = url.searchParams.get('cliente_id');
        
        // Si el usuario no es cliente, obligamos a pasar el cliente_id
        const targetClienteId = role === 'cliente' ? user.id : cliente_id;

        if (!targetClienteId) {
            throw new Error('Se requiere especificar un cliente_id');
        }

        const supabase = await createClient();
        
        // Buscamos documentos sin actividad asignada
        const { data, error } = await supabase
            .from('documentos')
            .select(`
                id,
                nombre_archivo,
                ruta_archivo,
                fecha_subida,
                categoria_documento_id,
                categoria_documentos ( id, nombre )
            `)
            .eq('cliente_id', targetClienteId)
            .is('actividad_id', null)
            .order('fecha_subida', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }
}
