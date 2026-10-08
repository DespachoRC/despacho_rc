import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'El correo es requerido' },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()

        // Usamos flowType: 'implicit' para que Supabase envíe el token directamente
        // en el hash fragment de la URL (#access_token=...&type=recovery)
        // en lugar de un código PKCE que Gmail consume antes de que llegue al usuario.
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookieOptions: {
                    // flowType implicit no requiere code verifier en cookies
                },
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { /* server component */ }
                    },
                },
                auth: {
                    flowType: 'implicit',
                },
            }
        )

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/auth/update-password`,
        })

        if (error) throw new Error(error.message)

        // Siempre respondemos success para no revelar si el correo existe
        return NextResponse.json(
            { success: true },
            { status: 200 }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
