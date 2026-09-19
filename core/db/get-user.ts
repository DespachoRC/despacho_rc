import { createClient } from './server';

export async function getAuthUser(request: Request) {
    const supabase = await createClient();

    // lee el token del header Authorization si existe (para clientes externos)
    const authHeader = request?.headers?.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined;

    // Si hay token explícito lo usamos, sino dejamos que getUser() lea las cookies automáticamente
    const { data: { user }, error } = token 
        ? await supabase.auth.getUser(token)
        : await supabase.auth.getUser();

    if (error || !user) throw new Error('Token inválido o expirado');

    return user;
}
