import { z } from 'zod';

// paso 1: cliente genera una solicitud de cotizacion
export const CreateCotizacionSchema = z.object({
    titulo: z.string().min(1, "El título es requerido"),
    descripcion: z.string().max(1000).optional(),
    actividad_catalogo_id: z.string().uuid("El id del servicio debe ser un uuid válido"),
    notas_cliente: z.string().max(500).optional(),
});

// paso 2: admin fija el precio de una cotizacion
export const FijarPrecioSchema = z.object({
    precio: z   
        .number({ error: "El precio debe ser un número válido" })
        .positive("El precio debe ser mayor a cero"),
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
