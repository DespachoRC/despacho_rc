import { createClient } from '@/core/db/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true, message: 'Sesión cerrada' }, { status: 200 })
}
