import { createClient } from '@/core/db/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/auth/update-password'

    if (!code) {
        return NextResponse.redirect(`${origin}/auth/update-password?error=no_code`)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(`${origin}/auth/update-password?error=invalid_code`)
    }

    // Código canjeado exitosamente — redirigir a la página de nueva contraseña
    return NextResponse.redirect(`${origin}${next}`)
}
