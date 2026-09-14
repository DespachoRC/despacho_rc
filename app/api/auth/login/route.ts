import { createClient } from '@/core/db/server'
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

  // consultamos el nombre del rol del usuario autenticado en la base de datos
  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('roles(nombre)')
    .eq('id', data.user.id)
    .single()

  const roleName = (usuarioData as any)?.roles?.nombre ?? null

  return NextResponse.json({
    success: true,
    user: data.user,
    role: roleName,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  }, { status: 200 })
}
