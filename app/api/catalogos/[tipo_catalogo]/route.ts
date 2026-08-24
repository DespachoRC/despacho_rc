import { NextRequest, NextResponse } from 'next/server';
import { CatalogosService } from '@/lib/services/catalogos.service';
import { CrearCatalogoSchema } from '@/lib/dtos/catalogo_carpeta.schema';

// get: lista registros del catalogo — acepta query param ?activos=true
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tipo_catalogo: string }> }
) {
    try {
        const { tipo_catalogo } = await params;
        const soloActivos = request.nextUrl.searchParams.get('activos') === 'true';

        const data = await CatalogosService.getAll(tipo_catalogo, soloActivos);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        // si el catalogo no es valido devolvemos 400 en lugar de 500
        const status = message.includes('Catalogo invalido') ? 400 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}

// post: crea un nuevo registro en el catalogo indicado
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ tipo_catalogo: string }> }
) {
    try {
        const { tipo_catalogo } = await params;
        const body = await request.json();

        const parsed = CrearCatalogoSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await CatalogosService.create(tipo_catalogo, parsed.data.nombre);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('Catalogo invalido') ? 400 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
