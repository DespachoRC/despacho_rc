import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refresca la sesion y la persiste en cookies
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // si el usuario no esta autenticado y accede a una ruta protegida, redirige al login
    if (!user && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // si el usuario ya esta autenticado y accede al login, redirige al dashboard
    if (user && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const authMiddlewareConfig = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
