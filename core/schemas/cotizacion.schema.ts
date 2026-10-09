import { z } from 'zod';

// paso 1: cliente genera una solicitud de cotizacion
export const CreateCotizacionSchema = z.object({
    titulo: z.string().min(1, "El título es requerido"),
    descripcion: z.string().max(1000).optional(),
    actividades: z.array(
        z.object({
            catalogo_actividad_id: z.string().uuid("El id del servicio debe ser un uuid válido"),
            notas_cliente: z.string().max(500).optional(),
        })
    ).min(1, "Selecciona al menos una actividad").optional(),
    actividad_catalogo_id: z.string().uuid("El id del servicio debe ser un uuid válido").optional(),
    notas_cliente: z.string().max(500).optional(),
}).superRefine((data, context) => {
    if (!data.actividades?.length && !data.actividad_catalogo_id) {
        context.addIssue({
            code: "custom",
            path: ["actividades"],
            message: "Selecciona al menos una actividad",
        });
    }

    if (data.actividades?.length && data.actividad_catalogo_id) {
        context.addIssue({
            code: "custom",
            path: ["actividades"],
            message: "Envía actividades agrupadas o una actividad individual, no ambas",
        });
    }

    if (data.actividades) {
        const ids = data.actividades.map(({ catalogo_actividad_id }) => catalogo_actividad_id);
        if (new Set(ids).size !== ids.length) {
            context.addIssue({
                code: "custom",
                path: ["actividades"],
                message: "No se pueden repetir actividades en una cotización",
            });
        }
    }
});

// paso 2: admin fija el precio de una cotizacion (puede ser 0 para servicios de cortesia)
export const FijarPrecioSchema = z.object({
    precio: z
        .number({ error: "El precio debe ser un número válido" })
        .nonnegative("El precio debe ser cero o mayor"),
});

// paso 3: cliente acepta o rechaza la cotizacion enviada
export const ResponderCotizacionSchema = z.object({
    respuesta: z.enum(["aceptada", "rechazada"] as const, {
        error: "La respuesta debe ser 'aceptada' o 'rechazada'",
    }),
});

// --- tipos inferidos ---
export type CreateCotizacionDTO = z.infer<typeof CreateCotizacionSchema>;
export type FijarPrecioDTO = z.infer<typeof FijarPrecioSchema>;
export type ResponderCotizacionDTO = z.infer<typeof ResponderCotizacionSchema>;
