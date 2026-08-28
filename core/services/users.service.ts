//importacion de conexion a supa 
import { createClient } from '@/core/db/server';
import { CreateUserDTO } from '../schemas/users.schema';

export class UsersService {

    static async createUser(data: CreateUserDTO) {
        const supabase = await createClient();


        return { success: true, message: "Estructura del servicio lista" };
    }

}