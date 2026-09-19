'use client';

import { ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { useState } from "react";

export default function Task() {
    const [isLoading] = useState(true);

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
                ) : (
                    <div className="text-sm text-slate-500 italic">No hay cotizaciones disponibles.</div>
                )}
            </div>
        </div>
    );
}