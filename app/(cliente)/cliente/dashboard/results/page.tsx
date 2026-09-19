"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/app/components/ui/Badge";
import { ChatBox } from "@/app/components/ui/ChatBox";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { useProfile } from "@/app/components/layout/ProfileContext";
import {
    LuFileText,
    LuDownload,
    LuMessageSquare,
    LuLoader
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
    documentoId: string | null;
};

export default function ResultsPage() {
    const { profile } = useProfile();
    const [chatAbierto, setChatAbierto] = useState(true);
    const [historial, setHistorial] = useState<HistorialItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Chat states
    const [conversacionId, setConversacionId] = useState<string | null>(null);

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
                        
                        const docId = (act.documentos && act.documentos.length > 0) 
                            ? act.documentos[act.documentos.length - 1].id 
                            : null;
                        
                        return {
                            id: act.id,
                            tipo: act.titulo || "Actividad", 
                            periodo: new Date(act.fecha_creacion || act.created_at).toLocaleDateString(),
                            fechaEntrega: act.estatus_actividad.nombre === "completada" ? new Date(act.updated_at || act.created_at).toLocaleDateString() : null,
                            estatus,
                            documentoId: docId
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

        const fetchConversaciones = async () => {
            try {
                const res = await fetch('/api/conversaciones');
                const result = await res.json();
                if (result.success && result.data?.length > 0) {
                    const chat = result.data.find((c: any) => c.tipo_conversacion === 'contador_cliente');
                    if (chat) setConversacionId(chat.id);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchResultados();
        fetchConversaciones();
    }, []);

    const handleDownload = async (docId: string) => {
        setDownloadingId(docId);
        try {
            const res = await fetch(`/api/documentos/${docId}/url-firmada`);
            const json = await res.json();
            if (json.success && json.data) {
                // Forzar la descarga abriendo en nueva pestaña
                window.open(json.data, "_blank");
            } else {
                alert(json.error || "No se pudo descargar el archivo");
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("Error al descargar el archivo");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleStartConversacion = async (primerMensaje: string) => {
        if (!profile?.contador_id) {
            alert("No tienes un contador asignado todavía.");
            return;
        }

        try {
            // Crear conversacion
            const resChat = await fetch('/api/conversaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: 'contador_cliente',
                    contraparteId: profile.contador_id
                })
            });
            const jsonChat = await resChat.json();
            
            if (jsonChat.success) {
                setConversacionId(jsonChat.data.id);
                // Enviar primer mensaje
                await fetch(`/api/conversaciones/${jsonChat.data.id}/mensajes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contenido: primerMensaje })
                });
            } else {
                alert(jsonChat.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <div className="flex items-start justify-between gap-4">
                <PageHeader 
                    title="Mis Resultados" 
                    subtitle="Historial de declaraciones y documentos entregados por el despacho" 
                />

                <Button
                    text={chatAbierto ? "Ocultar Chat" : "Chat con Contadora"}
                    icon={<LuMessageSquare className="w-4 h-4" />}
                    onClick={() => setChatAbierto(!chatAbierto)}
                    className="mt-1"
                />
            </div>

            {chatAbierto && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ChatBox
                        titulo="Chat con tu contador asignado"
                        conversacionId={conversacionId}
                        onStartConversacion={handleStartConversacion}
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
                                const canDownload = fila.estatus === "Listo" && fila.documentoId;
                                const isDownloading = downloadingId === fila.documentoId;

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
                                            {canDownload ? (
                                                <button 
                                                    onClick={() => handleDownload(fila.documentoId!)}
                                                    disabled={isDownloading}
                                                    className="flex items-center gap-1.5 border border-navy-200 bg-navy-50 hover:bg-navy-100 disabled:opacity-50 disabled:bg-slate-50 text-navy-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {isDownloading ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuDownload className="w-3.5 h-3.5" />}
                                                    {isDownloading ? "Descargando..." : "Descargar"}
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
