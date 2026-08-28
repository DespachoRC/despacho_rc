import { z } from 'zod';

// --- schema: archivo adjunto por servicio ---
const ArchivoAdjuntoSchema = z.object({
    nombre: z.string().min(1, "El nombre del archivo es requerido"),
    url: z.string().url("La url del archivo no es valida"),
});

// --- schema: un servicio dentro de la solicitud del cliente ---
const ServicioSolicitadoSchema = z.object({
    catalogo_servicio_id: z.string().uuid("El id del servicio debe ser un uuid valido"),
    notas: z.string().max(500, "Las notas no pueden exceder 500 caracteres").optional(),
    archivos: z.array(ArchivoAdjuntoSchema).optional(),
});

// paso 1: cliente genera la solicitud con uno o mas servicios
export const CreateCotizacionSchema = z.object({
    servicios: z
        .array(ServicioSolicitadoSchema)
        .min(1, "Debes seleccionar al menos un servicio"),
});

// paso 2: admin fija el precio de una cotizacion individual
export const FijarPrecioSchema = z.object({
    precio: z
        .number({ error: "El precio debe ser un numero valido" })
        .positive("El precio debe ser mayor a cero"),
    notas_admin: z.string().max(500).optional(),
});

// paso 3: cliente acepta o rechaza la cotizacion enviada
export const ResponderCotizacionSchema = z.object({
    respuesta: z.enum(["Aceptada", "Rechazada"] as const, {
        error: "La respuesta debe ser 'Aceptada' o 'Rechazada'",
    }),
});

// --- tipos inferidos para usar en los servicios ---
export type CreateCotizacionDTO = z.infer<typeof CreateCotizacionSchema>;
export type FijarPrecioDTO = z.infer<typeof FijarPrecioSchema>;
export type ResponderCotizacionDTO = z.infer<typeof ResponderCotizacionSchema>;
