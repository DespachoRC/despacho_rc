import { createClient } from '@/lib/supabase/server';
import { AsignarContadorDTO, CrearUsuarioDTO } from '../dtos/usuarios.schema';

export class UsuariosService {

    // buscamos el uuid del rol en el catalogo por su nombre
    private static async getRolId(nombreRol: string): Promise<string> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', nombreRol)
            .single();

        if (error || !data) throw new Error(`Rol no encontrado en catalogo: ${nombreRol}`);
        return data.id as string;
    }

    // inserta el perfil publico del usuario — el password se ignora en BD por ahora
    static async createUsuario(dto: CrearUsuarioDTO) {
        const supabase = await createClient();
        const rolId = await this.getRolId(dto.rol);

        const { data, error } = await supabase
            .from('usuarios')
            .insert({
                email: dto.email,
                nombre: dto.nombre,
                rol_id: rolId,
                regimen_fiscal_id: dto.regimen_fiscal_id ?? null,
                especialidad_id: dto.especialidad_id ?? null,
                activo: true,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // retorna los contadores activos con su nombre de especialidad para la vista de asignacion
    static async getContadoresActivos() {
        const supabase = await createClient();
        const rolId = await this.getRolId('contador');

        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, especialidades_contadores(nombre)')
            .eq('rol_id', rolId)
            .eq('activo', true)
            .order('nombre', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    // asigna o reasigna el contador responsable de un cliente
    static async asignarContador(clienteId: string, dto: AsignarContadorDTO) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('usuarios')
            .update({ contador_id: dto.contador_id })
            .eq('id', clienteId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // baja logica: marca el usuario como inactivo sin eliminarlo de la BD
    static async bajaLogica(usuarioId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('usuarios')
            .update({ activo: false })
            .eq('id', usuarioId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}
