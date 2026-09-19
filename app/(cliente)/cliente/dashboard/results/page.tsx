"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/app/components/ui/Badge";
import { ChatBox } from "@/app/components/ui/ChatBox";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import {
    LuFileText,
    LuDownload,
    LuMessageSquare,
} from "react-icons/lu";

type Estatus = "Listo" | "En Proceso" | "Pendiente";

const estatusBadge: Record<Estatus, { variant: "success" | "navy" | "amber"; text: string }> = {
    "Listo":      { variant: "success", text: "Listo" },
    "En Proceso": { variant: "navy",    text: "En Proceso" },
    "Pendiente":  { variant: "amber",  text: "Pendiente" },
};

type HistorialItem = {
    id: string;
    tipo: string;
    periodo: string;
    fechaEntrega: string | null;
    estatus: Estatus;
};

const mensajesContadora = [
    {
        id: "1",
        text: "Buenos días, ¿ya pudo subir los estados de cuenta de junio?",
        sender: "cliente" as const,
        time: "09:15",
    },
    {
        id: "2",
        text: "Sí, los acabo de cargar. Son 3 archivos PDF.",
        sender: "despacho" as const,
        time: "09:47",
    },
    {
        id: "3",
        text: "Perfecto, los revisaré y le aviso si necesito algo más. En aprox. 48 hrs tendrá su declaración.",
        sender: "cliente" as const,
        time: "09:50",
    },
];

export default function ResultsPage() {
    const [chatAbierto, setChatAbierto] = useState(true);
    const [historial, setHistorial] = useState<HistorialItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                const res = await fetch('/api/actividades/resultados');
                const result = await res.json();
                if (result.success) {
                    const mapped = result.data.map((act: any) => {
                        let estatus: Estatus = "Pendiente";
                        if (act.estatus_actividad.nombre === "completada") estatus = "Listo";
                        else if (act.estatus_actividad.nombre === "en_proceso") estatus = "En Proceso";
                        
                        return {
                            id: act.id,
                            tipo: "Actividad", 
                            periodo: new Date(act.created_at).toLocaleDateString(),
                            fechaEntrega: act.estatus_actividad.nombre === "completada" ? new Date(act.updated_at).toLocaleDateString() : null,
                            estatus
                        };
                    });
                    setHistorial(mapped);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResultados();
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <div className="flex items-start justify-between gap-4">
                <PageHeader 
                    title="Mis Resultados" 
                    subtitle="Historial de declaraciones y documentos entregados por el despacho" 
                />

                <Button
                    text="Chat con Contadora"
                    icon={<LuMessageSquare className="w-4 h-4" />}
                    onClick={() => setChatAbierto(!chatAbierto)}
                    className="mt-1"
                />
            </div>

            {chatAbierto && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ChatBox
                        nombreCliente="Ana Martínez García (Contadora)"
                        initialMessages={mensajesContadora}
                    />
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-navy-950">
                        Historial de Documentos
                    </h2>
                    <span className="text-xs text-slate-500 italic">
                        Ordenado por periodo · más reciente primero
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">
                                    Tipo de Documento
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">
                                    Periodo
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">
                                    Fecha de Entrega
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">
                                    Estatus
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-sm text-slate-500">Cargando resultados...</td>
                                </tr>
                            ) : historial.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-sm text-slate-500">No hay resultados disponibles.</td>
                                </tr>
                            ) : historial.map((fila) => {
                                const badge = estatusBadge[fila.estatus];
                                return (
                                    <tr key={fila.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-2.5">
                                                <LuFileText className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="text-slate-800 font-medium">
                                                    {fila.tipo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-slate-600">
                                            {fila.periodo}
                                        </td>
                                        <td className="py-4 pr-4 text-slate-600">
                                            {fila.fechaEntrega ?? (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <Badge variant={badge.variant} text={badge.text} />
                                        </td>
                                        <td className="py-4">
                                            {fila.estatus === "Listo" ? (
                                                <button className="flex items-center gap-1.5 border border-navy-200 bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                                    <LuDownload className="w-3.5 h-3.5" />
                                                    Descargar
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 pl-1">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
