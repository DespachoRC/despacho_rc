import { createClient } from '@/lib/supabase/server';
import { SubirArchivoGeneralDTO } from '../dtos/catalogo_carpeta.schema';

// mock temporal hasta que el middleware de auth este listo
const mockClienteId = 'mock-cliente-uuid-0000-000000000000';

export class CarpetasService {

    // inserta un documento en la carpeta general sin vincular cotizacion ni actividad
    static async subirArchivoGeneral(dto: SubirArchivoGeneralDTO) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('documentos')
            .insert({
                cliente_id: mockClienteId,
                subido_por_id: mockClienteId,
                tipo_archivo_id: dto.tipo_archivo_id,
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
