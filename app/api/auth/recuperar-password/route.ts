import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/core/db/server'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'El correo es requerido' },
                { status: 400 }
            )
        }

        // @supabase/ssr usa PKCE por defecto. El code verifier se guarda en
        // una cookie que el callback necesita para canjear el código del correo.
        const supabase = await createClient()

        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin)
            .replace(/\/$/, '')

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/api/auth/callback?next=/auth/update-password`,
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
