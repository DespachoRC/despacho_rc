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
    LuLoader,
    LuUpload,
    LuX
} from "react-icons/lu";
import toast from "react-hot-toast";

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
    documentos: { id: string; nombre_archivo: string }[];
};

export default function ResultsPage() {
    const { profile } = useProfile();
    const [chatAbierto, setChatAbierto] = useState(true);
    const [historial, setHistorial] = useState<HistorialItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Upload states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadActividadId, setUploadActividadId] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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
                        
                        return {
                            id: act.id,
                            tipo: act.titulo || "Actividad", 
                            periodo: new Date(act.fecha_creacion || act.created_at).toLocaleDateString(),
                            fechaEntrega: act.estatus_actividad.nombre === "completada" ? new Date(act.updated_at || act.created_at).toLocaleDateString() : null,
                            estatus,
                            documentos: (act.documentos || []).filter((doc: any) => doc.subido_por_id && doc.subido_por_id !== act.cliente_id)
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

    useEffect(() => {
        if (conversacionId) return;

        const fetchConversaciones = async () => {
            try {
                const res = await fetch('/api/conversaciones');
                const result = await res.json();
                if (result.success && result.data?.length > 0) {
                    const chat = result.data.find((c: any) => c.tipo === 'contador_cliente');
                    if (chat) setConversacionId(chat.id);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchConversaciones();

        const interval = setInterval(() => {
            fetchConversaciones();
        }, 3000);

        return () => clearInterval(interval);
    }, [conversacionId]);

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

    const handleOpenUploadModal = (actividadId: string) => {
        setUploadActividadId(actividadId);
        setUploadFile(null);
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setUploadActividadId(null);
        setUploadFile(null);
    };

    const handleUploadSubmit = async () => {
        if (!uploadActividadId || !uploadFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('archivo', uploadFile);

            const res = await fetch(`/api/actividades/${uploadActividadId}/insumos`, {
                method: 'POST',
                body: formData
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Documento subido correctamente');
                handleCloseUploadModal();
                // Opcional: Recargar historial para reflejar el documento
                // window.location.reload(); 
            } else {
                toast.error(json.error || 'Error al subir documento');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsUploading(false);
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
                    title="Mis resultados" 
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
                                const canDownload = fila.estatus === "Listo" && fila.documentos.length > 0;

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
                                        <td className="py-4 pr-4">
                                            {canDownload ? (
                                                <div className="flex flex-col gap-2 items-start">
                                                    {fila.documentos.map((doc, idx) => (
                                                        <button 
                                                            key={doc.id}
                                                            onClick={() => handleDownload(doc.id)}
                                                            disabled={downloadingId === doc.id}
                                                            className="flex items-center gap-1.5 border border-navy-200 bg-navy-50 hover:bg-navy-100 disabled:opacity-50 disabled:bg-slate-50 text-navy-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full"
                                                            title={doc.nombre_archivo}
                                                        >
                                                            {downloadingId === doc.id ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuDownload className="w-3.5 h-3.5 shrink-0" />}
                                                            <span className="truncate max-w-[120px]">
                                                                {downloadingId === doc.id ? "Descargando..." : (fila.documentos.length > 1 ? `Descargar (${idx + 1})` : "Descargar")}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : fila.estatus !== "Listo" ? (
                                                <button 
                                                    onClick={() => handleOpenUploadModal(fila.id)}
                                                    className="flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <LuUpload className="w-3.5 h-3.5" />
                                                    Subir Documento
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

            {/* Modal de Subida de Documentos */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-navy-950">Subir Documento</h3>
                            <button onClick={handleCloseUploadModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Adjunta el archivo o comprobante necesario para que el contador pueda procesar esta actividad.
                            </p>
                            
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-navy-300 transition-colors cursor-pointer relative">
                                <LuUpload className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-sm font-medium text-slate-700">
                                    {uploadFile ? uploadFile.name : "Haz clic para seleccionar archivo"}
                                </span>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setUploadFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                            <button 
                                onClick={handleCloseUploadModal}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleUploadSubmit}
                                disabled={!uploadFile || isUploading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 rounded-lg shadow-sm transition-colors"
                            >
                                {isUploading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuUpload className="w-4 h-4" />}
                                {isUploading ? "Subiendo..." : "Subir Documento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
