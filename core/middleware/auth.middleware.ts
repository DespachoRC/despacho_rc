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

    // Si no hay usuario y trata de entrar a rutas protegidas
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/cliente') || pathname.startsWith('/contador'))) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Si hay usuario obtenemos su rol
    if (user) {
        const { data: userData } = await supabase.from('usuarios').select('roles(nombre)').eq('id', user.id).single();
        // @ts-ignore
        const role = userData?.roles?.nombre;

        // Si intenta entrar al login o a la raiz, lo mandamos a su dashboard correspondiente
        if (pathname.startsWith('/auth/login') || pathname === '/') {
            if (role === 'admin') return NextResponse.redirect(new URL('/dashboard/metrics', request.url));
            if (role === 'contador') return NextResponse.redirect(new URL('/contador/dashboard/clients', request.url));
            if (role === 'cliente') return NextResponse.redirect(new URL('/cliente/dashboard/upload', request.url));
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Restricción de rutas por rol
        const isDashboardAdmin = pathname.startsWith('/dashboard');
        const isClienteView = pathname.startsWith('/cliente');
        const isContadorView = pathname.startsWith('/contador');

        if (isDashboardAdmin && role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (isClienteView && role !== 'cliente') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (isContadorView && role !== 'contador') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    return response
}

export const authMiddlewareConfig = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
