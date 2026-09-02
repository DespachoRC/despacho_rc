import { KpiCard } from "@/app/components/ui/KpiCard";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import {
    LuBuilding2,
    LuUsers,
    LuCircleAlert,
    LuRefreshCw,
} from "react-icons/lu";

// datos mock de la cartera — se reemplazaran con fetch a la api cuando este lista
const mockCartera = [
    {
        id: "1",
        nombre: "Grupo Monterrey SA de CV",
        email: "contacto@grupomonterrey.mx",
        regimen: "Persona Moral",
        regimenVariant: "blue" as const,
        contador: "Ana Martínez García — Personas Morales, Nómina e IMSS",
        estatus: "Activo",
    },
    {
        id: "2",
        nombre: "Ferretería López e Hijos",
        email: "flopez@ferrilopez.mx",
        regimen: "Actividades Empresariales",
        regimenVariant: "purple" as const,
        contador: "Ana Martínez García — Personas Morales, Nómina e IMSS",
        estatus: "Activo",
    },
    {
        id: "3",
        nombre: "Consultores Nexus SC",
        email: "admin@nexussc.mx",
        regimen: "Régimen General de Ley",
        regimenVariant: "blue" as const,
        contador: "Carlos Ruiz Mendoza — Personas Físicas RESICO",
        estatus: "Activo",
    },
];

// opciones mock del select de contadores disponibles
const contadoresMock = [
    "Ana Martínez García — Personas Morales, Nómina e IMSS",
    "Carlos Ruiz Mendoza — Personas Físicas RESICO",
    "Patricia Vega Torres — Personas Morales, Personas Físicas RESICO",
];

export default function Metrics() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">

            {/* encabezado de la pagina */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
                <p className="text-sm text-dark-gray">Resumen general del despacho · Julio 2025</p>
            </div>

            {/* grid de tarjetas kpi */}
            <div className="grid grid-cols-3 gap-4">
                <KpiCard
                    icon={<LuBuilding2 />}
                    value={5}
                    label="Clientes Activos"
                    color="blue"
                />
                <KpiCard
                    icon={<LuUsers />}
                    value={3}
                    label="Contadores en Equipo"
                    color="blue"
                />
                <KpiCard
                    icon={<LuCircleAlert />}
                    value={2}
                    label="Declaraciones Pendientes (Mes)"
                    color="orange"
                />
            </div>

            {/* seccion de tabla de asignacion de cartera */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">

                {/* titulo de la seccion con conteo flotante a la derecha */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Asignación de Cartera de Clientes
                    </h2>
                    <span className="text-sm text-dark-gray">6 clientes</span>
                </div>

                {/* tabla con scroll horizontal en pantallas pequenas */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                    Cliente / Empresa
                                </th>
                                <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                    Régimen Fiscal
                                </th>
                                <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                    Contador Asignado
                                </th>
                                <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                    Estatus
                                </th>
                                <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCartera.map((cliente) => (
                                <tr
                                    key={cliente.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    {/* nombre y correo del cliente */}
                                    <td className="py-4 pr-6">
                                        <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                                        <p className="text-xs text-dark-gray mt-0.5">{cliente.email}</p>
                                    </td>

                                    {/* badge de regimen fiscal */}
                                    <td className="py-4 pr-6">
                                        <Badge text={cliente.regimen} variant={cliente.regimenVariant} />
                                    </td>

                                    {/* select para asignar o cambiar el contador */}
                                    <td className="py-4 pr-6">
                                        <select
                                            defaultValue={cliente.contador}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                                        >
                                            {contadoresMock.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* badge de estatus */}
                                    <td className="py-4 pr-6">
                                        <Badge text={cliente.estatus} variant="success" />
                                    </td>

                                    {/* boton de actualizar asignacion */}
                                    <td className="py-4">
                                        <Button
                                            text="Actualizar"
                                            className="px-5 py-2.5 text-sm gap-2"
                                            icon={<LuRefreshCw className="w-4 h-4" />}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}