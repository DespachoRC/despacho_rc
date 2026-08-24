import { NextResponse } from 'next/server';
import { CarpetasService } from '@/lib/services/carpetas.service';
import { SubirArchivoGeneralSchema } from '@/lib/dtos/catalogo_carpeta.schema';

// post: cliente sube un archivo a la carpeta general sin vincular cotizacion ni actividad
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // validamos nombre, url y tipo antes de insertar en documentos
        const parsed = SubirArchivoGeneralSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await CarpetasService.subirArchivoGeneral(parsed.data);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
