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
    // cliente autenticado de supabase pasando el token recien obtenido
    const authClient = createSupabaseClient(
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

    // 1. consultamos la tabla usuarios unida a roles usando el token autenticado
    const { data: usuarioData, error: userError } = await authClient
      .from('usuarios')
      .select('rol_id, roles(nombre)')
      .eq('id', data.user.id)
      .single()

    if (usuarioData?.roles) {
      roleName = (usuarioData.roles as any).nombre
    } else if (userError) {
      console.warn("[LOGIN API] Aviso en consulta usuarios:", userError.message)
    }

    // 2. si no vino en usuarios pero rol_id esta en metadata, consulta a la tabla roles
    if (!roleName) {
      const userRolId = data.user?.user_metadata?.rol_id
      if (userRolId) {
        const { data: roleRow } = await authClient
          .from('roles')
          .select('nombre')
          .eq('id', userRolId)
          .single()

        if (roleRow?.nombre) {
          roleName = roleRow.nombre
        }
      }
    }
  } catch (err) {
    console.error("[LOGIN API] Error consultando rol:", err)
  }

  console.log(`[LOGIN API] Rol obtenido para ${email}:`, roleName)

  return NextResponse.json({
    success: true,
    user: data.user,
    role: roleName,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  }, { status: 200 })
}
