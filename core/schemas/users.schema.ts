import { z } from 'zod';

// para admin cuando inserte un nuevo cliente o conta

export const CreateUserSchema = z.object({
    nombre: z.string().min(2, "El nombre es obligatorio"),
    apellido_paterno: z.string().min(2, "El apellido es obligatorio"),
    apellido_materno: z.string().optional(),
    email: z.string().email("Formato de correo inválido"),
    password: z.string()
    .min(6,"La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
    rfc: z.string().max(25, "El RFC no puede exceder los 25 caracteres"),
    rol_id: z.string().uuid("El ID del rol debe ser un identificador válido"),
    regimen_fiscal_id: z.string().optional(),
    contador_id: z.string().optional(),
    organizacion_id: z.string().optional()
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;


export const CreateAdmin = z.object({
    nombre: z.string().min(2, "El nombre es obligatorio"),
    apellido_paterno: z.string().min(2, "El apellido es obligatorio"),
    apellido_materno: z.string().optional(),
    email: z.string().email("Formato de correo inválido"),
    rol_id: z.string(),
    password: z.string()
    .min(6,"La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
})

export type CreateAdminType = z.infer<typeof CreateAdmin>

// para asignar un contador a un cliente
export const AsignarContadorSchema = z.object({
    contador_id: z.string().uuid("El ID del contador debe ser un identificador válido"),
});

export type AsignarContadorDTO = z.infer<typeof AsignarContadorSchema>;