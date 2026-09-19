import { NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import { getAuthUser } from '@/core/db/get-user';

export async function GET(request: Request) {
    try {
        await getAuthUser(request); // Solo usuarios autenticados
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('roles')
            .select('id, nombre');
            
        if (error) throw new Error(error.message);
        
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
