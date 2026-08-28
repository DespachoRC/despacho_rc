import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/core/services/cotizaciones.service';
import { ResponderCotizacionSchema } from '@/core/schemas/cotizacion.schema';

// put: cliente acepta o rechaza la cotizacion enviada por el admin
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // validamos que la respuesta sea exactamente "Aceptada" o "Rechazada"
        const parsed = ResponderCotizacionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await CotizacionesService.responderCotizacion(id, parsed.data);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
