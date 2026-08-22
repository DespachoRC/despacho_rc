import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/lib/services/cotizaciones.service';
import { FijarPrecioSchema } from '@/lib/dtos/cotizacion.schema';

// put: admin fija el precio y cambia estatus a enviada al cliente
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // validamos que el precio sea un numero positivo
        const parsed = FijarPrecioSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await CotizacionesService.fijarPrecio(id, parsed.data);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
