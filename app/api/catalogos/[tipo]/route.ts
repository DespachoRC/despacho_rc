import { NextResponse } from 'next/server';
import { CatalogosService } from '@/core/services/catalogos.service';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ tipo: string }> }
) {
    try {
        const url = new URL(request.url);
        const soloActivos = url.searchParams.get('soloActivos') === 'true';
        
        // params es una promesa en next 15+ 
        const tipo = (await params).tipo;
        const data = await CatalogosService.getAll(tipo, soloActivos);
        
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('invalido') ? 400 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tipo: string }> }
) {
    try {
        const tipo = (await params).tipo;
        const body = await request.json();
        
        if (!body.nombre) {
            return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 });
        }

        const data = await CatalogosService.create(tipo, body.nombre);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        console.error("POST /api/catalogos/[tipo] error:", error);
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        const status = message.includes('invalido') ? 400 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
