import { NextResponse } from 'next/server';
import { ConversacionesService } from '@/core/services/conversaciones.service';
import { z } from 'zod';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const data = await ConversacionesService.getMensajes(id, request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

const EnviarMensajeSchema = z.object({
    contenido: z.string().min(1, 'El mensaje no puede estar vacío')
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const validacion = EnviarMensajeSchema.safeParse(body);

        if (!validacion.success) {
            return NextResponse.json({ 
                success: false, 
                error: validacion.error.issues[0].message 
            }, { status: 400 });
        }

        const data = await ConversacionesService.enviarMensaje(id, validacion.data.contenido, request);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
