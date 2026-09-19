'use client';

import { ExpandableCard, ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useState, useEffect } from "react";
import { LuCheck, LuX } from "react-icons/lu";

export default function Task() {
    const [isLoading, setIsLoading] = useState(true);
    const [cotizaciones, setCotizaciones] = useState<any[]>([]);

    useEffect(() => {
        const fetchCotizaciones = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/cotizaciones");
                if (res.ok) {
                    const json = await res.json();
                    setCotizaciones(json.data || []);
                }
            } catch (error) {
                console.error("Error fetching cotizaciones", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCotizaciones();
    }, []);

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
                    cotizaciones.map((cot, idx) => (
                        <ExpandableCard
                            key={idx}
                            cliente={`${cot.usuarios?.nombre || "Desconocido"} ${cot.usuarios?.apellido_paterno || ""}`}
                            estatusText="Pendiente"
                            estatusVariant="pending"
                            subtitulo={cot.titulo || "Solicitud de cotización"}
                            precio={cot.precio ? `$${cot.precio}` : undefined}
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 flex flex-col gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-navy-950 mb-1">Descripción de la Solicitud</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {cot.descripcion || cot.notas_cliente || "Sin descripción proporcionada."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex-1">
                                            <Input
                                                htmlFor={`precio-${cot.id}`}
                                                name="precio"
                                                type="number"
                                                label="Fijar Precio (MXN)"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="flex items-end gap-2 pb-0.5">
                                            <Button
                                                text="Aprobar"
                                                icon={<LuCheck />}
                                                className="px-4 py-3"
                                            />
                                            <Button
                                                text="Rechazar"
                                                variant="destructive"
                                                icon={<LuX />}
                                                className="px-4 py-3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ExpandableCard>
                    ))
                ) : (
                    <div className="text-sm text-slate-500 italic text-center py-8">
                        No hay cotizaciones pendientes en este momento.
                    </div>
                )}
            </div>
        </div>
    );
}