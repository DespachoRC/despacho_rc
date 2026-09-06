import { KpiCard } from "@/app/components/ui/KpiCard";
import { Badge } from "@/app/components/ui/Badge";
import {
    LuCircleAlert,
    LuClock,
    LuCircleCheck,
    LuUsers,
    LuBuilding2,
} from "react-icons/lu";

// kpis de la vista del contador
const kpis = [
    { value: 2, label: "Tareas Urgentes",    color: "orange" as const, icon: <LuCircleAlert /> },
    { value: 5, label: "En Proceso",         color: "blue"   as const, icon: <LuClock /> },
    { value: 8, label: "Completadas (Mes)",  color: "green"  as const, icon: <LuCircleCheck /> },
    { value: 3, label: "Clientes Asignados", color: "purple" as const, icon: <LuUsers /> },
];

// clientes asignados a la contadora — datos mock
const clientes = [
    {
        id: 1,
        nombre: "Grupo Monterrey SA de CV",
        correo: "contacto@grupomonterrey.mx",
        regimen: "Persona Moral",
        regimenVariant: "blue" as const,
        tareasPendientes: 1,
    },
    {
        id: 2,
        nombre: "Ferretería López e Hijos",
        correo: "flopez@ferrilopez.mx",
        regimen: "Actividades Empresariales",
        regimenVariant: "purple" as const,
        tareasPendientes: 1,
    },
    {
        id: 3,
        nombre: "María Elena Sandoval",
        correo: "m.sandoval@gmail.com",
        regimen: "RESICO - Personas Físicas",
        regimenVariant: "teal" as const,
        tareasPendientes: 1,
    },
];

export default function ClientsPage() {
    return (
        <div className="flex flex-col gap-6 p-6">

            {/* encabezado de la vista */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Mis Clientes
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Vista general de tu cartera · Julio 2025
                </p>
            </div>

            {/* fila de kpis — grid de 4 columnas */}
            <div className="grid grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <KpiCard
                        key={kpi.label}
                        icon={kpi.icon}
                        value={kpi.value}
                        label={kpi.label}
                        color={kpi.color}
                    />
                ))}
            </div>

            {/* grid de tarjetas de clientes — 2 columnas */}
            <div className="grid grid-cols-2 gap-4">
                {clientes.map((cliente) => (
                    <div
                        key={cliente.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        {/* icono y datos del cliente */}
                        <div className="flex flex-col gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <LuBuilding2 className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-gray-900 text-sm">
                                    {cliente.nombre}
                                </span>
                                <span className="text-xs text-blue-400">
                                    {cliente.correo}
                                </span>
                            </div>

                            {/* badge del regimen fiscal */}
                            <Badge variant={cliente.regimenVariant} text={cliente.regimen} />
                        </div>

                        {/* alerta de tareas pendientes */}
                        {cliente.tareasPendientes > 0 && (
                            <div className="flex items-center gap-1.5 text-orange-500">
                                <LuCircleAlert className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-medium">
                                    {cliente.tareasPendientes} tarea pendiente de entregar
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
