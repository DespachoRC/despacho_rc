import { KpiCardSkeleton } from "@/app/components/ui/KpiCard";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { LuBuilding2 } from "react-icons/lu";

function ClientCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 animate-pulse">
            <div className="flex flex-col gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-xl" />
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-44 bg-slate-200 rounded" />
                </div>
                <div className="h-5 w-28 bg-slate-200 rounded-full mt-1" />
            </div>
        </div>
    );
}

export default function ClientsPage() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader
                title="Mis Clientes"
                subtitle="Vista general de tu cartera"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ClientCardSkeleton />
                <ClientCardSkeleton />
                <ClientCardSkeleton />
            </div>

            <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                <LuBuilding2 className="w-4 h-4" />
                <p className="text-xs">
                    Los clientes se cargarán cuando el endpoint esté disponible.
                </p>
            </div>
        </div>
    );
}
