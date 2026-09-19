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

        const isActive = await UserRepository.isUserActive(data.user.id);
        if (!isActive) {
            await supabase.auth.signOut();
            // Lanza un error genérico o específico, en API_STATUS.md menciona que se puede devolver 403, 
            // el middleware o el route.ts lo pueden capturar.
            throw new Error('CUENTA_INACTIVA');
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

}
