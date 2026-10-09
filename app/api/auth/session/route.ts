import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/session
 * Recibe { access_token, refresh_token } en el body y los persiste como
 * cookies HttpOnly de Supabase para que el middleware pueda leer la sesión.
 * Esto es necesario porque /api/auth/login devuelve los tokens en el body
 * pero no los setea como cookies — este endpoint cierra esa brecha.
 */
export async function POST(request: NextRequest) {
    try {
        const { access_token, refresh_token } = await request.json()

        if (!access_token || !refresh_token) {
            return NextResponse.json(
                { error: 'access_token y refresh_token son requeridos' },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { error } = await supabase.auth.setSession({ access_token, refresh_token })

        if (error) {
            return NextResponse.json(
                { error: 'Sesión inválida: ' + error.message },
                { status: 401 }
            )
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch {
        return NextResponse.json(
            { error: 'Error interno al establecer la sesión' },
            { status: 500 }
        )
    }
}
