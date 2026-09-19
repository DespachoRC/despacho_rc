'use client';

import { useState } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/app/components/ui/DataTable";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";

interface ActividadMock {
    id: string;
    titulo: string;
    estatus: "pendiente" | "en_proceso" | "bloqueada" | "completada";
    cliente_nombre: string;
    contador_nombre: string;
    fecha_creacion: string;
}

export default function ActivitiesPage() {
    const [search, setSearch] = useState("");
    const [isLoading] = useState(true);

    const columns: ColumnDef<ActividadMock>[] = [
        {
            header: "Actividad",
            cell: (item) => (
                <div>
                    <p className="font-semibold text-navy-950">{item.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Creada: {item.fecha_creacion}</p>
                </div>
            )
        },
        {
            header: "Cliente",
            cell: (item) => (
                <span className="text-sm text-slate-700">{item.cliente_nombre}</span>
            )
        },
        {
            header: "Contador Asignado",
            cell: (item) => (
                <span className="text-sm text-slate-700">{item.contador_nombre}</span>
            )
        },
        {
            header: "Estatus",
            cell: (item) => {
                const variantMap: Record<string, "pending" | "navy" | "danger" | "success"> = {
                    pendiente: "pending",
                    en_proceso: "navy",
                    bloqueada: "danger",
                    completada: "success"
                };
                
                const labelMap: Record<string, string> = {
                    pendiente: "Pendiente",
                    en_proceso: "En Proceso",
                    bloqueada: "Bloqueada",
                    completada: "Completada"
                };

                return <Badge text={labelMap[item.estatus]} variant={variantMap[item.estatus]} />;
            }
        },
        {
            header: "Acciones",
            cell: () => (
                <Button 
                    text="Ver Detalles" 
                    variant="ghost" 
                    className="px-3 py-1.5 text-xs" 
                />
            )
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
                    data={[]}
                    isLoading={isLoading}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Buscar por actividad o cliente..."
                    onSearch={(val) => setSearch(val)}
                />
            </div>
        </div>
    );
}
