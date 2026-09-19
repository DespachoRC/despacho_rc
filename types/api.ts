// Respuestas estándar del backend
export type ApiSuccess<T> = { success: true; data: T };
export type ApiError   = { success: false; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;

// Perfil del usuario autenticado
export type UserRole = "owner" | "admin" | "contador" | "cliente";

export interface UserProfile {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  rfc: string;
  rol: UserRole;
  organizacion_nombre: string;
  contador_id?: string;
  fecha_creacion: string; // ISO 8601
}

// Cotizaciones
export type CotizacionEstatus =
  | "pendiente_cotizar"
  | "enviada"
  | "aceptada"
  | "rechazada"
  | "reabierta";

export interface Cotizacion {
  id: string;
  titulo: string;
  descripcion: string;
  notas_cliente: string;
  precio?: number;
  estatus: CotizacionEstatus;
  actividad_catalogo_id: string;
  fecha_creacion: string;
}

// Actividades
export type ActividadEstatus = "pendiente" | "en_proceso" | "bloqueada" | "completada";

export interface Actividad {
  id: string;
  titulo: string;
  estatus: ActividadEstatus;
  cliente_nombre: string;
  contador_nombre: string;
  fecha_creacion: string;
  insumos?: InsumoActividad[];
  entregables?: EntregableActividad[];
}

export interface InsumoActividad {
  id: string;
  nombre_archivo: string;
  url_firmada?: string;
  fecha_creacion: string;
}

export interface EntregableActividad {
  id: string;
  nombre_archivo: string;
  url_firmada?: string;
  fecha_creacion: string;
}

// Archivos y carpetas
export interface ArchivoSubido {
  id: string;
  nombre: string;
  url_firmada: string;
  carpeta_id: string;
  fecha_creacion: string;
}

export interface Carpeta {
  id: string;
  nombre: string;
  cliente_id: string;
}

// Catálogos
export interface CatalogoItem {
  id: string;
  nombre: string;
  activo: boolean;
}
