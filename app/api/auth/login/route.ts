import { UsersService } from '@/core/services/users.service'
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

  try {
    const { user, session, roleName } = await UsersService.login(email, password)

    return NextResponse.json({
      success: true,
      user,
      role: roleName,
      access_token: session.access_token,
      refresh_token: session.refresh_token
    }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión.'
    const status = message.startsWith('Credenciales inválidas') ? 401 : 403
    return NextResponse.json({ error: message }, { status })
  }
}
