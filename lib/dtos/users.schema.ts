import { z } from 'zod';

// para admin cuando inserte un nuevo cliente o conta

export const CreateUserSchema = z.object({
    email: z.string().email("Formato de correo inválido"),
    nombre: z.string().min(2, "El nombre es obligatorio"),
    apellido_paterno: z.string().min(2, "El apellido es obligatorio"),
    rfc: z.string().max(25, "El RFC no puede exceder los 25 caracteres").optional(),
    rol_id: z.string().uuid("El ID del rol debe ser un identificador válido"),
    regimen_fiscal_id: z.string().uuid().optional(),
    // sin organizacionid para sacarlo del token de admin por seguridad y no del formulario
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;