'use client';

import { KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { PageHeader } from "@/app/components/ui/PageHeader";

// Skeleton de fila de tabla
function TableRowSkeleton() {
    return (
        <tr className="border-b border-slate-100 animate-pulse">
            <td className="py-4 px-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
            <td className="py-4 px-4"><div className="h-5 w-24 bg-slate-200 rounded-full" /></td>
            <td className="py-4 px-4"><div className="h-8 w-36 bg-slate-200 rounded-lg" /></td>
            <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
            <td className="py-4 px-4"><div className="h-7 w-20 bg-slate-200 rounded-lg" /></td>
        </tr>
    );
}

export default function Metrics() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader
                title="Panel de Control"
                subtitle="Resumen general del despacho"
            />

            {/* KPI row — skeleton mientras conecta API */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            {/* Tabla de cartera — skeleton */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-base font-semibold text-slate-900">
                        Asignación de Cartera de Clientes
                    </h2>
                    <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header de tabla */}
                    <div className="flex gap-4 px-4 py-3 border-b border-slate-100">
                        <div className="h-3.5 w-40 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <table className="w-full">
                        <tbody>
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-slate-400 text-center">
                    Los datos se cargarán cuando el endpoint de cartera esté disponible.
                </p>
            </div>
        </div>
    );
}
