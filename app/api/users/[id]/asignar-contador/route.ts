import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';
import { AsignarContadorSchema } from '@/core/schemas/users.schema';

// put: admin asigna o reasigna el contador responsable de un cliente
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const parsed = AsignarContadorSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await UsersService.asignarContador(id, parsed.data, request);
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/users/[id]/asignar-contador error:", error);
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
