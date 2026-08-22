import { NextResponse } from 'next/server';
import { ActividadesService } from '@/lib/services/actividades.service';
import { ActualizarEstatusSchema } from '@/lib/dtos/actividad.schema';

// contador actualiza el estatus de la actividad a en_proceso o bloqueada
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // validamos que el estatus recibido sea uno de los valores permitidos
        const parsed = ActualizarEstatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await ActividadesService.actualizarEstatus(id, parsed.data);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
