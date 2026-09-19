'use client';

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { Tabs } from "@/app/components/ui/Tabs";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/app/components/ui/DataTable";
import { LuPlus, LuCheck } from "react-icons/lu";
import toast from "react-hot-toast";

export default function UsersManagement() {
    const [activeTab, setActiveTab] = useState<string>("clientes");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [clientes, setClientes] = useState<any[]>([]);
    const [contadores, setContadores] = useState<any[]>([]);
    const [roles, setRoles] = useState<{id: string, nombre: string}[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        nombre: "",
        apellido_paterno: "",
        email: "",
        password: "",
        rfc: "",
        regimen_fiscal_id: "",
    });

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
            toast.error("Error al cargar la lista de usuarios");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/users/roles");
            if (res.ok) {
                const json = await res.json();
                setRoles(json.data || []);
            }
        } catch (error) {
            console.error("Error fetching roles", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const roleObj = roles.find(r => r.nombre === (activeTab === "clientes" ? "cliente" : "contador"));
        
        if (!roleObj) {
            toast.error("No se pudo determinar el rol para este usuario");
            return;
        }

        setIsSubmitting(true);
        
        const payload = {
            ...formData,
            rol_id: roleObj.id,
        };

        // Si es contador, quitamos el regimen si no aplica o lo mandamos
        if (activeTab === "contadores" || !payload.regimen_fiscal_id || payload.regimen_fiscal_id.startsWith('fake')) {
            delete (payload as any).regimen_fiscal_id;
        }

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (res.ok && json.success) {
                toast.success(`${activeTab === "clientes" ? "Cliente" : "Contador"} creado exitosamente`);
                setIsCreating(false);
                setFormData({
                    nombre: "",
                    apellido_paterno: "",
                    email: "",
                    password: "",
                    rfc: "",
                    regimen_fiscal_id: "",
                });
                fetchUsers(); // recargar
            } else {
                if (json.errors) {
                    // Mostrar error de validación (el primer campo que falle)
                    const firstError = Object.values(json.errors)[0] as string[];
                    toast.error(firstError[0] || "Error de validación");
                } else {
                    toast.error(json.error || "Ocurrió un error al crear el usuario");
                }
            }
        } catch (error) {
            toast.error("Error de red al intentar crear el usuario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatusId: number) => {
        try {
            const isActivo = currentStatusId === 1;
            const url = isActivo ? `/api/users/${id}` : `/api/users/${id}/reactivar`;
            const method = isActivo ? 'DELETE' : 'PUT';

            const res = await fetch(url, { method });
            const json = await res.json();
            
            if (res.ok && json.success) {
                toast.success(isActivo ? 'Usuario inactivado' : 'Usuario activado exitosamente');
                fetchUsers();
            } else {
                toast.error(json.error || 'Error al actualizar el estatus');
            }
        } catch (error) {
            toast.error('Error de red al intentar actualizar el estatus');
        }
    };

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
            header: "RFC",
            cell: (item) => <span className="text-slate-600 text-sm">{item.rfc}</span>
        },
        {
            header: "Estatus",
            cell: (item) => <Badge text={item.estatus_usuarios?.nombre === "activo" ? "Activo" : "Inactivo"} variant={item.estatus_usuarios?.nombre === "activo" ? "success" : "ghost"} />
        },
        {
            header: "Acción",
            cell: (item) => {
                const isActivo = item.estatus_id === 1;
                return (
                    <Button 
                        text={isActivo ? "Inactivar" : "Activar"} 
                        variant={isActivo ? "destructive" : "outline"} 
                        className="px-3 py-1.5 text-xs"
                        onClick={() => handleToggleStatus(item.id, item.estatus_id)}
                    />
                );
            }
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
            header: "RFC",
            cell: (item) => <span className="text-slate-600 text-sm">{item.rfc}</span>
        },
        {
            header: "Estatus",
            cell: (item) => <Badge text={item.estatus_usuarios?.nombre === "activo" ? "Activo" : "Inactivo"} variant={item.estatus_usuarios?.nombre === "activo" ? "success" : "ghost"} />
        },
        {
            header: "Acción",
            cell: (item) => {
                const isActivo = item.estatus_id === 1;
                return (
                    <Button 
                        text={isActivo ? "Inactivar" : "Activar"} 
                        variant={isActivo ? "destructive" : "outline"} 
                        className="px-3 py-1.5 text-xs"
                        onClick={() => handleToggleStatus(item.id, item.estatus_id)}
                    />
                );
            }
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

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nombre / Razón Social"
                                type="text"
                                htmlFor="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej. Grupo Monterrey"
                                required
                            />
                            <Input
                                label="Apellidos / Tipo de Sociedad"
                                type="text"
                                htmlFor="apellido_paterno"
                                name="apellido_paterno"
                                value={formData.apellido_paterno}
                                onChange={handleChange}
                                placeholder="Ej. SA de CV"
                                required
                            />
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                htmlFor="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="correo@empresa.mx"
                                required
                            />
                            <Input
                                label="Contraseña Temporal"
                                type="password"
                                htmlFor="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            <Input
                                label="RFC"
                                type="text"
                                htmlFor="rfc"
                                name="rfc"
                                value={formData.rfc}
                                onChange={handleChange}
                                placeholder="Ej. ABC123456T1"
                                required
                            />

                            {activeTab === "clientes" && (
                                <div className="flex flex-col gap-2 w-full">
                                    <label htmlFor="regimen_fiscal_id" className="text-base font-medium text-slate-700">
                                        Régimen Fiscal (Opcional por ahora)
                                    </label>
                                    <select
                                        id="regimen_fiscal_id"
                                        name="regimen_fiscal_id"
                                        value={formData.regimen_fiscal_id}
                                        onChange={handleChange}
                                        className="w-full bg-navy-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-navy-700 transition-all text-base cursor-pointer"
                                    >
                                        <option value="">Selecciona un régimen...</option>
                                        {/* TODO: Aquí idealmente se debería hacer fetch a los regimenes desde api/catalogos */}
                                        <option value="fake-uuid-1">RESICO - Personas Físicas</option>
                                        <option value="fake-uuid-2">Régimen General de Ley</option>
                                        <option value="fake-uuid-3">Persona Moral</option>
                                        <option value="fake-uuid-4">Régimen de Arrendamiento</option>
                                        <option value="fake-uuid-5">Actividades Empresariales</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                text={isSubmitting ? "Guardando..." : "Guardar Registro"}
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 text-base"
                                icon={<LuCheck className="w-5 h-5" />}
                            />
                            <Button
                                text="Cancelar"
                                variant="ghost"
                                type="button"
                                disabled={isSubmitting}
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