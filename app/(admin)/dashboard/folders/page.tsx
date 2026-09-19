"use client";

import { ClientFolderCardSkeleton } from "@/app/components/ui/ClientFolderCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { useState } from "react";

export default function Folders() {
    const [isLoading] = useState(true);

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Carpetas Generales" 
                subtitle="Documentos generales subidos por cada cliente, organizados por tipo de archivo" 
            />

            <div className="flex flex-col gap-6">
                {isLoading ? (
                    <>
                        <ClientFolderCardSkeleton />
                        <ClientFolderCardSkeleton />
                        <ClientFolderCardSkeleton />
                    </>
                ) : (
                    <div className="text-sm text-slate-500 italic">No hay carpetas disponibles.</div>
                )}
            </div>
        </div>
    );
}