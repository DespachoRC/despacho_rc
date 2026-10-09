import Link from "next/link";
import {
  LuBuilding,
  LuUsers,
  LuBriefcase,
  LuUserCheck,
  LuClipboardList,
  LuActivity,
  LuArrowRight,
} from "react-icons/lu";
import type { OrganizacionResumen } from "@/types/superadmin";

interface OrgCardProps {
  org: OrganizacionResumen;
}

export function OrgCard({ org }: OrgCardProps) {
  const { conteos } = org;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-300 transition-all duration-200 p-6 flex flex-col justify-between gap-5 group">
      <div className="flex flex-col gap-4">
        {/* Header con icono y nombre */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-navy-50 text-navy-800 rounded-xl flex items-center justify-center shrink-0 border border-navy-100 group-hover:bg-navy-900 group-hover:text-white transition-colors duration-200">
              <LuBuilding className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-navy-950 text-lg truncate group-hover:text-navy-700 transition-colors">
                {org.nombre}
              </h3>
              <span className="text-xs text-slate-500 font-medium">Organización</span>
            </div>
          </div>
        </div>

        {/* Metricas de usuarios */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <LuUsers className="w-3.5 h-3.5 text-navy-600" />
              <span>Admins</span>
            </div>
            <span className="text-base font-bold text-slate-900 mt-0.5">{conteos.admins}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1 text-center border-x border-slate-200/70">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <LuBriefcase className="w-3.5 h-3.5 text-teal-600" />
              <span>Contadores</span>
            </div>
            <span className="text-base font-bold text-slate-900 mt-0.5">{conteos.contadores}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-1 text-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <LuUserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Clientes</span>
            </div>
            <span className="text-base font-bold text-slate-900 mt-0.5">{conteos.clientes}</span>
          </div>
        </div>

        {/* Resumen operativo */}
        <div className="flex items-center justify-between gap-2 px-1 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <LuClipboardList className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Pendientes:</span>
            <span className="font-bold text-slate-900 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">
              {conteos.cotizacionesPendientes}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <LuActivity className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>En proceso:</span>
            <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60">
              {conteos.actividadesEnProceso}
            </span>
          </div>
        </div>
      </div>

      {/* Acceso al detalle */}
      <Link
        href={`/superadmin/dashboard/organizations/${org.id}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-navy-900 hover:text-white text-navy-900 font-semibold text-xs rounded-xl transition-all duration-200 border border-slate-200 group-hover:border-navy-900 cursor-pointer"
      >
        <span>Ver detalle de organización</span>
        <LuArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function OrgCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-slate-200 rounded-xl" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="h-16 bg-slate-100 rounded-xl" />
      <div className="h-4 w-full bg-slate-200 rounded" />
      <div className="h-10 bg-slate-200 rounded-xl mt-1" />
    </div>
  );
}
