"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { Tabs } from "@/app/components/ui/Tabs";
import { LuPlus, LuCheck } from "react-icons/lu";

// datos mock de los clientes
const mockClientes = [
    {
        id: "1",
        nombre: "Grupo Monterrey SA de CV",
        email: "contacto@grupomonterrey.mx",
        regimen: "Persona Moral",
        regimenVariant: "blue" as const,
        estatus: "Activo",
    },
    {
        id: "2",
        nombre: "Ferretería López e Hijos",
        email: "flopez@ferrilopez.mx",
        regimen: "Actividades Empresariales",
        regimenVariant: "purple" as const,
        estatus: "Activo",
    },
    {
        id: "3",
        nombre: "Consultores Nexus SC",
        email: "admin@nexussc.mx",
        regimen: "Régimen General de Ley",
        regimenVariant: "blue" as const,
        estatus: "Activo",
    },
    {
        id: "4",
        nombre: "María Elena Sandoval",
        email: "m.sandoval@gmail.com",
        regimen: "RESICO - Personas Físicas",
        regimenVariant: "teal" as const,
        estatus: "Activo",
    },
    {
        id: "5",
        nombre: "Inmobiliaria Cenit SA",
        email: "cenit@inmocenit.mx",
        regimen: "Régimen de Arrendamiento",
        regimenVariant: "orange" as const,
        estatus: "Activo",
    },
];

// datos mock de los contadores
const mockContadores = [
    {
        id: "1",
        nombre: "Ana Martínez García",
        email: "ana@despacho.mx",
        especialidades: ["Personas Morales", "Nómina e IMSS"],
        estatus: "Activo",
    },
    {
        id: "2",
        nombre: "Carlos Ruiz Mendoza",
        email: "carlos@despacho.mx",
        especialidades: ["Personas Físicas RESICO", "Plataformas Digitales"],
        estatus: "Activo",
    },
    {
        id: "3",
        nombre: "Patricia Vega Torres",
        email: "patricia@despacho.mx",
        especialidades: ["Personas Morales", "Personas Físicas RESICO"],
        estatus: "Activo",
    },
];

export default function UsersManagement() {
    const [activeTab, setActiveTab] = useState<string>("clientes");
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const tabsData = [
        { label: "Clientes", count: 6, value: "clientes" },
        { label: "Contadores", count: 3, value: "contadores" },
    ];

    const currentButtonText = activeTab === "clientes" ? "Nuevo Cliente" : "Nuevo Contador";

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            {/* encabezado principal de gestion de usuarios */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-sm text-dark-gray">
                        Registra y administra clientes y contadores del despacho
                    </p>
                </div>
                {/* boton de nuevo registro se oculta si ya se esta creando uno */}
                {!isCreating && (
                    <Button
                        text={currentButtonText}
                        className="px-6 py-3 text-sm gap-2"
                        icon={<LuPlus className="w-4 h-4" />}
                        onClick={() => setIsCreating(true)}
                    />
                )}
            </div>

            {/* pestañas de seleccion, se ocultan si iscreating es true */}
            {!isCreating && (
                <div>
                    <Tabs
                        tabs={tabsData}
                        activeTab={activeTab}
                        onChange={(val) => setActiveTab(val)}
                    />
                </div>
            )}

            {/* flujo condicional: formulario de registro o tabla de listado */}
            {isCreating ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        {activeTab === "clientes" ? "Registrar Nuevo Cliente" : "Registrar Nuevo Contador"}
                    </h2>

                    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Nombre / Razón Social"
                                type="text"
                                htmlFor="nombre"
                                name="nombre"
                                placeHolder="Ej. Grupo Monterrey SA de CV"
                            />
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                htmlFor="email"
                                name="email"
                                placeHolder="correo@empresa.mx"
                            />
                            <Input
                                label="Contraseña Temporal"
                                type="password"
                                htmlFor="password"
                                name="password"
                                placeHolder="••••••••"
                            />

                            {/* campos especificos de clientes */}
                            {activeTab === "clientes" && (
                                <div className="flex flex-col gap-2 w-full">
                                    <label htmlFor="regimen" className="text-sm font-medium text-gray-700">
                                        Régimen Fiscal
                                    </label>
                                    <select
                                        id="regimen"
                                        className="w-full bg-gray border border-gray rounded-xl p-4 focus:outline-dark-gray text-sm cursor-pointer"
                                    >
                                        <option value="">Selecciona un régimen...</option>
                                        <option value="resico">RESICO - Personas Físicas</option>
                                        <option value="general">Régimen General de Ley</option>
                                        <option value="moral">Persona Moral</option>
                                        <option value="arrendamiento">Régimen de Arrendamiento</option>
                                        <option value="empresarial">Actividades Empresariales</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* campos especificos de contadores: checkboxes de especialidades */}
                        {activeTab === "contadores" && (
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    Especialidades
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        "Personas Morales",
                                        "Personas Físicas RESICO",
                                        "Nómina e IMSS",
                                        "Plataformas Digitales",
                                    ].map((especialidad, idx) => (
                                        <label
                                            key={idx}
                                            className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-primary text-primary"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">
                                                {especialidad}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* botones de accion del formulario */}
                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                text="Guardar Registro"
                                type="submit"
                                className="px-6 py-3.5 text-sm gap-2"
                                icon={<LuCheck className="w-4 h-4" />}
                                onClick={() => setIsCreating(false)}
                            />
                            <button
                                type="button"
                                className="px-6 py-3.5 bg-gray hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                                onClick={() => setIsCreating(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* listado de usuarios (tablas) */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {activeTab === "clientes" ? (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                            Cliente
                                        </th>
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                            Régimen
                                        </th>
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                            Estatus
                                        </th>
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockClientes.map((cliente) => (
                                        <tr
                                            key={cliente.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-4 pr-6">
                                                <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                                                <p className="text-xs text-dark-gray mt-0.5">{cliente.email}</p>
                                            </td>
                                            <td className="py-4 pr-6">
                                                <Badge text={cliente.regimen} variant={cliente.regimenVariant} />
                                            </td>
                                            <td className="py-4 pr-6">
                                                <Badge text={cliente.estatus} variant="success" />
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    type="button"
                                                    className="bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
                                                >
                                                    Dar de Baja
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                            Contador
                                        </th>
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                            Especialidades
                                        </th>
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3 pr-6">
                                            Estatus
                                        </th>
                                        <th className="text-left text-xs font-semibold text-dark-gray uppercase tracking-wider pb-3">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockContadores.map((contador) => (
                                        <tr
                                            key={contador.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-4 pr-6">
                                                <p className="font-semibold text-gray-900">{contador.nombre}</p>
                                                <p className="text-xs text-dark-gray mt-0.5">{contador.email}</p>
                                            </td>
                                            <td className="py-4 pr-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {contador.especialidades.map((esp, i) => (
                                                        <Badge key={i} text={esp} variant="orange" />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-6">
                                                <Badge text={contador.estatus} variant="success" />
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    type="button"
                                                    className="bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
                                                >
                                                    Inactivar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}