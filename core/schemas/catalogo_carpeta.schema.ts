import { z } from 'zod';

// schema para crear un nuevo registro en cualquier catalogo
export const CrearCatalogoSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

// schema para cambiar el estatus activo de un registro del catalogo
export const ToggleEstatusSchema = z.object({
    activo: z.boolean({ error: "El campo activo debe ser un booleano" }),
});

// schema para subir un archivo a la carpeta general
export const SubirArchivoGeneralSchema = z.object({
    nombre_archivo: z.string().min(1, "El nombre del archivo es requerido"),
    url_archivo: z.string().url("La url del archivo no es valida"),
    tipo_archivo_id: z.string().uuid("El tipo_archivo_id debe ser un uuid valido"),
    cliente_id: z.string().uuid("El cliente_id debe ser un uuid valido").optional(),
});

// --- tipos inferidos para usar en los servicios ---
export type CrearCatalogoDTO = z.infer<typeof CrearCatalogoSchema>;
export type ToggleEstatusDTO = z.infer<typeof ToggleEstatusSchema>;
export type SubirArchivoGeneralDTO = z.infer<typeof SubirArchivoGeneralSchema>;
