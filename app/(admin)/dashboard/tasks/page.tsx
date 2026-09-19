'use client';

import { ExpandableCard, ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useState, useEffect } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

export default function Task() {
    const [isLoading, setIsLoading] = useState(true);
    const [cotizaciones, setCotizaciones] = useState<any[]>([]);
    // mapa de cotizacion.id → precio ingresado por el admin
    const [precios, setPrecios] = useState<Record<string, string>>({});
    const [procesando, setProcesando] = useState<Record<string, boolean>>({});

    const fetchCotizaciones = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/cotizaciones");
            if (res.ok) {
                const json = await res.json();
                setCotizaciones(json.data || []);
            } else {
                toast.error("Error al cargar cotizaciones");
            }
        } catch (error) {
            console.error("Error fetching cotizaciones", error);
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    const handleAprobar = async (cotId: string) => {
        const precio = parseFloat(precios[cotId] ?? "");
        if (isNaN(precio) || precio < 0) {
            toast.error("Ingresa un precio válido (puede ser 0 para servicios de cortesía)");
            return;
        }
        setProcesando(prev => ({ ...prev, [cotId]: true }));
        try {
            const res = await fetch(`/api/cotizaciones/${cotId}/precio`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ precio }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                toast.success("Cotización aprobada. Se ha creado la actividad para el contador.");
                fetchCotizaciones();
            } else {
                toast.error(json.error || "No se pudo aprobar la cotización");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setProcesando(prev => ({ ...prev, [cotId]: false }));
        }
    };

    const handleRechazar = async (cotId: string) => {
        setProcesando(prev => ({ ...prev, [cotId]: true }));
        try {
            const res = await fetch(`/api/cotizaciones/${cotId}/rechazar`, {
                method: "PUT",
            });
            const json = await res.json();
            if (res.ok && json.success) {
                toast.success("Cotización rechazada");
                fetchCotizaciones();
            } else {
                toast.error(json.error || "No se pudo rechazar la cotización");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setProcesando(prev => ({ ...prev, [cotId]: false }));
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Cotizaciones" 
                subtitle="Bandeja de solicitudes de cotización recibidas de los clientes" 
            />

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <>
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                    </>
                ) : cotizaciones.length > 0 ? (
                    cotizaciones.map((cot) => {
                        const yaCotizada = cot.precio !== null && cot.precio !== undefined;
                        return (
                            <ExpandableCard
                                key={cot.id}
                                cliente={`${cot.usuarios?.nombre || "Desconocido"} ${cot.usuarios?.apellido_paterno || ""}`}
                                estatusText={yaCotizada ? "Esperando al Cliente" : "Por Cotizar"}
                                estatusVariant={yaCotizada ? "navy" : "pending"}
                                subtitulo={cot.titulo || "Solicitud de cotización"}
                                precio={yaCotizada ? `$${cot.precio}` : undefined}
                            >
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 flex flex-col gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-navy-950 mb-1">Descripción de la Solicitud</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {cot.descripcion || cot.notas_cliente || "Sin descripción proporcionada."}
                                        </p>
                                    </div>
                                    <div className="flex items-end gap-4 mt-2">
                                        {yaCotizada ? (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 flex items-center justify-between">
                                                <p className="text-sm font-medium text-slate-600">
                                                    Precio fijado en <span className="font-bold text-navy-700">${cot.precio} MXN</span>
                                                </p>
                                                <p className="text-xs text-slate-400 italic">
                                                    Esperando que el cliente acepte
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1">
                                                    <Input
                                                        htmlFor={`precio-${cot.id}`}
                                                        name="precio"
                                                        type="number"
                                                        label="Fijar Precio (MXN)"
                                                        placeholder="0.00"
                                                        value={precios[cot.id] ?? ""}
                                                        onChange={(e) =>
                                                            setPrecios(prev => ({ ...prev, [cot.id]: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pb-0.5">
                                                    <Button
                                                        text="Aprobar"
                                                        icon={<LuCheck />}
                                                        className="px-4 py-3"
                                                        disabled={procesando[cot.id]}
                                                        onClick={() => handleAprobar(cot.id)}
                                                    />
                                                    <Button
                                                        text="Rechazar"
                                                        variant="destructive"
                                                        icon={<LuX />}
                                                        className="px-4 py-3"
                                                        disabled={procesando[cot.id]}
                                                        onClick={() => handleRechazar(cot.id)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ExpandableCard>
                    );
                })
                ) : (
                    <div className="text-sm text-slate-500 italic text-center py-8">
                        No hay cotizaciones pendientes en este momento.
                    </div>
                )}
            </div>
        </div>
    );
}
