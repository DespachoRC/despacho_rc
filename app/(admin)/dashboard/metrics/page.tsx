'use client';

import { useState, useEffect } from "react";
import { KpiCard, KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Badge } from "@/app/components/ui/Badge";
import { LuBuilding2, LuUsers, LuClock, LuLoader } from "react-icons/lu";
import toast from "react-hot-toast";

// Skeleton de fila de tabla
function TableRowSkeleton() {
    return (
        <tr className="border-b border-slate-100 animate-pulse">
            <td className="py-4 px-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
            <td className="py-4 px-4"><div className="h-5 w-24 bg-slate-200 rounded-full" /></td>
            <td className="py-4 px-4"><div className="h-8 w-36 bg-slate-200 rounded-lg" /></td>
            <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
        </tr>
    );
}

export default function Metrics() {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState({ clientesActivos: 0, contadoresActivos: 0, declaracionesPendientes: 0 });
    const [clientes, setClientes] = useState<any[]>([]);
    const [contadores, setContadores] = useState<any[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resMetrics, resUsers] = await Promise.all([
                fetch('/api/admin/metrics'),
                fetch('/api/users')
            ]);
            const jsonMetrics = await resMetrics.json();
            const jsonUsers = await resUsers.json();

            if (jsonMetrics.success) {
                setMetrics(jsonMetrics.data);
            }
            if (jsonUsers.success) {
                const allUsers = jsonUsers.data || [];
                const clis = allUsers.filter((u: any) => u.roles?.nombre === 'cliente');
                const conts = allUsers.filter((u: any) => u.roles?.nombre === 'contador');
                setClientes(clis);
                setContadores(conts);
            }
        } catch (error) {
            toast.error("Error al cargar los datos del panel");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignContador = async (clienteId: string, nuevoContadorId: string) => {
        setUpdatingId(clienteId);
        try {
            const res = await fetch(`/api/users/${clienteId}/asignar-contador`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contador_id: nuevoContadorId || null })
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Contador reasignado correctamente");
                setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, contador_id: nuevoContadorId || null } : c));
            } else {
                toast.error(json.error || "No se pudo reasignar el contador");
            }
        } catch (error) {
            toast.error("Error al intentar reasignar contador");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader
                title="Panel de control"
                subtitle="Resumen general del despacho"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {isLoading ? (
                    <>
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            icon={<LuBuilding2 className="w-6 h-6" />} 
                            value={metrics.clientesActivos} 
                            label="Clientes Activos" 
                        />
                        <KpiCard 
                            icon={<LuUsers className="w-6 h-6" />} 
                            value={metrics.contadoresActivos} 
                            label="Contadores en Equipo" 
                        />
                        <KpiCard 
                            icon={<LuClock className="w-6 h-6" />} 
                            value={metrics.declaracionesPendientes} 
                            label="Declaraciones Pendientes (Mes)" 
                        />
                    </>
                )}
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-base font-semibold text-slate-900">
                        Asignación de Cartera de Clientes
                    </h2>
                    {!isLoading && <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{clientes.length} clientes</span>}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Cliente / Empresa</th>
                                    <th className="px-6 py-4">Régimen Fiscal</th>
                                    <th className="px-6 py-4">Contador Asignado</th>
                                    <th className="px-6 py-4">Estatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                {isLoading ? (
                                    <>
                                        <TableRowSkeleton />
                                        <TableRowSkeleton />
                                        <TableRowSkeleton />
                                    </>
                                ) : clientes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No hay clientes registrados.</td>
                                    </tr>
                                ) : (
                                    clientes.map((cliente) => (
                                        <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-navy-900">{`${cliente.nombre} ${cliente.apellido_paterno || ''}`.trim()}</span>
                                                    <span className="text-xs text-slate-500">{cliente.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {cliente.regimenes_fiscales ? (
                                                    <Badge 
                                                        text={cliente.regimenes_fiscales.nombre} 
                                                        variant="ghost" 
                                                    />
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Sin régimen</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative flex items-center">
                                                    <select
                                                        value={cliente.contador_id || ""}
                                                        onChange={(e) => handleAssignContador(cliente.id, e.target.value)}
                                                        disabled={updatingId === cliente.id}
                                                        className="w-full min-w-[200px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-navy-600 focus:border-transparent outline-none cursor-pointer disabled:opacity-50 disabled:cursor-wait hover:border-slate-300 transition-colors"
                                                    >
                                                        <option value="">-- Sin asignar --</option>
                                                        {contadores.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                {`${c.nombre} ${c.apellido_paterno || ''}`.trim()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {updatingId === cliente.id && (
                                                        <LuLoader className="absolute right-8 w-4 h-4 text-navy-600 animate-spin" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge 
                                                    text={cliente.estatus_usuarios?.nombre || "Desconocido"} 
                                                    variant={cliente.estatus_usuarios?.nombre === "activo" ? "success" : "danger"} 
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
