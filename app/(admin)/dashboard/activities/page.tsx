'use client';

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/app/components/ui/DataTable";
import { Badge } from "@/app/components/ui/Badge";
import toast from "react-hot-toast";

interface Actividad {
    id: string;
    titulo: string;
    fecha_creacion: string;
    estatus_actividad: { nombre: string } | null;
    usuarios: { nombre: string; apellido_paterno: string } | null;
    contador: { nombre: string; apellido_paterno: string } | null;
}

export default function ActivitiesPage() {
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActividades = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/admin/actividades");
                if (res.ok) {
                    const json = await res.json();
                    setActividades(json.data || []);
                } else {
                    toast.error("Error al cargar las actividades");
                }
            } catch {
                toast.error("Error de conexión");
            } finally {
                setIsLoading(false);
            }
        };
        fetchActividades();
    }, []);

    const columns: ColumnDef<Actividad>[] = [
        {
            header: "Actividad",
            cell: (item) => (
                <div>
                    <p className="font-semibold text-navy-950">{item.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(item.fecha_creacion).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                </div>
            )
        },
        {
            header: "Cliente",
            cell: (item) => (
                <span className="text-sm text-slate-700">
                    {item.usuarios ? `${item.usuarios.nombre} ${item.usuarios.apellido_paterno}` : "—"}
                </span>
            )
        },
        {
            header: "Contador Asignado",
            cell: (item) => (
                <span className="text-sm text-slate-700">
                    {item.contador ? `${item.contador.nombre} ${item.contador.apellido_paterno}` : "—"}
                </span>
            )
        },
        {
            header: "Estatus",
            cell: (item) => {
                const estatus = item.estatus_actividad?.nombre ?? "desconocido";
                const variantMap: Record<string, "pending" | "navy" | "danger" | "success" | "ghost"> = {
                    pendiente: "pending",
                    en_proceso: "navy",
                    bloqueada: "danger",
                    completada: "success",
                };
                const labelMap: Record<string, string> = {
                    pendiente: "Pendiente",
                    en_proceso: "En Proceso",
                    bloqueada: "Bloqueada",
                    completada: "Completada",
                };
                return <Badge text={labelMap[estatus] ?? estatus} variant={variantMap[estatus] ?? "ghost"} />;
            }
        }
    ];

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Actividades" 
                subtitle="Monitorea las actividades en curso y su estado actual" 
            />

            <div className="flex flex-col gap-4">
                <DataTable 
                    data={actividades}
                    isLoading={isLoading}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Buscar por actividad o cliente..."
                />
            </div>
        </div>
    );
}


