import {z} from "zod"
import { CreateAdmin, CreateAdminType, CreateUserSchema } from '@/core/schemas/users.schema';
import {UserRepository} from "@/core/repositories/usuarios.repository"
import { getAuthUser } from "../db/get-user";

type CreateUserType = z.infer<typeof CreateUserSchema>
export class UsersService {

    static async SingUp(data: CreateUserType, request: Request) {
        const user = await getAuthUser(request);
        const org_id = await UserRepository.get_org_id_repository(user.id);
        return await UserRepository.CrearUsuario(data, org_id);
    }


    public static async crearAdmin(adminData: CreateAdminType) {
        const validacion = CreateAdmin.safeParse(adminData);

        if (!validacion.success) {
            const mensajeError = validacion.error.issues[0].message;
            throw new Error(`Datos inválidos: ${mensajeError}`);
        }

        const data = await UserRepository.crear_admin(validacion.data);

        return data;
    }
}
