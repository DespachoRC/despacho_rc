"use client";

import { useState, useEffect } from "react";
import { KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { LuBuilding2, LuFileText } from "react-icons/lu";

function ClientCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 animate-pulse">
            <div className="flex flex-col gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-xl" />
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-44 bg-slate-200 rounded" />
                </div>
                <div className="h-5 w-28 bg-slate-200 rounded-full mt-1" />
            </div>
        </div>
    );
}

export default function ClientsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [actividades, setActividades] = useState<any[]>([]);

    useEffect(() => {
        const fetchMisActividades = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/actividades/mis-actividades");
                if (res.ok) {
                    const json = await res.json();
                    setActividades(json.data || []);
                }
            } catch (error) {
                console.error("Error fetching actividades", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMisActividades();
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader
                title="Mis Actividades"
                subtitle="Vista general de las actividades asignadas de tu cartera"
            />

            {/* Los KPIs se mantienen en Skeleton porque no hay endpoint de métricas aún */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    <>
                        <ClientCardSkeleton />
                        <ClientCardSkeleton />
                        <ClientCardSkeleton />
                    </>
                ) : actividades.length > 0 ? (
                    actividades.map((act, idx) => {
                        const clienteNombre = `${act.cotizaciones?.usuarios?.nombre || "Desconocido"} ${act.cotizaciones?.usuarios?.apellido_paterno || ""}`;
                        const estatus = act.estatus_actividad?.nombre || "pendiente";
                        
                        return (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-11 h-11 bg-navy-50 text-navy-600 rounded-xl flex items-center justify-center shrink-0">
                                        <LuFileText className="w-5 h-5" />
                                    </div>
                                    <Badge 
                                        text={estatus.toUpperCase()} 
                                        variant={estatus === 'completada' ? 'success' : estatus === 'en_proceso' ? 'navy' : 'pending'} 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold text-navy-950 text-base">{act.cotizaciones?.titulo || "Actividad"}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-1">{clienteNombre}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>Creada: {new Date(act.created_at).toLocaleDateString()}</span>
                                    {act.fecha_vencimiento && <span>Vence: {new Date(act.fecha_vencimiento).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-2 flex items-center justify-center gap-2 py-8 text-slate-400">
                        <LuBuilding2 className="w-5 h-5" />
                        <p className="text-sm">No tienes actividades asignadas en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
