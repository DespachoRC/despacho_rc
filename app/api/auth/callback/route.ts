import { createClient } from '@/core/db/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Solo permitimos la ruta de restablecimiento; no redirigimos a destinos
    // arbitrarios proporcionados en el query string.
    const next = '/auth/update-password'

    if (!code) {
        const errorCode = searchParams.get('error_code') ?? searchParams.get('error') ?? 'no_code'
        return NextResponse.redirect(`${origin}${next}?error_code=${encodeURIComponent(errorCode)}`)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(`${origin}${next}?error_code=invalid_code`)
    }

    // Código canjeado exitosamente — redirigir a la página de nueva contraseña
    return NextResponse.redirect(`${origin}${next}`)
}
