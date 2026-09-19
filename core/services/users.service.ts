import { z } from 'zod';
import { CreateAdminType, CreateUserSchema, CreateAdmin, AsignarContadorDTO } from '@/core/schemas/users.schema';
import { UserRepository } from '@/core/repositories/usuarios.repository';
import { getAuthUser } from '../db/get-user';
import { createClient } from '../db/server';

type CreateUserType = z.infer<typeof CreateUserSchema>

export class UsersService {

    static async login(email: string, password: string) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.user || !data.session) {
            throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
        }

        // verificar que el usuario este activo antes de continuar
        const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuarios')
            .select('estatus_usuarios(nombre)')
            .eq('id', data.user.id)
            .single();

        if (usuarioError) {
            await supabase.auth.signOut();
            throw new Error('No se pudo verificar el estado de la cuenta.');
        }

        const estatusNombre = (usuarioData?.estatus_usuarios as unknown as { nombre: string } | null)?.nombre;

        if (estatusNombre === 'inactivo') {
            // revocar la sesion inmediatamente para que no quede activa
            await supabase.auth.signOut();
            throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
        }

        const roleName = await UserRepository.getRoleName(
            data.user.id,
            data.user.user_metadata?.rol_id
        );

        return { ...data, roleName };
    }

    // admin crea un cliente o contador en su organizacion
    static async SingUp(data: CreateUserType, request: Request) {
        const user = await getAuthUser(request);
        const org_id = await UserRepository.get_org_id_repository(user.id);
        return await UserRepository.CrearUsuario(data, org_id);
    }

    // solo developers — registra un admin
    static async crearAdmin(adminData: CreateAdminType) {
        const validacion = CreateAdmin.safeParse(adminData);
        if (!validacion.success) {
            throw new Error(`Datos inválidos: ${validacion.error.issues[0].message}`);
        }
        return await UserRepository.crear_admin(validacion.data);
    }

    // admin lista todos los usuarios de su organizacion
    static async getAll(request: Request) {
        const user = await getAuthUser(request);
        const org_id = await UserRepository.get_org_id_repository(user.id);
        return await UserRepository.findAll(org_id);
    }

    // obtener un usuario por id
    static async getById(userId: string, request: Request) {
        await getAuthUser(request);
        return await UserRepository.findById(userId);
    }

    // listar contadores activos de la organizacion
    static async getContadoresActivos(request: Request) {
        const user = await getAuthUser(request);
        const org_id = await UserRepository.get_org_id_repository(user.id);
        return await UserRepository.findContadores(org_id);
    }

    // baja logica de un usuario
    static async bajaLogica(userId: string, request: Request) {
        await getAuthUser(request);
        return await UserRepository.softDelete(userId);
    }

    // asignar contador a un cliente
    static async asignarContador(clienteId: string, dto: AsignarContadorDTO, request: Request) {
        await getAuthUser(request);
        return await UserRepository.asignarContador(clienteId, dto.contador_id);
    }

    // obtener el perfil del usuario autenticado
    static async getPerfil(request: Request) {
        const user = await getAuthUser(request);
        return await UserRepository.getPerfil(user.id);
    }

    // Reactivación (cambiar estatus a Activo)
    static async reactivar(userId: string) {
        if (!userId) throw new Error('El ID de usuario es requerido');
        return await UserRepository.reactivar(userId);
    }

    // Obtener los clientes asignados al contador autenticado
    static async getMisClientes(request: Request) {
        const user = await getAuthUser(request);
        const role = await UserRepository.getRoleName(user.id);
        
        if (role !== 'contador') {
            throw new Error('Solo los contadores pueden ver su lista de clientes');
        }

        return await UserRepository.findMisClientes(user.id);
    }

}
