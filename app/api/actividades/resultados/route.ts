import { NextResponse } from 'next/server';
import { ActividadesService } from '@/core/services/actividades.service';

// cliente consulta sus actividades con estatus y urls de descarga si estan listas
export async function GET(request: Request) {
    try {
        const data = await ActividadesService.getResultados(request);
        if (data && data.length > 0) {
            const fs = require('fs');
            fs.writeFileSync('debug.json', JSON.stringify({
                cliente_id: data[0].cliente_id,
                documentos: data[0].documentos
            }, null, 2));
        }
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
