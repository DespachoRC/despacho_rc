import { createClient } from '@/core/db/server';
import { SuperadminNotFoundError } from '@/core/middleware/superadmin.guard';
import type {
  ActividadOrg,
  CarpetaCliente,
  CategoriaCarpeta,
  ConteosOrganizacion,
  CotizacionOrg,
  DocumentoActividad,
  FiltroActividad,
  FiltroCotizacion,
  ListaCotizaciones,
  ListaOrganizaciones,
  OrganizacionResumen,
  Paginado,
  RolFiltro,
  UsuarioOrg,
} from '@/types/superadmin';

// Consultas de SOLO LECTURA para el panel superadmin (rol owner).
// RLS le da al owner acceso a todas las organizaciones; aqui nunca se escribe.
// Principios de rendimiento (plan free de Vercel / limite de 1000 filas de PostgREST):
//  - todo listado es paginado con range()
//  - los conteos usan count + head (no traen filas)
//  - los nombres de usuarios se resuelven con UNA consulta .in() por pagina

type Supa = Awaited<ReturnType<typeof createClient>>;
type CountResult = { count: number | null; error: { message: string } | null };
type Ids = Record<string, string | undefined>;
type Rel = { nombre: string | null } | { nombre: string | null }[] | null | undefined;

const NIL_UUID = '00000000-0000-0000-0000-000000000000';
const MAX_ARCHIVOS_POR_CLIENTE = 200;

interface CondicionCotizacion {
  estatusIds: string[] | null;
  precio: 'sin_precio' | 'con_precio' | null;
}

const relNombre = (r: Rel): string | null =>
  Array.isArray(r) ? (r[0]?.nombre ?? null) : (r?.nombre ?? null);

const nombreCompleto = (nombre?: string | null, apellido?: string | null): string =>
  [nombre, apellido].filter(Boolean).join(' ').trim();

const rango = (page: number, pageSize: number) => {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
};

async function contar(consulta: PromiseLike<CountResult>): Promise<number> {
  const { count, error } = await consulta;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function idsPorNombre(
  supabase: Supa,
  tabla: 'roles' | 'estatus_cotizacion' | 'estatus_actividad'
): Promise<Ids> {
  const { data, error } = await supabase.from(tabla).select('id, nombre');
  if (error) throw new Error(error.message);
  const mapa: Ids = {};
  (data ?? []).forEach((fila: { id: string; nombre: string | null }) => {
    if (fila.nombre) mapa[fila.nombre.toLowerCase()] = fila.id;
  });
  return mapa;
}

async function mapaNombres(
  supabase: Supa,
  ids: (string | null | undefined)[]
): Promise<Map<string, string>> {
  const unicos = [...new Set(ids.filter((i): i is string => !!i))];
  const mapa = new Map<string, string>();
  if (unicos.length === 0) return mapa;

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido_paterno')
    .in('id', unicos);
  if (error) throw new Error(error.message);

  (data ?? []).forEach(
    (u: { id: string; nombre: string; apellido_paterno: string | null }) =>
      mapa.set(u.id, nombreCompleto(u.nombre, u.apellido_paterno))
  );
  return mapa;
}

// Traduce la pestaña de cotizaciones (igual que la vista del admin) a condiciones de consulta
function condicionCotizacion(filtro: FiltroCotizacion, est: Ids): CondicionCotizacion {
  const id = (nombre: string) => est[nombre] ?? NIL_UUID;
  switch (filtro) {
    case 'por_cotizar':
      return { estatusIds: [id('pendiente')], precio: 'sin_precio' };
    case 'esperando':
      return { estatusIds: [id('pendiente')], precio: 'con_precio' };
    case 'aceptadas':
      return { estatusIds: [id('aceptada')], precio: null };
    case 'rechazadas':
      return { estatusIds: [id('rechazada'), id('cancelada')], precio: null };
    default:
      return { estatusIds: null, precio: null };
  }
}

async function conteosDeOrganizacion(
  supabase: Supa,
  orgId: string,
  roles: Ids,
  estCot: Ids,
  estAct: Ids
): Promise<ConteosOrganizacion> {
  const usuarios = (rol: string) =>
    contar(
      supabase
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('organizacion_id', orgId)
        .eq('rol_id', roles[rol] ?? NIL_UUID)
    );

  const cotizaciones = (estatus?: string) => {
    const base = supabase
      .from('cotizaciones')
      .select('id', { count: 'exact', head: true })
      .eq('organizacion_id', orgId);
    return contar(estatus ? base.eq('estatus_id', estCot[estatus] ?? NIL_UUID) : base);
  };

  const actividades = (estatus?: string) => {
    const base = supabase
      .from('actividades')
      .select('id', { count: 'exact', head: true })
      .eq('organizacion_id', orgId);
    return contar(estatus ? base.eq('estatus_id', estAct[estatus] ?? NIL_UUID) : base);
  };

  const [admins, contadores, clientes, cotTotal, cotPendientes, actTotal, actEnProceso] =
    await Promise.all([
      usuarios('admin'),
      usuarios('contador'),
      usuarios('cliente'),
      cotizaciones(),
      cotizaciones('pendiente'),
      actividades(),
      actividades('en_proceso'),
    ]);

  return {
    admins,
    contadores,
    clientes,
    cotizaciones: cotTotal,
    cotizacionesPendientes: cotPendientes,
    actividades: actTotal,
    actividadesEnProceso: actEnProceso,
  };
}

// ---------- Organizaciones ----------

export async function listarOrganizaciones(
  page: number,
  pageSize: number,
  busqueda?: string
): Promise<ListaOrganizaciones> {
  const supabase = await createClient();
  const [roles, estCot, estAct] = await Promise.all([
    idsPorNombre(supabase, 'roles'),
    idsPorNombre(supabase, 'estatus_cotizacion'),
    idsPorNombre(supabase, 'estatus_actividad'),
  ]);

  const { from, to } = rango(page, pageSize);
  let consulta = supabase
    .from('organizaciones')
    .select('id, nombre', { count: 'exact' })
    .order('nombre', { ascending: true })
    .range(from, to);

  // se limpian los caracteres con significado especial de PostgREST
  const termino = busqueda?.replace(/[%,()*]/g, ' ').trim();
  if (termino) consulta = consulta.ilike('nombre', `%${termino}%`);

  const { data, count, error } = await consulta;
  if (error) throw new Error(error.message);

  const organizaciones = (data ?? []) as { id: string; nombre: string }[];

  const [items, organizacionesTotal, usuariosTotal, cotPendientes, actEnProceso] =
    await Promise.all([
      Promise.all(
        organizaciones.map(
          async (org): Promise<OrganizacionResumen> => ({
            id: org.id,
            nombre: org.nombre,
            conteos: await conteosDeOrganizacion(supabase, org.id, roles, estCot, estAct),
          })
        )
      ),
      contar(supabase.from('organizaciones').select('id', { count: 'exact', head: true })),
      contar(supabase.from('usuarios').select('id', { count: 'exact', head: true })),
      contar(
        supabase
          .from('cotizaciones')
          .select('id', { count: 'exact', head: true })
          .eq('estatus_id', estCot['pendiente'] ?? NIL_UUID)
      ),
      contar(
        supabase
          .from('actividades')
          .select('id', { count: 'exact', head: true })
          .eq('estatus_id', estAct['en_proceso'] ?? NIL_UUID)
      ),
    ]);

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
    totales: {
      organizaciones: organizacionesTotal,
      usuarios: usuariosTotal,
      cotizacionesPendientes: cotPendientes,
      actividadesEnProceso: actEnProceso,
    },
  };
}

export async function obtenerOrganizacion(orgId: string): Promise<{ id: string; nombre: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizaciones')
    .select('id, nombre')
    .eq('id', orgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new SuperadminNotFoundError('Organización no encontrada');
  return data as { id: string; nombre: string };
}

export async function obtenerConteos(orgId: string): Promise<ConteosOrganizacion> {
  const supabase = await createClient();
  const [roles, estCot, estAct] = await Promise.all([
    idsPorNombre(supabase, 'roles'),
    idsPorNombre(supabase, 'estatus_cotizacion'),
    idsPorNombre(supabase, 'estatus_actividad'),
  ]);
  return conteosDeOrganizacion(supabase, orgId, roles, estCot, estAct);
}

// ---------- Usuarios ----------

interface UsuarioRow {
  id: string;
  nombre: string;
  apellido_paterno: string | null;
  email: string;
  rfc: string | null;
  contador_id: string | null;
  fecha_creacion: string;
  roles: Rel;
  estatus_usuarios: Rel;
  regimenes_fiscales: Rel;
}

const USUARIO_COLS =
  'id, nombre, apellido_paterno, email, rfc, contador_id, fecha_creacion, roles(nombre), estatus_usuarios(nombre), regimenes_fiscales(nombre)';

export async function listarUsuarios(
  orgId: string,
  rol: RolFiltro,
  page: number,
  pageSize: number
): Promise<Paginado<UsuarioOrg>> {
  const supabase = await createClient();
  const { from, to } = rango(page, pageSize);

  let consulta = supabase
    .from('usuarios')
    .select(USUARIO_COLS, { count: 'exact' })
    .eq('organizacion_id', orgId)
    .order('fecha_creacion', { ascending: false })
    .range(from, to);

  if (rol !== 'todos') {
    const roles = await idsPorNombre(supabase, 'roles');
    consulta = consulta.eq('rol_id', roles[rol] ?? NIL_UUID);
  }

  const { data, count, error } = await consulta;
  if (error) throw new Error(error.message);

  const filas = (data ?? []) as unknown as UsuarioRow[];
  const contadores = await mapaNombres(
    supabase,
    filas.map((f) => f.contador_id)
  );

  const items: UsuarioOrg[] = filas.map((f) => ({
    id: f.id,
    nombre: nombreCompleto(f.nombre, f.apellido_paterno),
    email: f.email,
    rfc: f.rfc,
    rol: relNombre(f.roles),
    estatus: relNombre(f.estatus_usuarios),
    regimen: relNombre(f.regimenes_fiscales),
    contadorId: f.contador_id,
    contadorNombre: f.contador_id ? (contadores.get(f.contador_id) ?? null) : null,
    fechaCreacion: f.fecha_creacion,
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

// ---------- Cotizaciones ----------

interface CotizacionRow {
  id: string;
  titulo: string;
  descripcion: string | null;
  precio: number | string | null;
  cliente_id: string;
  fecha_creacion: string;
  estatus_cotizacion: Rel;
  cotizacion_actividades: { id: string; titulo_snapshot: string; notas_cliente: string | null }[] | null;
}

const COTIZACION_COLS =
  'id, titulo, descripcion, precio, cliente_id, fecha_creacion, estatus_cotizacion(nombre), cotizacion_actividades(id, titulo_snapshot, notas_cliente)';

const FILTROS_COTIZACION: FiltroCotizacion[] = [
  'todas',
  'por_cotizar',
  'esperando',
  'aceptadas',
  'rechazadas',
];

export async function listarCotizaciones(
  orgId: string,
  filtro: FiltroCotizacion,
  page: number,
  pageSize: number
): Promise<ListaCotizaciones> {
  const supabase = await createClient();
  const est = await idsPorNombre(supabase, 'estatus_cotizacion');
  const { from, to } = rango(page, pageSize);

  const cond = condicionCotizacion(filtro, est);
  let listaBase = supabase
    .from('cotizaciones')
    .select(COTIZACION_COLS, { count: 'exact' })
    .eq('organizacion_id', orgId);
  if (cond.estatusIds) listaBase = listaBase.in('estatus_id', cond.estatusIds);
  if (cond.precio === 'sin_precio') listaBase = listaBase.is('precio', null);
  if (cond.precio === 'con_precio') listaBase = listaBase.not('precio', 'is', null);
  const consultaLista = listaBase.order('fecha_creacion', { ascending: false }).range(from, to);

  const conteoPorFiltro = (f: FiltroCotizacion) => {
    const c = condicionCotizacion(f, est);
    let q = supabase
      .from('cotizaciones')
      .select('id', { count: 'exact', head: true })
      .eq('organizacion_id', orgId);
    if (c.estatusIds) q = q.in('estatus_id', c.estatusIds);
    if (c.precio === 'sin_precio') q = q.is('precio', null);
    if (c.precio === 'con_precio') q = q.not('precio', 'is', null);
    return contar(q);
  };

  const [{ data, count, error }, ...conteosLista] = await Promise.all([
    consultaLista,
    ...FILTROS_COTIZACION.map(conteoPorFiltro),
  ]);
  if (error) throw new Error(error.message);

  const filas = (data ?? []) as unknown as CotizacionRow[];
  const clientes = await mapaNombres(
    supabase,
    filas.map((f) => f.cliente_id)
  );

  const items: CotizacionOrg[] = filas.map((f) => ({
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion,
    precio: f.precio === null || f.precio === undefined ? null : Number(f.precio),
    estatus: relNombre(f.estatus_cotizacion),
    clienteId: f.cliente_id,
    clienteNombre: clientes.get(f.cliente_id) ?? null,
    servicios: (f.cotizacion_actividades ?? []).map((s) => ({
      id: s.id,
      titulo: s.titulo_snapshot,
      notas: s.notas_cliente,
    })),
    fechaCreacion: f.fecha_creacion,
  }));

  const conteos = FILTROS_COTIZACION.reduce(
    (acc, f, i) => ({ ...acc, [f]: conteosLista[i] }),
    {} as Record<FiltroCotizacion, number>
  );

  return { items, total: count ?? items.length, page, pageSize, conteos };
}

// ---------- Actividades ----------

interface ActividadRow {
  id: string;
  titulo: string;
  descripcion: string | null;
  cliente_id: string;
  contador_id: string | null;
  fecha_creacion: string;
  estatus_actividad: Rel;
  documentos:
    | { id: string; nombre_archivo: string; subido_por_id: string; fecha_subida: string | null }[]
    | null;
}

const ACTIVIDAD_COLS =
  'id, titulo, descripcion, cliente_id, contador_id, fecha_creacion, estatus_actividad(nombre), documentos(id, nombre_archivo, subido_por_id, fecha_subida)';

export async function listarActividades(
  orgId: string,
  filtro: FiltroActividad,
  page: number,
  pageSize: number
): Promise<Paginado<ActividadOrg>> {
  const supabase = await createClient();
  const { from, to } = rango(page, pageSize);

  let consulta = supabase
    .from('actividades')
    .select(ACTIVIDAD_COLS, { count: 'exact' })
    .eq('organizacion_id', orgId)
    .order('fecha_creacion', { ascending: false })
    .range(from, to);

  if (filtro !== 'todas') {
    const est = await idsPorNombre(supabase, 'estatus_actividad');
    consulta = consulta.eq('estatus_id', est[filtro] ?? NIL_UUID);
  }

  const { data, count, error } = await consulta;
  if (error) throw new Error(error.message);

  const filas = (data ?? []) as unknown as ActividadRow[];
  const nombres = await mapaNombres(
    supabase,
    filas.flatMap((f) => [f.cliente_id, f.contador_id])
  );

  const items: ActividadOrg[] = filas.map((f) => ({
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion,
    estatus: relNombre(f.estatus_actividad),
    clienteId: f.cliente_id,
    clienteNombre: nombres.get(f.cliente_id) ?? null,
    contadorId: f.contador_id,
    contadorNombre: f.contador_id ? (nombres.get(f.contador_id) ?? null) : null,
    documentos: (f.documentos ?? []).map(
      (d): DocumentoActividad => ({
        id: d.id,
        nombre: d.nombre_archivo,
        // el cliente sube insumos y el contador sube el entregable
        tipo:
          d.subido_por_id === f.cliente_id
            ? 'insumo'
            : d.subido_por_id === f.contador_id
              ? 'entregable'
              : 'otro',
        fechaSubida: d.fecha_subida,
      })
    ),
    fechaCreacion: f.fecha_creacion,
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

// ---------- Carpetas generales ----------

interface ClienteCarpetaRow {
  id: string;
  nombre: string;
  apellido_paterno: string | null;
  contador_id: string | null;
  regimenes_fiscales: Rel;
}

interface DocumentoCarpetaRow {
  id: string;
  nombre_archivo: string;
  categoria_documentos: Rel;
}

export async function listarCarpetas(
  orgId: string,
  page: number,
  pageSize: number
): Promise<Paginado<CarpetaCliente>> {
  const supabase = await createClient();
  const roles = await idsPorNombre(supabase, 'roles');
  const { from, to } = rango(page, pageSize);

  const { data, count, error } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido_paterno, contador_id, regimenes_fiscales(nombre)', {
      count: 'exact',
    })
    .eq('organizacion_id', orgId)
    .eq('rol_id', roles['cliente'] ?? NIL_UUID)
    .order('nombre', { ascending: true })
    .range(from, to);
  if (error) throw new Error(error.message);

  const clientes = (data ?? []) as unknown as ClienteCarpetaRow[];
  const contadores = await mapaNombres(
    supabase,
    clientes.map((c) => c.contador_id)
  );

  // un cliente a la vez en paralelo (maximo pageSize consultas livianas)
  const items = await Promise.all(
    clientes.map(async (cliente): Promise<CarpetaCliente> => {
      const { data: docs, count: total, error: errorDocs } = await supabase
        .from('documentos')
        .select('id, nombre_archivo, categoria_documentos(nombre)', { count: 'exact' })
        .eq('organizacion_id', orgId)
        .eq('cliente_id', cliente.id)
        .is('actividad_id', null)
        .order('fecha_subida', { ascending: false })
        .range(0, MAX_ARCHIVOS_POR_CLIENTE - 1);
      if (errorDocs) throw new Error(errorDocs.message);

      const porCategoria = new Map<string, CategoriaCarpeta>();
      ((docs ?? []) as unknown as DocumentoCarpetaRow[]).forEach((doc) => {
        const nombreCategoria = relNombre(doc.categoria_documentos) ?? 'General';
        const categoria = porCategoria.get(nombreCategoria) ?? {
          nombre: nombreCategoria,
          archivos: [],
        };
        categoria.archivos.push({ id: doc.id, nombre: doc.nombre_archivo });
        porCategoria.set(nombreCategoria, categoria);
      });

      return {
        id: cliente.id,
        nombre: nombreCompleto(cliente.nombre, cliente.apellido_paterno),
        regimen: relNombre(cliente.regimenes_fiscales) ?? 'Sin régimen',
        contadorId: cliente.contador_id,
        contadorNombre: cliente.contador_id ? (contadores.get(cliente.contador_id) ?? null) : null,
        totalArchivos: total ?? 0,
        categories: [...porCategoria.values()],
      };
    })
  );

  return { items, total: count ?? items.length, page, pageSize };
}
