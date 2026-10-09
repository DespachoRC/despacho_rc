"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { KpiCard, KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { Input } from "@/app/components/ui/Input";
import { ReadOnlyBanner } from "@/app/components/superadmin/ReadOnlyBanner";
import { OrgCard, OrgCardSkeleton } from "@/app/components/superadmin/OrgCard";
import {
  LuBuilding2,
  LuUsers,
  LuClipboardList,
  LuActivity,
  LuSearch,
  LuChevronLeft,
  LuChevronRight,
  LuInbox,
  LuRefreshCw,
} from "react-icons/lu";
import toast from "react-hot-toast";
import type { ListaOrganizaciones } from "@/types/superadmin";

export default function SuperadminDashboard() {
  const [data, setData] = useState<ListaOrganizaciones | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce para busqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset a pagina 1 cuando busca
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchOrganizaciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "12");
      if (debouncedQuery.trim()) {
        params.set("q", debouncedQuery.trim());
      }

      const res = await fetch(`/api/superadmin/organizaciones?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        toast.error(json.error || "Error al cargar las organizaciones");
      }
    } catch (error) {
      console.error("Error fetching superadmin organizaciones:", error);
      toast.error("Error de conexión al cargar organizaciones");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedQuery]);

  useEffect(() => {
    fetchOrganizaciones();
  }, [fetchOrganizaciones]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;
  const totales = data?.totales;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Encabezado */}
      <PageHeader
        title="Panel Superadmin"
        subtitle="Monitoreo global de todas las organizaciones registradas en la plataforma"
        action={
          <button
            onClick={fetchOrganizaciones}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Recargar datos"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-navy-600" : ""}`} />
            <span>Actualizar</span>
          </button>
        }
      />

      {/* Banner de solo lectura */}
      <ReadOnlyBanner />

      {/* KPIs Globales del Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !data ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              icon={<LuBuilding2 className="w-6 h-6 text-navy-700" />}
              value={totales?.organizaciones ?? 0}
              label="Organizaciones totales"
              subtitle="Despachos activos"
            />
            <KpiCard
              icon={<LuUsers className="w-6 h-6 text-indigo-600" />}
              value={totales?.usuarios ?? 0}
              label="Usuarios en plataforma"
              subtitle="Admins, contadores y clientes"
            />
            <KpiCard
              icon={<LuClipboardList className="w-6 h-6 text-amber-600" />}
              value={totales?.cotizacionesPendientes ?? 0}
              label="Cotizaciones pendientes"
              subtitle="Por atender a nivel global"
            />
            <KpiCard
              icon={<LuActivity className="w-6 h-6 text-emerald-600" />}
              value={totales?.actividadesEnProceso ?? 0}
              label="Actividades en proceso"
              subtitle="Trabajos activos de contadores"
            />
          </>
        )}
      </div>

      {/* Seccion principal: Busqueda y Catalogo de Organizaciones */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-navy-950 tracking-tight">Organizaciones</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {data ? `Mostrando ${data.items.length} de ${data.total} organizaciones` : "Cargando..."}
            </p>
          </div>

          <div className="w-full sm:w-80">
            <Input
              type="text"
              placeholder="Buscar por nombre de organización..."
              icon={<LuSearch />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              isLabelNeed={false}
              className="bg-slate-50 hover:bg-white focus:bg-white text-xs"
            />
          </div>
        </div>

        {/* Grid de Organizaciones */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OrgCardSkeleton />
            <OrgCardSkeleton />
            <OrgCardSkeleton />
            <OrgCardSkeleton />
            <OrgCardSkeleton />
            <OrgCardSkeleton />
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
            <LuInbox className="w-12 h-12 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              {debouncedQuery ? `No se encontraron organizaciones para "${debouncedQuery}"` : "No hay organizaciones registradas."}
            </p>
            {debouncedQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-navy-600 hover:text-navy-800 underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Paginación */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">
              Página {page} de {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <LuChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <span>Siguiente</span>
                <LuChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
