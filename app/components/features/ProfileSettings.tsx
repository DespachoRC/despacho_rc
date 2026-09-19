'use client';

import { useState, useEffect } from "react";
import { useProfile } from "../layout/ProfileContext";
import { PageHeader } from "../ui/PageHeader";
import { LuUser, LuLock, LuShieldCheck, LuLoader, LuEye, LuEyeOff } from "react-icons/lu";
import toast from "react-hot-toast";

export function ProfileSettings() {
    const { profile, isLoading } = useProfile();

    const [nombre, setNombre] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");
    const [isSavingBasic, setIsSavingBasic] = useState(false);

    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    // Precargar datos
    useEffect(() => {
        if (profile) {
            setNombre(profile.nombre || "");
            setApellidoPaterno(profile.apellido_paterno || "");
            setApellidoMaterno(profile.apellido_materno || "");
        }
    }, [profile]);

    const handleSaveBasic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !apellidoPaterno.trim()) {
            toast.error("El nombre y apellido paterno son obligatorios");
            return;
        }

        setIsSavingBasic(true);
        try {
            const res = await fetch('/api/users/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    apellido_paterno: apellidoPaterno.trim(),
                    apellido_materno: apellidoMaterno.trim() || null,
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Perfil actualizado correctamente");
                // Idealmente deberíamos actualizar el contexto de perfil aquí, 
                // pero un reload de la página puede bastar si no hay forma fácil de refrescarlo.
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(data.error || "Error al actualizar perfil");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setIsSavingBasic(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordActual) return toast.error("Ingresa tu contraseña actual");
        if (passwordNueva.length < 8) return toast.error("La nueva contraseña debe tener al menos 8 caracteres");
        if (passwordNueva !== passwordConfirm) return toast.error("Las contraseñas no coinciden");
        if (passwordActual === passwordNueva) return toast.error("La nueva contraseña no puede ser igual a la actual");

        setIsSavingPassword(true);
        try {
            const res = await fetch('/api/auth/cambiar-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password_actual: passwordActual,
                    password_nueva: passwordNueva
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Contraseña actualizada correctamente");
                setPasswordActual("");
                setPasswordNueva("");
                setPasswordConfirm("");
            } else {
                toast.error(data.error || "La contraseña actual es incorrecta");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col gap-6 pr-1 animate-pulse">
                <div className="h-12 w-64 bg-slate-200 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96 bg-slate-200 rounded-3xl"></div>
                    <div className="h-96 bg-slate-200 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
            <PageHeader
                title="Configuración de perfil"
                subtitle="Personaliza tu información y administra tu seguridad"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* DATOS BÁSICOS */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
                            <LuUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Datos personales</h2>
                            <p className="text-sm text-slate-500">Actualiza tu información básica.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveBasic} className="flex flex-col gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Nombre(s) *</label>
                            <input
                                type="text"
                                required
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all"
                                placeholder="Ej. Juan"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Apellido paterno *</label>
                                <input
                                    type="text"
                                    required
                                    value={apellidoPaterno}
                                    onChange={e => setApellidoPaterno(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Apellido materno</label>
                                <input
                                    type="text"
                                    value={apellidoMaterno}
                                    onChange={e => setApellidoMaterno(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Campos No Editables para Contexto */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo electrónico</span>
                                <span className="text-sm text-slate-700 font-medium">{profile?.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol de sistema</span>
                                <span className="text-sm text-slate-700 font-medium capitalize">{profile?.rol}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingBasic}
                                className="px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-navy-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSavingBasic && <LuLoader className="w-4 h-4 animate-spin" />}
                                {isSavingBasic ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* SEGURIDAD */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <LuShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Seguridad</h2>
                            <p className="text-sm text-slate-500">Actualiza tu contraseña de acceso.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSavePassword} className="flex flex-col gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Contraseña actual *</label>
                            <div className="relative flex items-center">
                                <LuLock className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    required
                                    value={passwordActual}
                                    onChange={e => setPasswordActual(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-100">
                            <label className="text-sm font-semibold text-slate-700">Nueva contraseña *</label>
                            <div className="relative flex items-center">
                                <LuLock className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={passwordNueva}
                                    onChange={e => setPasswordNueva(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all"
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Confirmar nueva contraseña *</label>
                            <div className="relative flex items-center">
                                <LuLock className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={passwordConfirm}
                                    onChange={e => setPasswordConfirm(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all"
                                    placeholder="Repite la nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingPassword}
                                className="px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-xl font-semibold transition-all shadow-sm shadow-navy-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSavingPassword && <LuLoader className="w-4 h-4 animate-spin" />}
                                {isSavingPassword ? "Actualizando..." : "Cambiar contraseña"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
