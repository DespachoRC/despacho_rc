import { NextResponse } from 'next/server';
import { UsuariosService } from '@/lib/services/usuarios.service';
import { CrearUsuarioSchema } from '@/lib/dtos/usuarios.schema';

// post: admin crea un nuevo cliente o contador en el sistema
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // validamos campos base y la regla cruzada de rol vs campos opcionales
        const parsed = CrearUsuarioSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await UsuariosService.createUsuario(parsed.data);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
