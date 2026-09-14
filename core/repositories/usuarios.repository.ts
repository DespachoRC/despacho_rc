import { createClient } from "../db/server";
import { CreateAdminType, CreateUserType } from "@/core/schemas/users.schema"

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

        if (error?.message?.includes('already registered')) throw new Error('El correo electrónico ya está registrado');
        if (error?.message?.includes('password')) throw new Error('La contraseña no cumple los requisitos de seguridad');
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

        if (error?.code === 'PGRST116') throw new Error('Perfil de usuario no encontrado');
        if (error) throw new Error(`Error al obtener organización: ${error.message}`);
        if (!data?.organizacion_id) throw new Error('El usuario no tiene una organización asignada');
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

        if (error?.message?.includes('already registered')) throw new Error('El correo electrónico ya está registrado');
        if (error?.message?.includes('Database error')) throw new Error('Error interno al crear el perfil del administrador');
        if (error) throw new Error(`Error al registrar: ${error.message}`);
        return data;
    }

    // listar todos los usuarios de una organizacion
    public static async findAll(organizacionId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido_paterno, apellido_materno, email, rfc, rol_id, contador_id, estatus_id, fecha_creacion')
            .eq('organizacion_id', organizacionId)
            .order('fecha_creacion', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    // obtener un usuario por id
    public static async findById(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido_paterno, apellido_materno, email, rfc, rol_id, contador_id, estatus_id, fecha_creacion')
            .eq('id', userId)
            .single();

        if (error?.code === 'PGRST116') throw new Error('Usuario no encontrado');
        if (error) throw new Error(error.message);
        return data;
    }

    // listar contadores activos de una organizacion
    public static async findContadores(organizacionId: string) {
        const supabase = await createClient();
        const { data: rolData, error: rolError } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', 'contador')
            .single();

        if (rolError || !rolData) throw new Error('Rol contador no encontrado');

        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido_paterno, apellido_materno, email')
            .eq('organizacion_id', organizacionId)
            .eq('rol_id', rolData.id);

        if (error) throw new Error(error.message);
        return data;
    }

    // baja logica — cambia estatus a inactivo
    public static async softDelete(userId: string) {
        const supabase = await createClient();

        const { data: estatusData, error: estatusError } = await supabase
            .from('estatus_usuarios')
            .select('id')
            .eq('nombre', 'inactivo')
            .single();

        if (estatusError || !estatusData) throw new Error('Estatus inactivo no encontrado');

        const { data, error } = await supabase
            .from('usuarios')
            .update({ estatus_id: estatusData.id })
            .eq('id', userId)
            .select()
            .single();

        if (error?.code === 'PGRST116') throw new Error('Usuario no encontrado');
        if (error) throw new Error(error.message);
        return data;
    }

    // asignar contador a un cliente
    public static async asignarContador(clienteId: string, contadorId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('usuarios')
            .update({ contador_id: contadorId })
            .eq('id', clienteId)
            .select()
            .single();

        if (error?.code === 'PGRST116') throw new Error('Cliente no encontrado');
        if (error) throw new Error(error.message);
        return data;
    }

}