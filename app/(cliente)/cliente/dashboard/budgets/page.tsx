"use client";

import { ExpandableCardSkeleton } from "@/app/components/ui/ExpandableCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { useState } from "react";

export default function BudgetsPage() {
    const [isLoading] = useState(true);

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
                ) : (
                    <div className="text-sm text-slate-500 italic">No tienes presupuestos pendientes.</div>
                )}
            </div>
        </div>
    );
}
