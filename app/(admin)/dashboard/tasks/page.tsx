'use client';

import { ExpandableCard, ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Tabs } from "@/app/components/ui/Tabs";
import { useState, useEffect, useMemo } from "react";
import { LuCheck, LuX, LuArrowRight, LuRefreshCw } from "react-icons/lu";
import Link from "next/link";
import toast from "react-hot-toast";

interface CotizacionItem {
    id: string;
    titulo: string;
    descripcion: string | null;
    notas_cliente: string | null;
    precio: number | null;
    fecha_creacion: string;
    estatus_id: string;
    estatus_cotizacion?: { nombre: string } | null;
    cotizacion_actividades?: {
        id: string;
        titulo_snapshot: string;
        notas_cliente: string | null;
    }[];
    usuarios?: {
        nombre: string;
        apellido_paterno: string;
    } | null;
}

export default function Task() {
    const [isLoading, setIsLoading] = useState(true);
    const [cotizaciones, setCotizaciones] = useState<CotizacionItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>("por_cotizar");
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

    // Conteo por categoría
    const counts = useMemo(() => {
        let porCotizar = 0;
        let esperando = 0;
        let aceptadas = 0;
        let rechazadas = 0;

        cotizaciones.forEach((c) => {
            const estatus = c.estatus_cotizacion?.nombre || "pendiente";
            const tienePrecio = c.precio !== null && c.precio !== undefined;

            if (estatus === "pendiente") {
                if (!tienePrecio) {
                    porCotizar++;
                } else {
                    esperando++;
                }
            } else if (estatus === "aceptada") {
                aceptadas++;
            } else if (estatus === "rechazada" || estatus === "cancelada") {
                rechazadas++;
            }
        });

        return {
            porCotizar,
            esperando,
            aceptadas,
            rechazadas,
            total: cotizaciones.length,
        };
    }, [cotizaciones]);

    // Filtrado de acuerdo con la pestaña activa
    const cotizacionesFiltradas = useMemo(() => {
        return cotizaciones.filter((c) => {
            const estatus = c.estatus_cotizacion?.nombre || "pendiente";
            const tienePrecio = c.precio !== null && c.precio !== undefined;

            if (activeTab === "por_cotizar") {
                return estatus === "pendiente" && !tienePrecio;
            }
            if (activeTab === "esperando") {
                return estatus === "pendiente" && tienePrecio;
            }
            if (activeTab === "aceptadas") {
                return estatus === "aceptada";
            }
            if (activeTab === "rechazadas") {
                return estatus === "rechazada" || estatus === "cancelada";
            }
            return true; // "todas"
        });
    }, [cotizaciones, activeTab]);

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
                toast.success("Precio fijado. El cliente ya puede revisar y aprobar el presupuesto.");
                setPrecios(prev => {
                    const copy = { ...prev };
                    delete copy[cotId];
                    return copy;
                });
                fetchCotizaciones();
            } else {
                toast.error(json.error || "No se pudo actualizar la cotización");
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

    const tabsConfig = [
        { label: "Por Cotizar", count: counts.porCotizar, value: "por_cotizar" },
        { label: "Esperando al Cliente", count: counts.esperando, value: "esperando" },
        { label: "Aceptadas", count: counts.aceptadas, value: "aceptadas" },
        { label: "Rechazadas", count: counts.rechazadas, value: "rechazadas" },
        { label: "Todas", count: counts.total, value: "todas" },
    ];

    return (
        <div className="w-full h-full min-h-0 flex flex-col gap-6 overflow-hidden pr-1">
            <PageHeader 
                title="Cotizaciones" 
                subtitle="Gestión y seguimiento de cotizaciones recibidas de los clientes" 
            />

            {/* Clasificación por pestañas */}
            <div className="shrink-0 overflow-x-auto pb-1">
                <Tabs 
                    tabs={tabsConfig} 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                />
            </div>

            <div className="scrollbar-hidden flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1">
                {isLoading ? (
                    <>
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                        <ExpandableCardSkeleton />
                    </>
                ) : cotizacionesFiltradas.length > 0 ? (
                    cotizacionesFiltradas.map((cot) => {
                        const estatus = cot.estatus_cotizacion?.nombre || "pendiente";
                        const tienePrecio = cot.precio !== null && cot.precio !== undefined;
                        const cantidadActividades = cot.cotizacion_actividades?.length || 1;
                        
                        let estatusText = "Por Cotizar";
                        let estatusVariant: "pending" | "navy" | "success" | "danger" | "ghost" = "pending";

                        if (estatus === "aceptada") {
                            estatusText = "Aceptada";
                            estatusVariant = "success";
                        } else if (estatus === "rechazada") {
                            estatusText = "Rechazada";
                            estatusVariant = "danger";
                        } else if (estatus === "cancelada") {
                            estatusText = "Cancelada";
                            estatusVariant = "ghost";
                        } else if (tienePrecio) {
                            estatusText = "Esperando al Cliente";
                            estatusVariant = "navy";
                        }

                        const fechaFormateada = cot.fecha_creacion 
                            ? new Date(cot.fecha_creacion).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                            : "";

                        return (
                            <ExpandableCard
                                key={cot.id}
                                cliente={`${cot.usuarios?.nombre || "Cliente"} ${cot.usuarios?.apellido_paterno || ""}`.trim()}
                                estatusText={estatusText}
                                estatusVariant={estatusVariant}
                                subtitulo={`${cot.titulo || "Solicitud de cotización"} • ${fechaFormateada}`}
                                precio={tienePrecio ? `$${cot.precio}` : undefined}
                            >
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-navy-950 mb-1">Descripción de la Solicitud</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {cot.descripcion || cot.notas_cliente || "Sin descripción proporcionada."}
                                        </p>
                                    </div>
                                    {!!cot.cotizacion_actividades?.length && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-navy-950 mb-1">Servicios incluidos</h4>
                                            <ul className="space-y-2">
                                                {cot.cotizacion_actividades.map((actividad) => (
                                                    <li
                                                        key={actividad.id}
                                                        className="rounded-lg bg-slate-50 px-3 py-2"
                                                    >
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {actividad.titulo_snapshot}
                                                        </p>
                                                        {actividad.notas_cliente && (
                                                            <p className="mt-1 text-xs text-slate-500 whitespace-pre-line">
                                                                {actividad.notas_cliente}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Acciones y detalle según estado */}
                                    {estatus === "aceptada" ? (
                                        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-950">
                                                    Presupuesto Aceptado: <span className="font-bold text-emerald-700">${cot.precio} MXN</span>
                                                </p>
                                                <p className="text-xs text-emerald-700/90 mt-0.5">
                                                    Esta cotización generó {cantidadActividades} {cantidadActividades === 1 ? "actividad" : "actividades"} para el contador asignado.
                                                </p>
                                            </div>
                                            <Link href="/dashboard/activities">
                                                <Button
                                                    text="Ver Actividades"
                                                    variant="outline"
                                                    icon={<LuArrowRight />}
                                                    iconPosition="right"
                                                    className="text-xs py-2 px-3 border-emerald-600 text-emerald-800 hover:bg-emerald-100/50 whitespace-nowrap"
                                                />
                                            </Link>
                                        </div>
                                    ) : estatus === "rechazada" || estatus === "cancelada" ? (
                                        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/70 flex flex-col gap-3 mt-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <p className="text-sm font-semibold text-rose-950">
                                                    Cotización {estatus === "cancelada" ? "Cancelada" : "Rechazada"}
                                                    {tienePrecio && <span className="font-normal text-rose-800"> (Último precio: ${cot.precio} MXN)</span>}
                                                </p>
                                                <span className="text-xs text-rose-600 italic">
                                                    Puedes reabrirla fijando una nueva propuesta de precio
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-rose-200/50 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        htmlFor={`precio-reabrir-${cot.id}`}
                                                        name="precio"
                                                        type="number"
                                                        label="Nuevo Precio (MXN)"
                                                        placeholder="0.00"
                                                        value={precios[cot.id] ?? ""}
                                                        onChange={(e) =>
                                                            setPrecios(prev => ({ ...prev, [cot.id]: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    text="Reabrir y Cotizar"
                                                    variant="solid"
                                                    icon={<LuRefreshCw />}
                                                    className="px-4 py-3 text-sm whitespace-nowrap"
                                                    disabled={procesando[cot.id] || precios[cot.id] === undefined || precios[cot.id].trim() === ""}
                                                    onClick={() => handleAprobar(cot.id)}
                                                />
                                            </div>
                                        </div>
                                    ) : tienePrecio ? (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">
                                                    Precio actual enviado: <span className="font-bold text-navy-800">${cot.precio} MXN</span>
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Esperando que el cliente acepte o decline desde su panel
                                                </p>
                                            </div>
                                            <div className="flex items-end gap-2 w-full sm:w-auto">
                                                <div className="w-36">
                                                    <Input
                                                        htmlFor={`precio-ajuste-${cot.id}`}
                                                        name="precio"
                                                        type="number"
                                                        placeholder="Ajustar precio"
                                                        value={precios[cot.id] ?? ""}
                                                        onChange={(e) =>
                                                            setPrecios(prev => ({ ...prev, [cot.id]: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    text="Ajustar"
                                                    variant="outline"
                                                    className="px-3 py-3 text-xs whitespace-nowrap"
                                                    disabled={procesando[cot.id] || precios[cot.id] === undefined || precios[cot.id].trim() === ""}
                                                    onClick={() => handleAprobar(cot.id)}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mt-1">
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
                                        </div>
                                    )}
                                    </div>
                            </ExpandableCard>
                        );
                    })
                ) : (
                    <div className="text-sm text-slate-500 italic text-center py-12 bg-white rounded-2xl border border-slate-200">
                        {activeTab === "por_cotizar" && "No hay cotizaciones pendientes por cotizar."}
                        {activeTab === "esperando" && "No hay cotizaciones en espera de respuesta del cliente."}
                        {activeTab === "aceptadas" && "No hay cotizaciones aceptadas aún."}
                        {activeTab === "rechazadas" && "No hay cotizaciones rechazadas o canceladas."}
                        {activeTab === "todas" && "No hay cotizaciones registradas en este momento."}
                    </div>
                )}
            </div>
        </div>
    );
}
