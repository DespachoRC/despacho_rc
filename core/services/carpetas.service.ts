import { createClient } from '@/core/db/server';
import { getAuthUser } from '@/core/db/get-user';
import { SubirArchivoGeneralDTO } from '../schemas/catalogo_carpeta.schema';

export class CarpetasService {

    // inserta un documento en la carpeta general sin vincular cotizacion ni actividad
    static async subirArchivoGeneral(dto: SubirArchivoGeneralDTO, request: Request) {
        const user = await getAuthUser(request);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('documentos')
            .insert({
                cliente_id: user.id,
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
}

