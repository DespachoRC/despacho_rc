"use client";

import { useState, useEffect } from "react";
import { FileAttachment } from "@/app/components/ui/FileAttachment";
import { PageHeader } from "@/app/components/ui/PageHeader";
import {
    LuClipboardList,
    LuFolderOpen,
    LuUpload,
    LuLoader
} from "react-icons/lu";
import toast from "react-hot-toast";

export default function UploadPage() {
    const [tiposTarea, setTiposTarea] = useState<any[]>([]);
    const [carpetas, setCarpetas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTareas, setSelectedTareas] = useState<string[]>([]);
    const [notas, setNotas] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSolicitarActividades = async () => {
        if (selectedTareas.length === 0) return;
        setIsSubmitting(true);
        let errores = 0;
        try {
            // Generar una solicitud por cada tarea seleccionada
            for (const tareaId of selectedTareas) {
                const tipo = tiposTarea.find(t => t.id === tareaId);
                const res = await fetch('/api/cotizaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        titulo: tipo ? tipo.nombre : 'Solicitud de actividad',
                        actividad_catalogo_id: tareaId,
                        notas_cliente: notas[tareaId] || ''
                    })
                });
                if (!res.ok) errores++;
            }
            if (errores === 0) {
                toast.success('Solicitudes generadas correctamente');
            } else if (errores < selectedTareas.length) {
                toast.error(`Se generaron algunas solicitudes, pero ${errores} fallaron. Intenta de nuevo.`);
            } else {
                toast.error('No se pudieron generar las solicitudes. Intenta de nuevo.');
            }
            setSelectedTareas([]); // limpiar seleccion siempre
            setNotas({});
        } catch (error) {
            toast.error('Error de conexión al generar las solicitudes');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [uploadingCategoria, setUploadingCategoria] = useState<string | null>(null);

    const loadData = async (quiet = false) => {
        if (!quiet) setIsLoading(true);
        try {
            // Fetch tareas
            const resTareas = await fetch('/api/catalogos/catalogo_actividades?soloActivos=true');
            const jsonTareas = await resTareas.json();
            
            // Fetch categorias de documentos
            const resCats = await fetch('/api/catalogos/categoria_documentos?soloActivos=true');
            const jsonCats = await resCats.json();

            // Fetch archivos subidos
            const resArchivos = await fetch('/api/carpetas/archivos');
            const jsonArchivos = await resArchivos.json();

            if (jsonTareas.success) setTiposTarea(jsonTareas.data);
            
            if (jsonCats.success && jsonArchivos.success) {
                const cats = jsonCats.data;
                const files = jsonArchivos.data;

                const carpetasAgrupadas = cats.map((cat: any) => ({
                    id: cat.id,
                    nombre: cat.nombre,
                    archivos: files.filter((f: any) => f.categoria_documentos?.nombre === cat.nombre)
                }));
                
                const generalFiles = files.filter((f: any) => !f.categoria_documentos);
                if (generalFiles.length > 0 || carpetasAgrupadas.length === 0) {
                    carpetasAgrupadas.push({
                        id: 'general',
                        nombre: 'General',
                        archivos: generalFiles
                    });
                }

                setCarpetas(carpetasAgrupadas);
            }
        } catch (error) {
            toast.error("Error al cargar datos");
        } finally {
            if (!quiet) setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, categoriaId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingCategoria(categoriaId);
        try {
            const formData = new FormData();
            formData.append('archivo', file);
            
            // Si la categoría no es 'general', se asocia al ID de categoría correspondiente
            if (categoriaId !== 'general') {
                formData.append('tipo_archivo_id', categoriaId);
            }

            const res = await fetch('/api/carpetas/archivos', {
                method: 'POST',
                body: formData
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Archivo subido correctamente');
                await loadData(true); // Recargar los archivos silenciosamente
            } else {
                toast.error(json.error || 'Error al subir el archivo');
            }
        } catch (error) {
            toast.error('Error de conexión al subir el archivo');
        } finally {
            setUploadingCategoria(null);
            event.target.value = ''; // Permite seleccionar el mismo archivo de nuevo si se necesita
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Cargar documentación" 
                subtitle="Selecciona los tipos de tarea y adjunta los documentos requeridos" 
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl">
                        <LuClipboardList className="w-5 h-5 text-navy-600" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base font-semibold text-navy-950">
                            ¿Para qué necesitas apoyo este mes?
                        </h2>
                        <p className="text-xs text-slate-500">Selecciona las actividades y presiona el botón para generar las solicitudes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-xl overflow-hidden mt-1">
                    {isLoading ? (
                        <div className="p-6 text-center col-span-2 text-slate-400 flex items-center justify-center gap-2">
                            <LuLoader className="w-5 h-5 animate-spin" /> Cargando actividades...
                        </div>
                    ) : tiposTarea.length === 0 ? (
                        <div className="p-6 text-center col-span-2 text-slate-400">
                            No hay actividades configuradas.
                        </div>
                    ) : (
                        tiposTarea.map((tipo, index) => (
                            <label
                                key={tipo.id}
                                className={`flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors
                                    ${index % 2 === 0 ? "md:border-r md:border-slate-200" : ""}
                                    ${index < tiposTarea.length - (tiposTarea.length % 2 === 0 ? 2 : 1) ? "border-b border-slate-200" : ""}
                                    ${index === tiposTarea.length - 1 && tiposTarea.length % 2 !== 0 ? "md:col-span-2 md:border-r-0 border-b-0" : "border-b border-slate-200 md:border-b-0"}
                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTareas.includes(tipo.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedTareas([...selectedTareas, tipo.id]);
                                        } else {
                                            setSelectedTareas(selectedTareas.filter(id => id !== tipo.id));
                                        }
                                    }}
                                    className="w-4 h-4 text-navy-600 border-slate-300 rounded focus:ring-navy-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-slate-700">{tipo.nombre}</span>
                            </label>
                        ))
                    )}
                </div>
                {selectedTareas.length > 0 && (
                    <div className="flex flex-col gap-4 mt-4 animate-in fade-in duration-300">
                        <h3 className="text-sm font-semibold text-navy-900 border-b border-slate-100 pb-2">Contexto adicional (Opcional)</h3>
                        {selectedTareas.map(tareaId => {
                            const tipo = tiposTarea.find(t => t.id === tareaId);
                            return (
                                <div key={tareaId} className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tipo?.nombre}</label>
                                    <textarea
                                        value={notas[tareaId] || ''}
                                        onChange={(e) => setNotas({ ...notas, [tareaId]: e.target.value })}
                                        placeholder="Escribe alguna nota, instrucción o detalle sobre esta solicitud..."
                                        className="w-full h-20 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-600 focus:border-transparent outline-none resize-none transition-all"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                {selectedTareas.length > 0 && (
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                            onClick={handleSolicitarActividades}
                            disabled={isSubmitting}
                            className="bg-navy-600 hover:bg-navy-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? <LuLoader className="w-5 h-5 animate-spin" /> : "Solicitar Actividades"}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2.5 rounded-xl">
                            <LuFolderOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-base font-semibold text-navy-950">
                            Carpeta General
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-14">
                        Sube aquí documentos generales que aplican a varias tareas. Accesibles para el administrador y tu contador asignado.
                    </p>
                </div>

                <div className="flex flex-col gap-8 ml-14">
                    {isLoading ? (
                        <div className="text-slate-400 flex items-center gap-2 py-4">
                            <LuLoader className="w-5 h-5 animate-spin" /> Cargando carpetas...
                        </div>
                    ) : carpetas.map((carpeta) => (
                        <div key={carpeta.id} className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {carpeta.nombre}
                            </p>

                            {carpeta.archivos.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {carpeta.archivos.map((archivo: any) => (
                                        <FileAttachment
                                            key={archivo.id}
                                            nombreArchivo={archivo.nombre_archivo}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 text-center hover:border-navy-300 hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden">
                                {uploadingCategoria === carpeta.id ? (
                                    <>
                                        <LuLoader className="w-5 h-5 animate-spin text-navy-600" />
                                        <p className="text-sm font-medium text-navy-700">Subiendo archivo...</p>
                                    </>
                                ) : (
                                    <>
                                        <LuUpload className="w-5 h-5 text-slate-400 group-hover:text-navy-600 transition-colors" />
                                        <p className="text-sm font-medium text-slate-600 group-hover:text-navy-700">
                                            Añadir archivos a &ldquo;{carpeta.nombre}&rdquo;
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            PDF, ZIP, XML, imágenes · Máx. 20 MB c/u
                                        </p>
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            aria-label={`Subir archivo a ${carpeta.nombre}`}
                                            onChange={(e) => handleFileUpload(e, carpeta.id)}
                                            disabled={uploadingCategoria !== null}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
