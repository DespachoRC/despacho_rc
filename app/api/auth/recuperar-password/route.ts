import { createClient } from '@/core/db/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'El correo es requerido' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/nueva-password`,
        })

        if (error) throw new Error(error.message)

        // siempre respondemos success aunque el email no exista
        // para no revelar si un correo está registrado o no
        return NextResponse.json(
            { success: true, message: 'Si el correo existe recibirás un enlace de recuperación' },
            { status: 200 }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
