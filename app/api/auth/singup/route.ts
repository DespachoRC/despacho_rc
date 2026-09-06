import { NextResponse } from "next/server";
import {UsersService} from "@/core/services/users.service"
import { Schema } from "zod";
import {CreateUserSchema} from "@/core/schemas/users.schema"

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const resultado = await UsersService.crearAdmin(body);

        return NextResponse.json(
            { 
                success: true, 
                message: "Administrador registrado. Por favor verifica el correo electrónico.",
                data: resultado 
            },
            { status: 201 }
        );
    }

    catch (error:any) {
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || "Ocurrió un error inesperado" 
            },
            { status: 400 }
        );
    }


}