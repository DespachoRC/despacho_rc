import { createClient } from '../db/server';
import { getAuthUser } from '../db/get-user';

export class DocumentosService {
    
    // Generar una URL firmada segura de descarga por 60 segundos
    static async generarUrlFirmada(documentoId: string, request: Request) {
        await getAuthUser(request);
        const supabase = await createClient();

        console.log(">> generarUrlFirmada called with ID:", documentoId);

        const { data: documento, error: docError } = await supabase
            .from('documentos')
            .select('ruta_archivo')
            .eq('id', documentoId)
            .single();

        console.log(">> DB Result:", { documento, docError });

        if (docError || !documento) {
            throw new Error('Documento no encontrado o no tienes permiso para acceder a él');
        }

        console.log(">> Calling createSignedUrl for:", documento.ruta_archivo);

        const { data, error } = await supabase.storage
            .from('documentos')
            .createSignedUrl(documento.ruta_archivo, 60);

        if (error || !data) {
            console.error("Storage Signed URL Error:", error);
            throw new Error(`No se pudo generar el enlace de descarga seguro: ${error?.message || 'Error desconocido'}`);
        }

        console.log(">> Signed URL Success:", data.signedUrl);
        return data.signedUrl;
    }
}
