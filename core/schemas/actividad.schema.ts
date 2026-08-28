import { z } from 'zod';

// estatus que el contador puede asignar a una actividad
export const ActualizarEstatusSchema = z.object({
    estatus: z.enum(['en_proceso', 'bloqueada'] as const, {
        error: "El estatus debe ser 'en_proceso' o 'bloqueada'",
    }),
});

// datos del archivo entregable que sube el contador al cerrar la actividad
export const SubirEntregableSchema = z.object({
    nombre_archivo: z.string().min(1, "El nombre del archivo es requerido"),
    url_entregable: z.string().url("La url del entregable no es valida"),
});

// --- tipos inferidos para usar en el servicio ---
export type ActualizarEstatusDTO = z.infer<typeof ActualizarEstatusSchema>;
export type SubirEntregableDTO = z.infer<typeof SubirEntregableSchema>;
