import { NextResponse } from 'next/server';
import { UsuariosService } from '@/lib/services/usuarios.service';
import { AsignarContadorSchema } from '@/lib/dtos/usuarios.schema';

// put: admin asigna o reasigna el contador responsable de un cliente
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // validamos que el contador_id sea un uuid valido
        const parsed = AsignarContadorSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await UsuariosService.asignarContador(id, parsed.data);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
