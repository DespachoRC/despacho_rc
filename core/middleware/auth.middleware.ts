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
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/cliente') || pathname.startsWith('/contador') || pathname.startsWith('/superadmin'))) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Si hay usuario obtenemos su rol
    if (user) {
        let role: string | undefined = undefined;

        try {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('rol_id, roles(nombre)')
                .eq('id', user.id)
                .maybeSingle();

            let roleRaw: string | undefined = undefined;
            if (userData?.roles) {
                roleRaw = Array.isArray(userData.roles)
                    ? (userData.roles as any)[0]?.nombre
                    : (userData.roles as any)?.nombre;
            }

            if (!roleRaw && userData?.rol_id) {
                const { data: roleData } = await supabase
                    .from('roles')
                    .select('nombre')
                    .eq('id', userData.rol_id)
                    .maybeSingle();
                roleRaw = roleData?.nombre;
            }

            if (roleRaw) {
                role = String(roleRaw).toLowerCase().trim();
            }
        } catch {
            // Ignorar errores en la consulta de rol para evitar bloqueos
        }

        // Si intenta entrar al login o a la raiz, lo mandamos a su dashboard correspondiente
        if (pathname.startsWith('/auth/login') || pathname === '/') {
            if (role === 'owner' || role?.includes('owner')) return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
            if (role === 'admin' || role?.includes('admin')) return NextResponse.redirect(new URL('/dashboard/metrics', request.url));
            if (role === 'contador' || role?.includes('contador')) return NextResponse.redirect(new URL('/contador/dashboard/clients', request.url));
            if (role === 'cliente' || role?.includes('cliente')) return NextResponse.redirect(new URL('/cliente/dashboard/upload', request.url));
            
            if (pathname === '/') {
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }
            return response;
        }

        // Restricción de rutas por rol
        const isSuperadminView = pathname.startsWith('/superadmin');
        const isDashboardAdmin = pathname.startsWith('/dashboard');
        const isClienteView = pathname.startsWith('/cliente');
        const isContadorView = pathname.startsWith('/contador');

        if (!role) {
            // Si el rol es desconocido o no se pudo cargar, mandarlo a login para restablecer sesión
            if (isSuperadminView || isDashboardAdmin || isClienteView || isContadorView) {
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }
        } else {
            const matchesRole = (targetRole: string) => role === targetRole || role!.includes(targetRole);

            if (isSuperadminView && !matchesRole('owner')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
            if (isDashboardAdmin && !matchesRole('admin')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
            if (isClienteView && !matchesRole('cliente')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
            if (isContadorView && !matchesRole('contador')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }
    }

    return response
}

export const authMiddlewareConfig = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
