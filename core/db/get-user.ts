import { createClient } from './server';

export async function getAuthUser(request: Request) {
    const supabase = await createClient();

    // lee el token del header Authorization: Bearer <token>
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('No autenticado');
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) throw new Error('Token inválido o expirado');

    return user;
}
