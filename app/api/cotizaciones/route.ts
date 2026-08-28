import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/core/services/cotizaciones.service';
import { CreateCotizacionSchema } from '@/core/schemas/cotizacion.schema';

// get: admin obtiene las cotizaciones pendientes de cotizar
export async function GET() {
    try {
        const data = await CotizacionesService.getPendientes();
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// post: cliente genera una nueva solicitud con uno o mas servicios
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // validamos el cuerpo de la solicitud con zod
        const parsed = CreateCotizacionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await CotizacionesService.createCotizacion(parsed.data);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
