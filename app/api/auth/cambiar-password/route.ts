import { createClient } from '@/core/db/server'
import { getAuthUser } from '@/core/db/get-user'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // verificamos que el usuario este autenticado
        const user = await getAuthUser(request)

        const { password_actual, password_nueva } = await request.json()

        if (!password_actual || !password_nueva) {
            return NextResponse.json(
                { success: false, error: 'La contraseña actual y la nueva son requeridas' },
                { status: 400 }
            )
        }

        if (password_nueva.length < 8) {
            return NextResponse.json(
                { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' },
                { status: 400 }
            )
        }

        if (password_actual === password_nueva) {
            return NextResponse.json(
                { success: false, error: 'La nueva contraseña no puede ser igual a la actual' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // verificamos que la contraseña actual sea correcta
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password_actual,
        })

        if (loginError) {
            return NextResponse.json(
                { success: false, error: 'La contraseña actual es incorrecta' },
                { status: 401 }
            )
        }

        // actualizamos la contraseña
        const { error } = await supabase.auth.updateUser({ password: password_nueva })

        if (error) throw new Error(error.message)

        return NextResponse.json(
            { success: true, message: 'Contraseña actualizada correctamente' },
            { status: 200 }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
