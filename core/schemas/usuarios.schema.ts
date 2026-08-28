import { z } from 'zod';

// schema de creacion de usuario — aplica validacion cruzada segun el rol
export const CrearUsuarioSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("El formato del correo no es valido"),
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
    rol: z.enum(['cliente', 'contador'] as const, {
        error: "El rol debe ser 'cliente' o 'contador'",
    }),
    regimen_fiscal_id: z.string().uuid("El regimen_fiscal_id debe ser un uuid valido").optional(),
    especialidad_id: z.string().uuid("La especialidad_id debe ser un uuid valido").optional(),
}).superRefine((data, ctx) => {
    // si el rol es cliente, el regimen fiscal es obligatorio
    if (data.rol === 'cliente' && !data.regimen_fiscal_id) {
        ctx.addIssue({
            code: 'custom',
            message: 'el regimen_fiscal_id es requerido cuando el rol es cliente',
            path: ['regimen_fiscal_id'],
        });
    }
    // si el rol es contador, la especialidad es obligatoria
    if (data.rol === 'contador' && !data.especialidad_id) {
        ctx.addIssue({
            code: 'custom',
            message: 'la especialidad_id es requerida cuando el rol es contador',
            path: ['especialidad_id'],
        });
    }
});

// schema para asignar o reasignar un contador a un cliente
export const AsignarContadorSchema = z.object({
    contador_id: z.string().uuid("El contador_id debe ser un uuid valido"),
});

// --- tipos inferidos para usar en el servicio ---
export type CrearUsuarioDTO = z.infer<typeof CrearUsuarioSchema>;
export type AsignarContadorDTO = z.infer<typeof AsignarContadorSchema>;
