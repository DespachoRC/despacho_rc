'use client';

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { Tabs } from "@/app/components/ui/Tabs";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/app/components/ui/DataTable";
import { LuPlus, LuCheck } from "react-icons/lu";

export default function UsersManagement() {
    const [activeTab, setActiveTab] = useState<string>("clientes");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [clientes, setClientes] = useState<any[]>([]);
    const [contadores, setContadores] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const resClientes = await fetch("/api/users");
                const resContadores = await fetch("/api/users/contadores");
                
                if (resClientes.ok) {
                    const json = await resClientes.json();
                    setClientes(json.data || []);
                }
                if (resContadores.ok) {
                    const json = await resContadores.json();
                    setContadores(json.data || []);
                }
            } catch (error) {
                console.error("Error fetching users", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const tabsData = [
        { label: "Clientes", count: clientes.length, value: "clientes" },
        { label: "Contadores", count: contadores.length, value: "contadores" },
    ];

    const clienteColumns: ColumnDef<any>[] = [
        {
            header: "Cliente",
            cell: (item) => (
                <div>
                    <p className="font-semibold text-navy-950">{item.nombre} {item.apellido_paterno}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                </div>
            )
        },
        {
            header: "Régimen",
            cell: (item) => <Badge text={item.regimen || "No asignado"} variant="navy" />
        },
        {
            header: "Estatus",
            cell: (item) => <Badge text={item.estatus_id === 1 ? "Activo" : "Inactivo"} variant={item.estatus_id === 1 ? "success" : "ghost"} />
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

    const contadorColumns: ColumnDef<any>[] = [
        {
            header: "Contador",
            cell: (item) => (
                <div>
                    <p className="font-semibold text-navy-950">{item.nombre} {item.apellido_paterno}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                </div>
            )
        },
        {
            header: "Especialidades",
            cell: (item) => (
                <div className="flex flex-wrap gap-1.5">
                    {/* Para el mockup, si no tiene especialidades array usamos badges vacios o uno genérico */}
                    <Badge text={"General"} variant="amber" />
                </div>
            )
        },
        {
            header: "Estatus",
            cell: (item) => <Badge text={item.estatus_id === 1 ? "Activo" : "Inactivo"} variant={item.estatus_id === 1 ? "success" : "ghost"} />
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
                            data={clientes}
                            isLoading={isLoading}
                            columns={clienteColumns}
                            keyExtractor={(item) => item.id}
                            searchPlaceholder="Buscar clientes..."
                        />
                    ) : (
                        <DataTable 
                            data={contadores}
                            isLoading={isLoading}
                            columns={contadorColumns}
                            keyExtractor={(item) => item.id}
                            searchPlaceholder="Buscar contadores..."
                        />
                    )}
                </div>
            )}
        </div>
    );
}