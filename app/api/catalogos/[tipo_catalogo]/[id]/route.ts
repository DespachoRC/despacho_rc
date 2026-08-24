import { NextRequest, NextResponse } from 'next/server';
import { CatalogosService } from '@/lib/services/catalogos.service';
import { ToggleEstatusSchema } from '@/lib/dtos/catalogo_carpeta.schema';

// patch: activa o desactiva un registro del catalogo (soft delete o reactivacion)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ tipo_catalogo: string; id: string }> }
) {
    try {
        const { tipo_catalogo, id } = await params;
        const body = await request.json();

        // validamos que el campo activo sea un booleano explicito
        const parsed = ToggleEstatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await CatalogosService.toggleEstatus(tipo_catalogo, id, parsed.data.activo);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('Catalogo invalido') ? 400 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
