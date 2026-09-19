"use client";

import { ClientFolderCard, ClientFolderCardSkeleton } from "@/app/components/ui/ClientFolderCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { LuDownload } from "react-icons/lu";
import toast from "react-hot-toast";

export default function Folders() {
    const [isLoading, setIsLoading] = useState(true);
    const [carpetas, setCarpetas] = useState<any[]>([]);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await fetch('/api/carpetas/admin');
                const json = await res.json();
                if (res.ok && json.success) {
                    setCarpetas(json.data);
                } else {
                    toast.error(json.error || 'Error al cargar carpetas');
                }
            } catch (error) {
                toast.error('Error de red al cargar carpetas');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolders();
    }, []);

    const handleDownload = async (fileId: string, fileName: string) => {
        if (!fileId) {
            toast.error('No se pudo encontrar el archivo');
            return;
        }
        try {
            const res = await fetch(`/api/documentos/${fileId}/url-firmada`);
            const json = await res.json();
            if (json.success && json.data) {
                window.open(json.data, '_blank');
            } else {
                toast.error(json.error || 'No se pudo descargar el archivo');
            }
        } catch (error) {
            toast.error('Error al intentar descargar el archivo');
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Carpetas generales" 
                subtitle="Documentos generales subidos por los clientes, organizados por contador asignado" 
            />

            <div className="flex flex-col gap-8">
                {isLoading ? (
                    <>
                        <ClientFolderCardSkeleton />
                        <ClientFolderCardSkeleton />
                        <ClientFolderCardSkeleton />
                    </>
                ) : carpetas.length > 0 ? (
                    carpetas.map((contadorInfo, idx) => (
                        <div key={contadorInfo.id || idx} className="flex flex-col gap-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                <div className="bg-navy-600 text-white p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </div>
                                <h3 className="text-xl font-bold text-navy-950">
                                    {contadorInfo.nombre}
                                </h3>
                                <span className="ml-auto text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                                    {contadorInfo.clientes ? contadorInfo.clientes.length : 0} clientes
                                </span>
                            </div>
                            {contadorInfo.clientes && contadorInfo.clientes.length > 0 ? (
                                <div className="flex flex-col gap-6">
                                    {contadorInfo.clientes.map((cliente: any) => (
                                        <ClientFolderCard
                                            key={cliente.id}
                                            cliente={cliente.nombre}
                                            regimen={cliente.regimen}
                                            totalArchivos={cliente.totalArchivos}
                                            categories={cliente.categories}
                                            renderFileAttachment={(nombreArchivo) => {
                                                // Buscar la URL del archivo en las categorías para este cliente
                                                let file: any = null;
                                                for (const cat of cliente.categories) {
                                                    file = cat.archivos.find((f: any) => f.nombre === nombreArchivo);
                                                    if (file) break;
                                                }

                                                return (
                                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors group">
                                                        <div className="flex flex-col overflow-hidden pr-2">
                                                            <span className="text-xs font-semibold text-slate-700 truncate">{nombreArchivo}</span>
                                                        </div>
                                                        <button 
                                                            className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-navy-600 group-hover:border-navy-200 transition-colors"
                                                            onClick={() => handleDownload(file?.id, nombreArchivo)}
                                                            title="Descargar archivo"
                                                        >
                                                            <LuDownload className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 italic py-2">
                                    Este contador no tiene clientes asignados o no hay documentos aún.
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-slate-500 italic">No hay carpetas disponibles.</div>
                )}
            </div>
        </div>
    );
}