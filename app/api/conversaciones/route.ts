import { NextResponse } from 'next/server';
import { ConversacionesService } from '@/core/services/conversaciones.service';
import { z } from 'zod';

export async function GET(request: Request) {
    try {
        const data = await ConversacionesService.getConversaciones(request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

const CreateConversacionSchema = z.object({
    tipo: z.enum(['contador_cliente', 'cliente_admin']),
    contraparteId: z.string().uuid()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validacion = CreateConversacionSchema.safeParse(body);

        if (!validacion.success) {
            return NextResponse.json({ 
                success: false, 
                error: validacion.error.issues[0].message 
            }, { status: 400 });
        }

        const { tipo, contraparteId } = validacion.data;
        const data = await ConversacionesService.crearConversacion(tipo, contraparteId, request);

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
