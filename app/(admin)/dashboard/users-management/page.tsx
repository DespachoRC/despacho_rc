'use client';

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { Tabs } from "@/app/components/ui/Tabs";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/app/components/ui/DataTable";
import { LuPlus, LuCheck } from "react-icons/lu";

interface ClienteMock {
    id: string;
    nombre: string;
    email: string;
    regimen: string;
    regimenVariant: "navy" | "teal" | "amber" | "ghost" | "success" | "danger" | "pending";
    estatus: string;
}

interface ContadorMock {
    id: string;
    nombre: string;
    email: string;
    especialidades: string[];
    estatus: string;
}

export default function UsersManagement() {
    const [activeTab, setActiveTab] = useState<string>("clientes");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isLoading] = useState<boolean>(true);

    const tabsData = [
        { label: "Clientes", count: 0, value: "clientes" },
        { label: "Contadores", count: 0, value: "contadores" },
    ];

    const clienteColumns: ColumnDef<ClienteMock>[] = [
        {
            header: "Cliente",
            cell: (item) => (
                <div>
                    <p className="font-semibold text-navy-950">{item.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                </div>
            )
        },
        {
            header: "Régimen",
            cell: (item) => <Badge text={item.regimen} variant={item.regimenVariant} />
        },
        {
            header: "Estatus",
            cell: (item) => <Badge text={item.estatus} variant="success" />
        },
        {
            header: "Acción",
            cell: () => (
                <Button 
                    text="Dar de Baja" 
                    variant="destructive" 
                    className="px-3 py-1.5 text-xs" 
                />
            )
        }
    ];

    const contadorColumns: ColumnDef<ContadorMock>[] = [
        {
            header: "Contador",
            cell: (item) => (
                <div>
                    <p className="font-semibold text-navy-950">{item.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                </div>
            )
        },
        {
            header: "Especialidades",
            cell: (item) => (
                <div className="flex flex-wrap gap-1.5">
                    {item.especialidades.map((esp, i) => (
                        <Badge key={i} text={esp} variant="amber" />
                    ))}
                </div>
            )
        },
        {
            header: "Estatus",
            cell: (item) => <Badge text={item.estatus} variant="success" />
        },
        {
            header: "Acción",
            cell: () => (
                <Button 
                    text="Inactivar" 
                    variant="destructive" 
                    className="px-3 py-1.5 text-xs" 
                />
            )
        }
    ];

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Gestión de Usuarios" 
                subtitle="Registra y administra clientes y contadores del despacho"
                action={
                    !isCreating ? (
                        <Button
                            text={activeTab === "clientes" ? "Nuevo Cliente" : "Nuevo Contador"}
                            className="px-5 py-3 text-base"
                            icon={<LuPlus className="w-5 h-5" />}
                            onClick={() => setIsCreating(true)}
                        />
                    ) : null
                }
            />

            {!isCreating && (
                <div>
                    <Tabs
                        tabs={tabsData}
                        activeTab={activeTab}
                        onChange={(val) => setActiveTab(val)}
                    />
                </div>
            )}

            {isCreating ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-navy-950">
                        {activeTab === "clientes" ? "Registrar Nuevo Cliente" : "Registrar Nuevo Contador"}
                    </h2>

                    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nombre / Razón Social"
                                type="text"
                                htmlFor="nombre"
                                name="nombre"
                                placeholder="Ej. Grupo Monterrey SA de CV"
                            />
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                htmlFor="email"
                                name="email"
                                placeholder="correo@empresa.mx"
                            />
                            <Input
                                label="Contraseña Temporal"
                                type="password"
                                htmlFor="password"
                                name="password"
                                placeholder="••••••••"
                            />

                            {activeTab === "clientes" && (
                                <div className="flex flex-col gap-2 w-full">
                                    <label htmlFor="regimen" className="text-base font-medium text-slate-700">
                                        Régimen Fiscal
                                    </label>
                                    <select
                                        id="regimen"
                                        className="w-full bg-navy-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-navy-700 transition-all text-base cursor-pointer"
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

                        {activeTab === "contadores" && (
                            <div className="flex flex-col gap-3">
                                <span className="text-base font-semibold text-slate-700 uppercase tracking-wider">
                                    Especialidades
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "Personas Morales",
                                        "Personas Físicas RESICO",
                                        "Nómina e IMSS",
                                        "Plataformas Digitales",
                                    ].map((especialidad, idx) => (
                                        <label
                                            key={idx}
                                            className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 border-slate-300 rounded text-navy-600 focus:ring-navy-600"
                                            />
                                            <span className="text-base text-slate-700 font-medium">
                                                {especialidad}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                text="Guardar Registro"
                                type="submit"
                                className="px-6 py-3 text-base"
                                icon={<LuCheck className="w-5 h-5" />}
                                onClick={() => setIsCreating(false)}
                            />
                            <Button
                                text="Cancelar"
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 text-base"
                            />
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col gap-4 mt-2">
                    {activeTab === "clientes" ? (
                        <DataTable 
                            data={[]}
                            isLoading={isLoading}
                            columns={clienteColumns}
                            keyExtractor={(item) => item.id}
                            searchPlaceholder="Buscar clientes..."
                            onSearch={() => {}}
                        />
                    ) : (
                        <DataTable 
                            data={[]}
                            isLoading={isLoading}
                            columns={contadorColumns}
                            keyExtractor={(item) => item.id}
                            searchPlaceholder="Buscar contadores..."
                            onSearch={() => {}}
                        />
                    )}
                </div>
            )}
        </div>
    );
}