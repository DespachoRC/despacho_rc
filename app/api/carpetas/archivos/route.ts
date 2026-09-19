import { NextResponse } from 'next/server';
import { CarpetasService } from '@/core/services/carpetas.service';
import { SubirArchivoGeneralSchema } from '@/core/schemas/catalogo_carpeta.schema';

// post: cliente sube un archivo a la carpeta general sin vincular cotizacion ni actividad
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const data = await CarpetasService.subirArchivoGeneral(request, formData);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// get: obtiene los archivos generales de la carpeta del cliente
export async function GET(request: Request) {
    try {
        const data = await CarpetasService.getArchivosCliente(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
