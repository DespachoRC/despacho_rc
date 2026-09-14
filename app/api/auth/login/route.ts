import { createClient } from '@/core/db/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Correo y contraseña son requeridos.' },
      { status: 400 }
    )
  }

  if (email.toLowerCase() === password.toLowerCase()) {
    return NextResponse.json(
      { error: 'La contraseña no puede ser igual al correo' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json(
      { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
      { status: 401 }
    )
  }

  let roleName: string | null = null

  try {
    // cliente autenticado con el token del usuario — para consultar sus propios datos (respeta RLS)
    const userClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`
          }
        }
      }
    )

    // cliente admin con service_role — solo para leer la tabla de referencia 'roles' (server-side)
    // esta clave nunca sale del servidor, no tiene prefijo NEXT_PUBLIC_
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // paso 1: obtener el rol_id del usuario desde la tabla usuarios (con token de usuario)
    const { data: usuarioData, error: usuarioError } = await userClient
      .from('usuarios')
      .select('rol_id')
      .eq('id', data.user.id)
      .single()

    console.log('[LOGIN API] usuarioData:', usuarioData, '| error:', usuarioError?.message)

    const rolId = usuarioData?.rol_id ?? data.user?.user_metadata?.rol_id ?? null

    if (rolId) {
      // paso 2: buscar el nombre del rol en la tabla roles (con cliente admin para evitar RLS)
      const { data: roleRows, error: roleError } = await adminClient
        .from('roles')
        .select('nombre')
        .eq('id', rolId)
        .limit(1)

      console.log('[LOGIN API] roleRows:', roleRows, '| error:', roleError?.message)

      if (roleRows && roleRows.length > 0 && roleRows[0]?.nombre) {
        roleName = roleRows[0].nombre
      }
    }
  } catch (err) {
    console.error('[LOGIN API] Error consultando rol:', err)
  }

  console.log(`[LOGIN API] Rol final para ${email}:`, roleName)

  return NextResponse.json({
    success: true,
    user: data.user,
    role: roleName,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  }, { status: 200 })
}
