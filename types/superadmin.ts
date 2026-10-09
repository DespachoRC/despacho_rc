// Tipos del panel superadmin (rol owner, solo lectura).
// Compartidos entre el backend (core/*) y el frontend (app/(superadmin)/*).

export interface Paginado<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ConteosOrganizacion {
  admins: number;
  contadores: number;
  clientes: number;
  cotizaciones: number;
  cotizacionesPendientes: number;
  actividades: number;
  actividadesEnProceso: number;
}

export interface OrganizacionResumen {
  id: string;
  nombre: string;
  conteos: ConteosOrganizacion;
}

export interface TotalesGlobales {
  organizaciones: number;
  usuarios: number;
  cotizacionesPendientes: number;
  actividadesEnProceso: number;
}

export interface ListaOrganizaciones extends Paginado<OrganizacionResumen> {
  totales: TotalesGlobales;
}

export type RolFiltro = 'admin' | 'contador' | 'cliente' | 'todos';

export interface UsuarioOrg {
  id: string;
  nombre: string;
  email: string;
  rfc: string | null;
  rol: string | null;
  estatus: string | null;
  regimen: string | null;
  contadorId: string | null;
  contadorNombre: string | null;
  fechaCreacion: string;
}

export type FiltroCotizacion = 'todas' | 'por_cotizar' | 'esperando' | 'aceptadas' | 'rechazadas';

export interface CotizacionOrg {
  id: string;
  titulo: string;
  descripcion: string | null;
  precio: number | null;
  estatus: string | null;
  clienteId: string;
  clienteNombre: string | null;
  servicios: { id: string; titulo: string; notas: string | null }[];
  fechaCreacion: string;
}

export interface ListaCotizaciones extends Paginado<CotizacionOrg> {
  conteos: Record<FiltroCotizacion, number>;
}

export type FiltroActividad = 'todas' | 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

export interface DocumentoActividad {
  id: string;
  nombre: string;
  tipo: 'insumo' | 'entregable' | 'otro';
  fechaSubida: string | null;
}

export interface ActividadOrg {
  id: string;
  titulo: string;
  descripcion: string | null;
  estatus: string | null;
  clienteId: string;
  clienteNombre: string | null;
  contadorId: string | null;
  contadorNombre: string | null;
  documentos: DocumentoActividad[];
  fechaCreacion: string;
}

export interface ArchivoCarpeta {
  id: string;
  nombre: string;
}

export interface CategoriaCarpeta {
  nombre: string;
  archivos: ArchivoCarpeta[];
}

export interface CarpetaCliente {
  id: string;
  nombre: string;
  regimen: string;
  contadorId: string | null;
  contadorNombre: string | null;
  totalArchivos: number;
  categories: CategoriaCarpeta[];
}

export interface DetalleResumen {
  organizacion: { id: string; nombre: string };
  conteos: ConteosOrganizacion;
  admins: UsuarioOrg[];
}
