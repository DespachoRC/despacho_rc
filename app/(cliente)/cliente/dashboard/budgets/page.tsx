"use client";

import { ExpandableCard, ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { useState, useEffect } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

export default function BudgetsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [presupuestos, setPresupuestos] = useState<any[]>([]);
    const [procesando, setProcesando] = useState<Record<string, boolean>>({});

    const fetchPresupuestos = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/cotizaciones/mis-cotizaciones");
            if (res.ok) {
                const json = await res.json();
                setPresupuestos(json.data || []);
            }
        } catch (error) {
            console.error("Error fetching presupuestos", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPresupuestos();
    }, []);

    const handleResponder = async (cotizacionId: string, respuesta: "aceptada" | "rechazada") => {
        setProcesando(prev => ({ ...prev, [cotizacionId]: true }));
        try {
            const res = await fetch(`/api/cotizaciones/${cotizacionId}/respuesta`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ respuesta }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                toast.success(respuesta === "aceptada" ? "Cotización aceptada" : "Cotización rechazada");
                fetchPresupuestos();
            } else {
                toast.error(json.error || "No se pudo procesar la respuesta");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setProcesando(prev => ({ ...prev, [cotizacionId]: false }));
        }
    };

    const getVariant = (estatus: string) => {
        switch (estatus.toLowerCase()) {
            case 'pendiente': return 'pending';
            case 'aceptada': return 'success';
            case 'rechazada': return 'danger';
            case 'cancelada': return 'ghost';
            default: return 'navy';
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Mis Presupuestos" 
                subtitle="Revisa las cotizaciones enviadas por el despacho y toma una decisión" 
            />

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <>
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                    </>
                ) : presupuestos.length > 0 ? (
                    presupuestos.map((presupuesto) => {
                        const estatusNombre = presupuesto.estatus_cotizacion?.nombre || 'Desconocido';
                        const esPendiente = estatusNombre.toLowerCase() === 'pendiente';
                        
                        return (
                            <ExpandableCard
                                key={presupuesto.id}
                                cliente="Tu Cotización"
                                estatusText={estatusNombre.toUpperCase()}
                                estatusVariant={getVariant(estatusNombre)}
                                subtitulo={presupuesto.titulo || "Solicitud"}
                                precio={presupuesto.precio ? `$${presupuesto.precio}` : 'Por definir'}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-navy-950 mb-1">Detalles</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {presupuesto.descripcion || presupuesto.notas_cliente || "No hay detalles adicionales."}
                                            </p>
                                        </div>
                                        {esPendiente && presupuesto.precio && (
                                            <div className="flex items-center gap-3 mt-4">
                                                <Button
                                                    text="Aceptar Cotización"
                                                    icon={<LuCheck />}
                                                    className="px-6 py-3"
                                                    disabled={procesando[presupuesto.id]}
                                                    onClick={() => handleResponder(presupuesto.id, "aceptada")}
                                                />
                                                <Button
                                                    text="Rechazar"
                                                    variant="destructive"
                                                    icon={<LuX />}
                                                    className="px-6 py-3"
                                                    disabled={procesando[presupuesto.id]}
                                                    onClick={() => handleResponder(presupuesto.id, "rechazada")}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ExpandableCard>
                        );
                    })
                ) : (
                    <div className="text-sm text-slate-500 italic text-center py-8">
                        No tienes presupuestos en este momento.
                    </div>
                )}
            </div>
        </div>
    );
}



