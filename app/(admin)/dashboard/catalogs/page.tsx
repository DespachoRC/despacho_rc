"use client";

import { useState, useEffect } from "react";
import { LuPlus, LuFileText, LuBriefcase, LuFolderOpen, LuLoader, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Switch } from "@/components/ui/switch";

type CatalogoItem = { id: string; nombre: string; activo: boolean };

type CatalogoSection = {
    titulo: string;
    tabla: string;
    icon: React.ReactNode;
};

const SECCIONES: CatalogoSection[] = [
    { titulo: "Regímenes Fiscales",            tabla: "regimenes_fiscales",   icon: <LuFileText /> },
    { titulo: "Tipos de Documento / Tarea",    tabla: "catalogo_actividades", icon: <LuBriefcase /> },
    { titulo: "Especialidades de Contadores",  tabla: "especialidad_contador", icon: <LuBriefcase /> },
    { titulo: "Categorías de Documentos",      tabla: "categoria_documentos", icon: <LuFolderOpen /> },
];

function CatalogoCard({ seccion }: { seccion: CatalogoSection }) {
    const [items, setItems]       = useState<CatalogoItem[]>([]);
    const [loading, setLoading]   = useState(true);
    const [nuevoNombre, setNuevo] = useState("");
    const [adding, setAdding]     = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/catalogos/${seccion.tabla}`);
            const json = await res.json();
            if (json.success) setItems(json.data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleToggle = async (item: CatalogoItem, checked: boolean) => {
        // optimistic update
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, activo: checked } : i));
        await fetch(`/api/catalogos/${seccion.tabla}/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: checked }),
        });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const nombre = nuevoNombre.trim();
        if (!nombre) return;
        setAdding(true);
        try {
            const res = await fetch(`/api/catalogos/${seccion.tabla}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre }),
            });
            const json = await res.json();
            if (json.success) {
                setItems((prev) => [...prev, json.data]);
                setNuevo("");
                toast.success("Añadido correctamente");
            } else {
                toast.error(json.error || "Error al añadir");
            }
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirmId !== id) {
            setConfirmId(id);
            setTimeout(() => setConfirmId(null), 3000);
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/catalogos/${seccion.tabla}/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                setItems((prev) => prev.filter((i) => i.id !== id));
                toast.success("Eliminado correctamente");
            } else {
                toast.error(json.error || "No se pudo eliminar");
            }
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    return (
        <div className="flex flex-col gap-5 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            {/* Cabecera */}
            <div className="flex items-center gap-3">
                <span className="text-lg text-navy-600">{seccion.icon}</span>
                <h2 className="font-semibold text-slate-900 text-base">{seccion.titulo}</h2>
            </div>

            {/* Form para añadir */}
            <form onSubmit={handleAdd} className="flex gap-2">
                <div className="flex-1">
                    <Input
                        isLabelNeed={false}
                        type="text"
                        name="nuevo"
                        placeholder="Añadir nuevo..."
                        value={nuevoNombre}
                        onChange={(e) => setNuevo(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    icon={<LuPlus className="w-4 h-4" />}
                    className="px-3 py-2.5 shrink-0"
                    isLoading={adding}
                />
            </form>

            {/* Lista */}
            {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                    <LuLoader className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Cargando...</span>
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">
                    Sin registros aún. Añade el primero.
                </p>
            ) : (
                <ul className="flex flex-col gap-0">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 gap-3"
                        >
                            <span className={`text-sm flex-1 ${item.activo ? "text-slate-800" : "text-slate-400 line-through"}`}>
                                {item.nombre}
                            </span>
                            <Switch
                                defaultChecked={item.activo}
                                onCheckedChange={(checked) => handleToggle(item, checked)}
                                aria-label={`Activar o desactivar ${item.nombre}`}
                            />
                            <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                                    confirmId === item.id 
                                        ? "bg-red-100 text-red-600 hover:bg-red-200" 
                                        : "text-slate-400 hover:text-red-500 hover:bg-slate-100"
                                }`}
                            >
                                {deletingId === item.id ? (
                                    <LuLoader className="w-4 h-4 animate-spin" />
                                ) : confirmId === item.id ? (
                                    "¿Confirmar?"
                                ) : (
                                    <LuTrash2 className="w-4 h-4" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Catalogs() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader
                title="Catálogos del Sistema"
                subtitle="Administra los valores de referencia utilizados en toda la plataforma"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {SECCIONES.map((seccion) => (
                    <CatalogoCard key={seccion.tabla} seccion={seccion} />
                ))}
            </div>
        </div>
    );
}
