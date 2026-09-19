import { createClient } from '@/core/db/server';
import { getAuthUser } from '@/core/db/get-user';
import { SubirArchivoGeneralDTO } from '../schemas/catalogo_carpeta.schema';

export class CarpetasService {

    // inserta un documento en la carpeta general sin vincular cotizacion ni actividad
    static async subirArchivoGeneral(dto: SubirArchivoGeneralDTO, request: Request) {
        const user = await getAuthUser(request);
        const supabase = await createClient();

        // Si mandamos cliente_id (ej. contador), lo usamos. Si no, usamos el del usuario (ej. cliente)
        const cliente_id = dto.cliente_id || user.id;

        const { data, error } = await supabase
            .from('documentos')
            .insert({
                cliente_id: cliente_id,
                subido_por_id: user.id,
                categoria_documento_id: dto.tipo_archivo_id ?? null,
                nombre_archivo: dto.nombre_archivo,
                ruta_archivo: dto.url_archivo,
                // cotizacion_id y actividad_id van como nulos en carpeta general
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
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

