// TODO: extraer aquí todas las queries de Supabase de usuarios.service.ts
// Métodos esperados:
//   - findAll()
//   - findContadores()
//   - create(data)
//   - softDelete(userId)
//   - asignarContador(clienteId, contadorId)
import { z } from "zod";
import { createClient } from "../db/server";
import { CreateAdminType, CreateUserType} from "@/core/schemas/users.schema"

export class UserRepository {

    public static async CrearUsuario(userData: CreateUserType, org_id: string) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    nombre: userData.nombre,
                    apellido_paterno: userData.apellido_paterno,
                    apellido_materno: userData.apellido_materno ?? null,
                    organizacion_id: org_id,
                    rfc: userData.rfc,
                    regimen_fiscal_id: userData.regimen_fiscal_id ?? null,
                    rol_id: userData.rol_id,
                    contador_id: userData.contador_id ?? null,
                }
            }
        });

        // email ya registrado
        if (error?.message?.includes('already registered')) {
            throw new Error('El correo electrónico ya está registrado');
        }

        // contraseña debil segun politica de supabase
        if (error?.message?.includes('password')) {
            throw new Error('La contraseña no cumple los requisitos de seguridad');
        }

        if (error) throw new Error(`Error al crear usuario: ${error.message}`);

        return data;
    }


    public static async get_org_id_repository(userid: string): Promise<string> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('usuarios')
            .select('organizacion_id')
            .eq('id', userid)
            .single();

        // usuario autenticado pero sin perfil en la tabla usuarios
        if (error?.code === 'PGRST116') {
            throw new Error('Perfil de usuario no encontrado');
        }

        if (error) throw new Error(`Error al obtener organización: ${error.message}`);

        if (!data?.organizacion_id) {
            throw new Error('El usuario no tiene una organización asignada');
        }

        return data.organizacion_id;
    }


    public static async crear_admin(adminData: CreateAdminType) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
            email: adminData.email,
            password: adminData.password,
            options: {
                data: {
                    nombre: adminData.nombre,
                    apellido_paterno: adminData.apellido_paterno,
                    apellido_materno: adminData.apellido_materno ?? null,
                    rol_id: adminData.rol_id,
                }
            }
        });

        // email ya registrado
        if (error?.message?.includes('already registered')) {
            throw new Error('El correo electrónico ya está registrado');
        }

        // error del trigger al insertar en public.usuarios
        if (error?.message?.includes('Database error')) {
            throw new Error('Error interno al crear el perfil del administrador');
        }

        if (error) throw new Error(`Error al registrar: ${error.message}`);

        return data;
    }

}