"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { ReadOnlyBanner } from "@/app/components/superadmin/ReadOnlyBanner";
import { Tabs } from "@/app/components/ui/Tabs";
import { KpiCard, KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { DataTable, ColumnDef } from "@/app/components/ui/DataTable";
import { Badge } from "@/app/components/ui/Badge";
import { ExpandableCard, ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { ClientFolderCard, ClientFolderCardSkeleton } from "@/app/components/ui/ClientFolderCard";
import {
  LuArrowLeft,
  LuBuilding,
  LuUsers,
  LuBriefcase,
  LuUserCheck,
  LuClipboardList,
  LuActivity,
  LuDownload,
  LuInbox,
  LuRefreshCw,
  LuChevronLeft,
  LuChevronRight,
  LuFileText,
} from "react-icons/lu";
import toast from "react-hot-toast";
import type {
  ActividadOrg,
  CarpetaCliente,
  ConteosOrganizacion,
  CotizacionOrg,
  DetalleResumen,
  FiltroActividad,
  FiltroCotizacion,
  ListaCotizaciones,
  Paginado,
  RolFiltro,
  UsuarioOrg,
} from "@/types/superadmin";

interface PageProps {
  params: Promise<{ id: string }>;
}

type TabKey = "resumen" | "usuarios" | "cotizaciones" | "actividades" | "carpetas";

export default function SuperadminOrgDetailPage({ params }: PageProps) {
  const { id: orgId } = use(params);

  const [activeTab, setActiveTab] = useState<TabKey>("resumen");
  const [resumenData, setResumenData] = useState<DetalleResumen | null>(null);
  const [isLoadingResumen, setIsLoadingResumen] = useState(true);

  // Estado Usuarios
  const [usuariosData, setUsuariosData] = useState<Paginado<UsuarioOrg> | null>(null);
  const [usuariosRol, setUsuariosRol] = useState<RolFiltro>("todos");
  const [usuariosPage, setUsuariosPage] = useState(1);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);

  // Estado Cotizaciones
  const [cotizacionesData, setCotizacionesData] = useState<ListaCotizaciones | null>(null);
  const [cotizacionesFiltro, setCotizacionesFiltro] = useState<FiltroCotizacion>("todas");
  const [cotizacionesPage, setCotizacionesPage] = useState(1);
  const [isLoadingCotizaciones, setIsLoadingCotizaciones] = useState(false);

  // Estado Actividades
  const [actividadesData, setActividadesData] = useState<Paginado<ActividadOrg> | null>(null);
  const [actividadesFiltro, setActividadesFiltro] = useState<FiltroActividad>("todas");
  const [actividadesPage, setActividadesPage] = useState(1);
  const [isLoadingActividades, setIsLoadingActividades] = useState(false);

  // Estado Carpetas
  const [carpetasData, setCarpetasData] = useState<Paginado<CarpetaCliente> | null>(null);
  const [carpetasPage, setCarpetasPage] = useState(1);
  const [isLoadingCarpetas, setIsLoadingCarpetas] = useState(false);

  // Fetch Resumen
  const fetchResumen = useCallback(async () => {
    setIsLoadingResumen(true);
    try {
      const res = await fetch(`/api/superadmin/organizaciones/${orgId}?seccion=resumen`);
      const json = await res.json();
      if (res.ok && json.success) {
        setResumenData(json.data);
      } else {
        toast.error(json.error || "Error al obtener resumen de organización");
      }
    } catch {
      toast.error("Error de red al obtener resumen");
    } finally {
      setIsLoadingResumen(false);
    }
  }, [orgId]);

  // Fetch Usuarios
  const fetchUsuarios = useCallback(async () => {
    setIsLoadingUsuarios(true);
    try {
      const p = new URLSearchParams();
      p.set("seccion", "usuarios");
      p.set("rol", usuariosRol);
      p.set("page", usuariosPage.toString());
      p.set("pageSize", "20");

      const res = await fetch(`/api/superadmin/organizaciones/${orgId}?${p.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setUsuariosData(json.data);
      } else {
        toast.error(json.error || "Error al cargar usuarios");
      }
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoadingUsuarios(false);
    }
  }, [orgId, usuariosRol, usuariosPage]);

  // Fetch Cotizaciones
  const fetchCotizaciones = useCallback(async () => {
    setIsLoadingCotizaciones(true);
    try {
      const p = new URLSearchParams();
      p.set("seccion", "cotizaciones");
      p.set("filtro", cotizacionesFiltro);
      p.set("page", cotizacionesPage.toString());
      p.set("pageSize", "15");

      const res = await fetch(`/api/superadmin/organizaciones/${orgId}?${p.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setCotizacionesData(json.data);
      } else {
        toast.error(json.error || "Error al cargar cotizaciones");
      }
    } catch {
      toast.error("Error al cargar cotizaciones");
    } finally {
      setIsLoadingCotizaciones(false);
    }
  }, [orgId, cotizacionesFiltro, cotizacionesPage]);

  // Fetch Actividades
  const fetchActividades = useCallback(async () => {
    setIsLoadingActividades(true);
    try {
      const p = new URLSearchParams();
      p.set("seccion", "actividades");
      p.set("filtro", actividadesFiltro);
      p.set("page", actividadesPage.toString());
      p.set("pageSize", "15");

      const res = await fetch(`/api/superadmin/organizaciones/${orgId}?${p.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setActividadesData(json.data);
      } else {
        toast.error(json.error || "Error al cargar actividades");
      }
    } catch {
      toast.error("Error al cargar actividades");
    } finally {
      setIsLoadingActividades(false);
    }
  }, [orgId, actividadesFiltro, actividadesPage]);

  // Fetch Carpetas
  const fetchCarpetas = useCallback(async () => {
    setIsLoadingCarpetas(true);
    try {
      const p = new URLSearchParams();
      p.set("seccion", "carpetas");
      p.set("page", carpetasPage.toString());
      p.set("pageSize", "10");

      const res = await fetch(`/api/superadmin/organizaciones/${orgId}?${p.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setCarpetasData(json.data);
      } else {
        toast.error(json.error || "Error al cargar carpetas");
      }
    } catch {
      toast.error("Error al cargar carpetas");
    } finally {
      setIsLoadingCarpetas(false);
    }
  }, [orgId, carpetasPage]);

  // Efecto inicial
  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  // Carga lazy por pestaña
  useEffect(() => {
    if (activeTab === "usuarios") fetchUsuarios();
    if (activeTab === "cotizaciones") fetchCotizaciones();
    if (activeTab === "actividades") fetchActividades();
    if (activeTab === "carpetas") fetchCarpetas();
  }, [activeTab, fetchUsuarios, fetchCotizaciones, fetchActividades, fetchCarpetas]);

  // Descarga segura de archivos usando el endpoint de URL firmada existente
  const handleDownload = async (fileId: string) => {
    if (!fileId) {
      toast.error("Identificador de archivo no válido");
      return;
    }
    try {
      const res = await fetch(`/api/documentos/${fileId}/url-firmada`);
      const json = await res.json();
      if (json.success && json.data) {
        window.open(json.data, "_blank");
      } else {
        toast.error(json.error || "No se pudo generar la descarga segura");
      }
    } catch {
      toast.error("Error al conectar para descargar el archivo");
    }
  };

  const orgNombre = resumenData?.organizacion?.nombre || "Organización";
  const conteos = resumenData?.conteos;

  // Columnas para DataTable de Usuarios
  const columnasUsuarios: ColumnDef<UsuarioOrg>[] = [
    {
      header: "Nombre",
      cell: (u) => (
        <div className="flex flex-col">
          <span className="font-semibold text-navy-950">{u.nombre}</span>
          <span className="text-xs text-slate-400">{u.email}</span>
        </div>
      ),
    },
    {
      header: "Rol",
      cell: (u) => {
        const rol = u.rol || "Sin rol";
        const variant =
          rol === "admin" ? "navy" : rol === "contador" ? "teal" : "ghost";
        return <Badge text={rol} variant={variant} />;
      },
    },
    {
      header: "RFC",
      cell: (u) => <span className="font-mono text-xs">{u.rfc || "-"}</span>,
    },
    {
      header: "Contador asignado",
      cell: (u) =>
        u.contadorNombre ? (
          <span className="text-xs font-semibold text-slate-700">{u.contadorNombre}</span>
        ) : (
          <span className="text-xs italic text-slate-400">Sin asignar</span>
        ),
    },
    {
      header: "Estatus",
      cell: (u) => {
        const est = u.estatus || "activo";
        return <Badge text={est} variant={est === "activo" ? "success" : "danger"} />;
      },
    },
    {
      header: "Régimen fiscal",
      cell: (u) => (
        <span className="text-xs text-slate-500 truncate max-w-[200px] block">
          {u.regimen || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Boton volver y Encabezado */}
      <div className="flex flex-col gap-2">
        <Link
          href="/superadmin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors w-fit"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span>Volver a todas las organizaciones</span>
        </Link>

        <PageHeader
          title={orgNombre}
          subtitle={`Vista detallada y registros de la organización (${orgId})`}
          action={
            <button
              onClick={() => {
                fetchResumen();
                if (activeTab === "usuarios") fetchUsuarios();
                if (activeTab === "cotizaciones") fetchCotizaciones();
                if (activeTab === "actividades") fetchActividades();
                if (activeTab === "carpetas") fetchCarpetas();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <LuRefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
          }
        />
      </div>

      {/* Banner Solo Lectura */}
      <ReadOnlyBanner mensaje={`Modo Solo Lectura (Superadmin) — Consultando registros de ${orgNombre}`} />

      {/* Pestañas principales */}
      <Tabs
        activeTab={activeTab}
        onChange={(v) => setActiveTab(v as TabKey)}
        tabs={[
          { label: "Resumen", value: "resumen" },
          { label: "Usuarios", value: "usuarios", count: conteos ? conteos.admins + conteos.contadores + conteos.clientes : undefined },
          { label: "Cotizaciones", value: "cotizaciones", count: conteos?.cotizaciones },
          { label: "Actividades", value: "actividades", count: conteos?.actividades },
          { label: "Carpetas generales", value: "carpetas" },
        ]}
      />

      {/* CONTENIDO DE PESTAÑAS */}

      {/* 1. RESUMEN */}
      {activeTab === "resumen" && (
        <div className="flex flex-col gap-6">
          {isLoadingResumen ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  icon={<LuUsers className="w-6 h-6 text-navy-700" />}
                  value={conteos?.admins ?? 0}
                  label="Administradores"
                  subtitle="Gestores del despacho"
                />
                <KpiCard
                  icon={<LuBriefcase className="w-6 h-6 text-teal-600" />}
                  value={conteos?.contadores ?? 0}
                  label="Contadores"
                  subtitle="Personal operativo"
                />
                <KpiCard
                  icon={<LuUserCheck className="w-6 h-6 text-indigo-600" />}
                  value={conteos?.clientes ?? 0}
                  label="Clientes"
                  subtitle="Cartera atendida"
                />
                <KpiCard
                  icon={<LuClipboardList className="w-6 h-6 text-amber-600" />}
                  value={conteos?.cotizacionesPendientes ?? 0}
                  label="Cotizaciones pendientes"
                  subtitle="Solicitudes sin cerrar"
                />
              </div>

              {/* Tarjeta de Administradores de la Organización */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <LuBuilding className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-950 text-base">Administrador(es) del Despacho</h3>
                </div>

                {resumenData?.admins && resumenData.admins.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumenData.admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-navy-950 text-sm">{admin.nombre}</span>
                          <span className="text-xs text-slate-500">{admin.email}</span>
                          {admin.rfc && <span className="text-[11px] font-mono text-slate-400 mt-0.5">RFC: {admin.rfc}</span>}
                        </div>
                        <Badge text={admin.estatus || "activo"} variant="navy" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">No hay administradores registrados en esta organización.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. USUARIOS */}
      {activeTab === "usuarios" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <Tabs
              activeTab={usuariosRol}
              onChange={(v) => {
                setUsuariosRol(v as RolFiltro);
                setUsuariosPage(1);
              }}
              tabs={[
                { label: "Todos", value: "todos" },
                { label: "Admins", value: "admin" },
                { label: "Contadores", value: "contador" },
                { label: "Clientes", value: "cliente" },
              ]}
            />
          </div>

          <DataTable
            data={usuariosData?.items ?? []}
            columns={columnasUsuarios}
            isLoading={isLoadingUsuarios}
            keyExtractor={(u) => u.id}
            emptyStateMessage="No hay usuarios registrados con el filtro seleccionado."
          />

          {/* Paginación */}
          {usuariosData && Math.ceil(usuariosData.total / usuariosData.pageSize) > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Página {usuariosPage} de {Math.ceil(usuariosData.total / usuariosData.pageSize)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUsuariosPage((p) => Math.max(1, p - 1))}
                  disabled={usuariosPage <= 1 || isLoadingUsuarios}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setUsuariosPage((p) => p + 1)}
                  disabled={usuariosPage >= Math.ceil(usuariosData.total / usuariosData.pageSize) || isLoadingUsuarios}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. COTIZACIONES */}
      {activeTab === "cotizaciones" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <Tabs
              activeTab={cotizacionesFiltro}
              onChange={(v) => {
                setCotizacionesFiltro(v as FiltroCotizacion);
                setCotizacionesPage(1);
              }}
              tabs={[
                { label: "Todas", value: "todas", count: cotizacionesData?.conteos?.todas },
                { label: "Por cotizar", value: "por_cotizar", count: cotizacionesData?.conteos?.por_cotizar },
                { label: "Esperando cliente", value: "esperando", count: cotizacionesData?.conteos?.esperando },
                { label: "Aceptadas", value: "aceptadas", count: cotizacionesData?.conteos?.aceptadas },
                { label: "Rechazadas", value: "rechazadas", count: cotizacionesData?.conteos?.rechazadas },
              ]}
            />
          </div>

          {isLoadingCotizaciones ? (
            <div className="flex flex-col gap-4">
              <ExpandableCardSkeleton />
              <ExpandableCardSkeleton />
              <ExpandableCardSkeleton />
            </div>
          ) : cotizacionesData && cotizacionesData.items.length > 0 ? (
            <div className="flex flex-col gap-4">
              {cotizacionesData.items.map((cot) => {
                const estatus = cot.estatus || "pendiente";
                const variant =
                  estatus === "aceptada"
                    ? "success"
                    : estatus === "rechazada" || estatus === "cancelada"
                    ? "danger"
                    : "amber";

                return (
                  <ExpandableCard
                    key={cot.id}
                    cliente={cot.clienteNombre || "Cliente no especificado"}
                    estatusText={estatus}
                    estatusVariant={variant}
                    subtitulo={`Cotización: ${cot.titulo} • ${new Date(cot.fechaCreacion).toLocaleDateString("es-MX")}`}
                    precio={cot.precio !== null ? `$${cot.precio.toLocaleString("es-MX")}` : undefined}
                  >
                    <div className="flex flex-col gap-3">
                      {cot.descripcion && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción:</span>
                          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{cot.descripcion}</p>
                        </div>
                      )}

                      {/* Servicios agrupados */}
                      {cot.servicios && cot.servicios.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Servicios incluidos:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cot.servicios.map((s) => (
                              <div key={s.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-navy-950">{s.titulo}</span>
                                {s.notas && <span className="text-[11px] text-slate-500 italic">Nota: {s.notas}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ExpandableCard>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <LuInbox className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No hay cotizaciones para el filtro seleccionado.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIVIDADES */}
      {activeTab === "actividades" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <Tabs
              activeTab={actividadesFiltro}
              onChange={(v) => {
                setActividadesFiltro(v as FiltroActividad);
                setActividadesPage(1);
              }}
              tabs={[
                { label: "Todas", value: "todas" },
                { label: "Pendientes", value: "pendiente" },
                { label: "En proceso", value: "en_proceso" },
                { label: "Completadas", value: "completada" },
                { label: "Canceladas", value: "cancelada" },
              ]}
            />
          </div>

          {isLoadingActividades ? (
            <div className="flex flex-col gap-4">
              <ExpandableCardSkeleton />
              <ExpandableCardSkeleton />
            </div>
          ) : actividadesData && actividadesData.items.length > 0 ? (
            <div className="flex flex-col gap-4">
              {actividadesData.items.map((act) => {
                const estatus = act.estatus || "pendiente";
                const variant =
                  estatus === "completada"
                    ? "success"
                    : estatus === "cancelada"
                    ? "danger"
                    : estatus === "en_proceso"
                    ? "teal"
                    : "amber";

                return (
                  <ExpandableCard
                    key={act.id}
                    cliente={act.clienteNombre || "Cliente"}
                    estatusText={estatus}
                    estatusVariant={variant}
                    subtitulo={`Actividad: ${act.titulo} • Contador: ${act.contadorNombre || "Sin asignar"}`}
                  >
                    <div className="flex flex-col gap-3">
                      {act.descripcion && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{act.descripcion}</p>
                      )}

                      {/* Documentos asociados */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archivos de la actividad:</span>
                        {act.documentos && act.documentos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {act.documentos.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <LuFileText className="w-4 h-4 text-navy-600 shrink-0" />
                                  <div className="flex flex-col truncate">
                                    <span className="text-xs font-semibold text-slate-800 truncate">{doc.nombre}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">{doc.tipo}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDownload(doc.id)}
                                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-navy-700 hover:border-navy-300 transition-colors shrink-0 cursor-pointer"
                                  title="Descargar archivo"
                                >
                                  <LuDownload className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Sin archivos cargados aún.</span>
                        )}
                      </div>
                    </div>
                  </ExpandableCard>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <LuInbox className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No hay actividades para el filtro seleccionado.</p>
            </div>
          )}
        </div>
      )}

      {/* 5. CARPETAS GENERALES */}
      {activeTab === "carpetas" && (
        <div className="flex flex-col gap-6">
          {isLoadingCarpetas ? (
            <div className="flex flex-col gap-6">
              <ClientFolderCardSkeleton />
              <ClientFolderCardSkeleton />
            </div>
          ) : carpetasData && carpetasData.items.length > 0 ? (
            <div className="flex flex-col gap-6">
              {carpetasData.items.map((clienteFolder) => (
                <ClientFolderCard
                  key={clienteFolder.id}
                  cliente={clienteFolder.nombre}
                  regimen={clienteFolder.regimen}
                  totalArchivos={clienteFolder.totalArchivos}
                  categories={clienteFolder.categories}
                  renderFileAttachment={(nombreArchivo) => {
                    // Buscar archivo por nombre en las categorias del cliente
                    let fileId = "";
                    for (const cat of clienteFolder.categories) {
                      const match = cat.archivos.find((f) => f.nombre === nombreArchivo);
                      if (match) {
                        fileId = match.id;
                        break;
                      }
                    }

                    return (
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                        <span className="text-xs font-semibold text-slate-700 truncate pr-2">{nombreArchivo}</span>
                        <button
                          onClick={() => handleDownload(fileId)}
                          className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-navy-700 hover:bg-white transition-colors shrink-0 cursor-pointer"
                          title="Descargar documento"
                        >
                          <LuDownload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <LuInbox className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No hay carpetas de clientes registradas en esta organización.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
