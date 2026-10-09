import { requireOwner, SuperadminValidationError } from '@/core/middleware/superadmin.guard';
import * as repo from '@/core/repositories/superadmin.repository';
import type {
  DetalleResumen,
  FiltroActividad,
  FiltroCotizacion,
  RolFiltro,
} from '@/types/superadmin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PAGE_SIZE = 50;

const SECCIONES = ['resumen', 'usuarios', 'cotizaciones', 'actividades', 'carpetas'] as const;
export type Seccion = (typeof SECCIONES)[number];

const ROLES: RolFiltro[] = ['admin', 'contador', 'cliente', 'todos'];
const FILTROS_COTIZACION: FiltroCotizacion[] = [
  'todas',
  'por_cotizar',
  'esperando',
  'aceptadas',
  'rechazadas',
];
const FILTROS_ACTIVIDAD: FiltroActividad[] = [
  'todas',
  'pendiente',
  'en_proceso',
  'completada',
  'cancelada',
];

function enteroPositivo(valor: string | null, defecto: number, maximo: number): number {
  if (valor === null || valor === '') return defecto;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) throw new SuperadminValidationError('Parámetro de paginación inválido');
  return Math.min(n, maximo);
}

function opcion<T extends string>(valor: string | null, validas: readonly T[], defecto: T, nombre: string): T {
  if (valor === null || valor === '') return defecto;
  if (!(validas as readonly string[]).includes(valor)) {
    throw new SuperadminValidationError(`Valor inválido para ${nombre}`);
  }
  return valor as T;
}

// Servicio de SOLO LECTURA del panel superadmin. Toda operacion exige rol owner.
export class SuperadminService {
  static async listarOrganizaciones(request: Request, params: URLSearchParams) {
    await requireOwner(request);
    const page = enteroPositivo(params.get('page'), 1, 10_000);
    const pageSize = enteroPositivo(params.get('pageSize'), 12, MAX_PAGE_SIZE);
    const busqueda = params.get('q') ?? undefined;
    return repo.listarOrganizaciones(page, pageSize, busqueda);
  }

  static async detalleOrganizacion(request: Request, orgId: string, params: URLSearchParams) {
    await requireOwner(request);
    if (!UUID_REGEX.test(orgId)) throw new SuperadminValidationError('Identificador de organización inválido');

    const seccion = opcion(params.get('seccion'), SECCIONES, 'resumen', 'seccion');
    const page = enteroPositivo(params.get('page'), 1, 10_000);

    // la organizacion debe existir (404 si no)
    const organizacion = await repo.obtenerOrganizacion(orgId);

    switch (seccion) {
      case 'resumen': {
        const [conteos, admins] = await Promise.all([
          repo.obtenerConteos(orgId),
          repo.listarUsuarios(orgId, 'admin', 1, 20),
        ]);
        const data: DetalleResumen = { organizacion, conteos, admins: admins.items };
        return data;
      }
      case 'usuarios': {
        const rol = opcion(params.get('rol'), ROLES, 'todos', 'rol');
        const pageSize = enteroPositivo(params.get('pageSize'), 25, MAX_PAGE_SIZE);
        return repo.listarUsuarios(orgId, rol, page, pageSize);
      }
      case 'cotizaciones': {
        const filtro = opcion(params.get('filtro'), FILTROS_COTIZACION, 'todas', 'filtro');
        const pageSize = enteroPositivo(params.get('pageSize'), 20, MAX_PAGE_SIZE);
        return repo.listarCotizaciones(orgId, filtro, page, pageSize);
      }
      case 'actividades': {
        const filtro = opcion(params.get('filtro'), FILTROS_ACTIVIDAD, 'todas', 'filtro');
        const pageSize = enteroPositivo(params.get('pageSize'), 20, MAX_PAGE_SIZE);
        return repo.listarActividades(orgId, filtro, page, pageSize);
      }
      case 'carpetas': {
        const pageSize = enteroPositivo(params.get('pageSize'), 10, MAX_PAGE_SIZE);
        return repo.listarCarpetas(orgId, page, pageSize);
      }
    }
  }
}
