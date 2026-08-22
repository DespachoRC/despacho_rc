import { NextResponse } from 'next/server';
import { ActividadesService } from '@/lib/services/actividades.service';
import { SubirEntregableSchema } from '@/lib/dtos/actividad.schema';

// contador sube el archivo final y marca la actividad como completada
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // validamos la url y el nombre del entregable antes de insertar
        const parsed = SubirEntregableSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await ActividadesService.subirEntregable(id, parsed.data);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
