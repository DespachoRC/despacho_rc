import { NextResponse } from 'next/server';
import { CatalogosService } from '@/core/services/catalogos.service';

export async function GET(
    request: Request,
    { params }: { params: { tipo_catalogo: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const soloActivos = searchParams.get('soloActivos') === 'true';
        
        const data = await CatalogosService.getAll(params.tipo_catalogo, soloActivos);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: any) {
        const status = error.message.includes('Catalogo invalido') ? 404 : 400;
        return NextResponse.json({ success: false, error: error.message }, { status });
    }
}
