"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { LuBuilding2, LuUsers } from "react-icons/lu";

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
    const [clientes, setClientes] = useState<any[]>([]);

    useEffect(() => {
        const fetchMisClientes = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/users/mis-clientes");
                if (res.ok) {
                    const json = await res.json();
                    setClientes(json.data || []);
                }
            } catch (error) {
                console.error("Error fetching clientes", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMisClientes();
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader
                title="Mis clientes"
                subtitle="Vista general de los clientes de tu cartera"
            />



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    <>
                        <ClientCardSkeleton />
                        <ClientCardSkeleton />
                        <ClientCardSkeleton />
                    </>
                ) : clientes.length > 0 ? (
                    clientes.map((cliente, idx) => {
                        const clienteNombre = `${cliente.nombre || "Desconocido"} ${cliente.apellido_paterno || ""}`.trim();
                        const regimen = cliente.regimenes_fiscales?.nombre || "Sin régimen";
                        
                        return (
                            <Link 
                                key={idx} 
                                href={`/contador/dashboard/clients/details?cliente_id=${cliente.id}`}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:border-navy-300 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-11 h-11 bg-navy-50 text-navy-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-navy-600 group-hover:text-white transition-colors">
                                        <LuUsers className="w-5 h-5" />
                                    </div>
                                    <Badge 
                                        text={cliente.estatus_usuarios?.nombre === "activo" ? "ACTIVO" : "INACTIVO"} 
                                        variant={cliente.estatus_usuarios?.nombre === "activo" ? "success" : "ghost"} 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-semibold text-navy-950 text-base">{clienteNombre}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-1">{cliente.email}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span className="font-medium text-slate-600">{cliente.rfc || "Sin RFC"}</span>
                                    <span className="truncate max-w-[150px]">{regimen}</span>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-2 flex items-center justify-center gap-2 py-8 text-slate-400">
                        <LuBuilding2 className="w-5 h-5" />
                        <p className="text-sm">No tienes clientes asignados en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
