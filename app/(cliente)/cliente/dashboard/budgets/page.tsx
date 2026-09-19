"use client";

import { ExpandableCard, ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { useState, useEffect } from "react";
import { LuCheck, LuX } from "react-icons/lu";

export default function BudgetsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [presupuestos, setPresupuestos] = useState<any[]>([]);

    useEffect(() => {
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
        fetchPresupuestos();
    }, []);

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
                    presupuestos.map((presupuesto, idx) => {
                        const estatusNombre = presupuesto.estatus_cotizacion?.nombre || 'Desconocido';
                        
                        return (
                            <ExpandableCard
                                key={idx}
                                cliente="Tu Cotización" // No renderizamos el nombre del cliente porque el cliente se ve a sí mismo
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
                                        {estatusNombre.toLowerCase() === 'pendiente' && presupuesto.precio && (
                                            <div className="flex items-center gap-3 mt-4">
                                                <Button
                                                    text="Aceptar Cotización"
                                                    icon={<LuCheck />}
                                                    className="px-6 py-3"
                                                />
                                                <Button
                                                    text="Rechazar"
                                                    variant="destructive"
                                                    icon={<LuX />}
                                                    className="px-6 py-3"
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
