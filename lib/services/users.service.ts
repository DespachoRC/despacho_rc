//importacion de conexion a supa 
import { createClient } from '@/lib/supabase/server';
import { CreateUserDTO } from '../dtos/users.schema';

export class UsersService {

    static async createUser(data: CreateUserDTO) {
        const supabase = await createClient();


        return { success: true, message: "Estructura del servicio lista" };
    }

}