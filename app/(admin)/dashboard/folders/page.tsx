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

    const handleDownload = async (fileUrl: string, fileName: string) => {
        try {
            // El backend usa un ID de documento para generar la URL, 
            // pero si la URL ya es pública (o se almacena directamente), podríamos descargarla.
            // Asumiremos que el href puede descargarla si apuntara directo a supabase, 
            // pero lo ideal es pasar por api/documentos/[id]/url-firmada si tuvieramos el ID del documento.
            // Para simplificar, abrimos una nueva pestaña con la URL si está disponible.
            if (fileUrl) {
                window.open(fileUrl, '_blank');
            } else {
                toast.error('No se pudo encontrar el enlace al archivo');
            }
        } catch (error) {
            toast.error('Error al intentar descargar el archivo');
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Carpetas Generales" 
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
                        <div key={contadorInfo.id || idx} className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-navy-900 border-b border-slate-200 pb-2">
                                Contador: {contadorInfo.nombre}
                            </h3>
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
                                                const file = 
                                                    cliente.categories.tickets.find((f: any) => f.nombre === nombreArchivo) ||
                                                    cliente.categories.afiliacion.find((f: any) => f.nombre === nombreArchivo) ||
                                                    cliente.categories.facturas.find((f: any) => f.nombre === nombreArchivo) ||
                                                    cliente.categories.general.find((f: any) => f.nombre === nombreArchivo);

                                                return (
                                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors group">
                                                        <div className="flex flex-col overflow-hidden pr-2">
                                                            <span className="text-xs font-semibold text-slate-700 truncate">{nombreArchivo}</span>
                                                        </div>
                                                        <button 
                                                            className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-navy-600 group-hover:border-navy-200 transition-colors"
                                                            onClick={() => handleDownload(file?.url, nombreArchivo)}
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