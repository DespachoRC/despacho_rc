import { createClient } from '../db/server';
import { getAuthUser } from '../db/get-user';

export class DocumentosService {
    
    // Generar una URL firmada segura de descarga por 60 segundos
    static async generarUrlFirmada(documentoId: string, request: Request) {
        // Validamos autenticacion
        await getAuthUser(request);
        const supabase = await createClient();

        // Obtener el documento para conocer su ruta
        // RLS protegerá esta query para que solo el propietario o el contador puedan ver el registro.
        const { data: documento, error: docError } = await supabase
            .from('documentos')
            .select('ruta_archivo')
            .eq('id', documentoId)
            .single();

        if (docError || !documento) {
            throw new Error('Documento no encontrado o no tienes permiso para acceder a él');
        }

        // Generar la URL firmada de Storage válida por 60 segundos
        const { data, error } = await supabase.storage
            .from('documentos')
            .createSignedUrl(documento.ruta_archivo, 60);

        if (error || !data) {
            throw new Error('No se pudo generar el enlace de descarga seguro');
        }

        return data.signedUrl;
    }
}
