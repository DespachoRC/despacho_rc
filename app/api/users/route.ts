import { NextResponse } from 'next/server';
import { UsersService } from '@/core/services/users.service';
import { CreateUserSchema } from '@/core/schemas/users.schema';
import { createClient } from '@/core/db/server';


// post: admi un nuevo usuario (cliente o contador) en su organizacion
export async function POST(request: Request) {
    try {

        
        const body = await request.json();
        const parsed = CreateUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = await UsersService.SingUp(parsed.data, request);
        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
