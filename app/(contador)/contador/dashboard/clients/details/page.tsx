"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    LuArrowLeft,
    LuBuilding2,
    LuInbox,
    LuMessageSquare,
    LuUpload,
    LuFolder,
    LuFileText,
} from "react-icons/lu";
import { FileAttachment } from "@/app/components/ui/FileAttachment";
import { ChatBox } from "@/app/components/ui/ChatBox";
import { Button } from "@/app/components/ui/Button";

interface Message {
    id: string;
    text: string;
    sender: "despacho" | "cliente";
    time: string;
}

function ClientDetailsContent() {
    const searchParams = useSearchParams();
    const cliente_id = searchParams.get('cliente_id');
    const [activeTab, setActiveTab] = useState<"insumos" | "chat" | "entregables" | "carpeta">("insumos");
    const [clienteInfo, setClienteInfo] = useState<{nombre: string, email: string} | null>(null);

    const [actividades, setActividades] = useState<any[]>([]);
    const [archivosGenerales, setArchivosGenerales] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedActividadId, setSelectedActividadId] = useState<string>("");
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    // Fetch data
    useEffect(() => {
        if (cliente_id) {
            // Cliente Info
            fetch(`/api/users/${cliente_id}`)
                .then(res => res.json())
                .then(json => {
                    if (json.success && json.data) {
                        setClienteInfo({
                            nombre: `${json.data.nombre || ''} ${json.data.apellido_paterno || ''}`.trim(),
                            email: json.data.email || ''
                        });
                    }
                })
                .catch(console.error);

            // Actividades (Insumos y Entregables)
            fetch(`/api/actividades/resultados?cliente_id=${cliente_id}`)
                .then(res => res.json())
                .then(json => {
                    if (json.success && json.data) {
                        setActividades(json.data);
                        if (json.data.length > 0) {
                            setSelectedActividadId(json.data[0].id);
                        }
                    }
                })
                .catch(console.error);

            // Carpeta General
            fetch(`/api/carpetas/archivos?cliente_id=${cliente_id}`)
                .then(res => res.json())
                .then(json => {
                    if (json.success && json.data) {
                        setArchivosGenerales(json.data);
                    }
                })
                .catch(console.error);
        }
    }, [cliente_id]);

    const handleUploadEntregable = async () => {
        if (!selectedActividadId || !fileToUpload) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('archivo', fileToUpload);
            
            const res = await fetch(`/api/actividades/${selectedActividadId}/entregables`, {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (json.success) {
                alert("Entregable subido exitosamente");
                setFileToUpload(null);
                // Opcional: recargar actividades
            } else {
                alert(`Error: ${json.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error al subir archivo");
        } finally {
            setIsUploading(false);
        }
    };

    const tabs = [
        { id: "insumos", label: "Bandeja de Insumos", icon: LuInbox },
        { id: "chat", label: "Chat Operativo", icon: LuMessageSquare },
        { id: "entregables", label: "Cargar Entregables", icon: LuUpload },
        { id: "carpeta", label: "Carpeta General", icon: LuFolder },
    ] as const;

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <div className="flex flex-col gap-6">
                <div>
                    <Link
                        href="/contador/dashboard/clients"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-700 transition-colors font-medium"
                    >
                        <LuArrowLeft className="w-4 h-4" />
                        Volver a Mis Clientes
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                        <LuBuilding2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-navy-950">
                            {clienteInfo ? clienteInfo.nombre : "Cargando cliente..."}
                        </h1>
                        <p className="text-sm text-slate-500 font-normal mt-0.5">
                            {clienteInfo ? clienteInfo.email : "..."}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-100/70 p-1.5 rounded-xl inline-flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? "bg-white text-navy-950 shadow-sm border-b-2 border-navy-600"
                                        : "text-slate-500 hover:text-navy-700"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === "insumos" && (
                    <div className="space-y-6">
                        {actividades.length === 0 ? (
                            <p className="text-slate-500 text-sm">No hay actividades para este cliente.</p>
                        ) : (
                            actividades.map(act => (
                                <div key={act.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-navy-50 text-navy-600 rounded-lg">
                                                <LuFileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-lg font-bold text-navy-950">
                                                    {act.titulo || 'Actividad'}
                                                </h3>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                                                    {act.estatus_actividad?.nombre || 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            Creada: {new Date(act.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    {act.descripcion && (
                                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-600 italic">
                                                &quot;{act.descripcion}&quot;
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-1">
                                        {act.documentos && act.documentos.map((doc: any) => (
                                            <FileAttachment key={doc.id} nombreArchivo={doc.nombre_archivo} />
                                        ))}
                                        {(!act.documentos || act.documentos.length === 0) && (
                                            <span className="text-xs text-slate-400 italic">Sin documentos adjuntos</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 h-full min-h-[500px]">
                        <ChatBox
                            titulo={`Chat con ${clienteInfo ? clienteInfo.nombre : "Cliente"}`}
                            conversacionId={null}
                        />
                    </div>
                )}

                {activeTab === "entregables" && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-xl space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-navy-950">
                                Subir Entregable
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 tracking-wider block uppercase">
                                Tarea
                            </label>
                            <select
                                value={selectedActividadId}
                                onChange={(e) => setSelectedActividadId(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent cursor-pointer"
                            >
                                {actividades.length === 0 && <option value="">Sin actividades disponibles</option>}
                                {actividades.map(act => (
                                    <option key={act.id} value={act.id}>
                                        {act.titulo || 'Actividad'} - {new Date(act.created_at).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 tracking-wider block uppercase">
                                Archivo Entregable
                            </label>
                            <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-navy-300 group transition-colors">
                                <LuUpload className="w-6 h-6 text-slate-400 group-hover:text-navy-600 transition-colors" />
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-navy-700">
                                    {fileToUpload ? fileToUpload.name : "Arrastra aquí el documento entregable final"}
                                </span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFileToUpload(e.target.files[0]);
                                        }
                                    }} 
                                />
                            </label>
                        </div>

                        <Button
                            text={isUploading ? "Subiendo..." : "Subir Documento y Notificar al Cliente"}
                            icon={<LuUpload className="w-4 h-4" />}
                            className="w-full justify-center py-3.5 mt-2"
                            onClick={handleUploadEntregable}
                            disabled={!fileToUpload || !selectedActividadId || isUploading}
                        />
                    </div>
                )}

                {activeTab === "carpeta" && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                                <LuFolder className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-navy-950">
                                    Carpeta General — {clienteInfo ? clienteInfo.nombre : "Cliente"}
                                </h2>
                                <p className="text-sm text-slate-500 font-normal mt-1">
                                    Documentos generales subidos por el cliente. Solo lectura.
                                </p>
                            </div>
                        </div>

                        {archivosGenerales.length === 0 ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-400 font-normal italic">
                                    Esta carpeta está vacía.
                                </p>
                            </div>
                        ) : (
                            Array.from(new Set(archivosGenerales.map(a => a.categoria_documentos?.nombre || 'Otros'))).map(cat => {
                                const filesInCat = archivosGenerales.filter(a => (a.categoria_documentos?.nombre || 'Otros') === cat);
                                return (
                                    <div key={cat} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                                {cat}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400">
                                                {filesInCat.length} archivos
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {filesInCat.map(file => (
                                                <FileAttachment key={file.id} nombreArchivo={file.nombre_archivo} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClientDetailsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full">Cargando...</div>}>
            <ClientDetailsContent />
        </Suspense>
    );
}
