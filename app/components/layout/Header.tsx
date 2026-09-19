'use client';

import { useState, useRef, useEffect } from "react";
import { LuBell, LuUser, LuLogOut, LuSettings, LuChevronDown, LuX } from "react-icons/lu";
import { useProfile } from "./ProfileContext";

const rolLabels: Record<string, string> = {
    owner:    "Propietario",
    admin:    "Administrador",
    contador: "Contador",
    cliente:  "Cliente",
};

const rolColors: Record<string, string> = {
    owner:    "bg-navy-800 text-white",
    admin:    "bg-navy-600 text-white",
    contador: "bg-teal-600 text-white",
    cliente:  "bg-slate-600 text-white",
};

// notificaciones estáticas removidas para usar skeleton

export function Header() {
    const { profile, isLoading } = useProfile();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notiOpen,    setNotiOpen]    = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notiRef    = useRef<HTMLDivElement>(null);

    const [isLoadingNotis] = useState(true);
    const noLeidas = 0;

    // cierra el dropdown al click fuera
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
            if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
                setNotiOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <header className="flex justify-end items-center gap-2 bg-white pr-4 rounded-2xl border border-slate-200/80 shadow-sm">

            {/* ── NOTIFICACIONES ─────────────────────────────── */}
            <div ref={notiRef} className="relative">
                <button
                    onClick={() => { setNotiOpen(!notiOpen); setProfileOpen(false); }}
                    className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Notificaciones"
                >
                    <LuBell className="w-[18px] h-[18px]" />
                    {noLeidas > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
                    )}
                </button>

                {notiOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
                            {noLeidas > 0 && (
                                <span className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                                    {noLeidas} nuevas
                                </span>
                            )}
                        </div>
                        <ul className="max-h-72 overflow-y-auto">
                            {isLoadingNotis ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <li key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 animate-pulse">
                                        <span className="mt-1 w-2 h-2 rounded-full shrink-0 bg-slate-200" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                                            <div className="h-2 w-1/3 bg-slate-200 rounded"></div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-6 text-center text-sm text-slate-500">
                                    No tienes notificaciones
                                </li>
                            )}
                        </ul>
                        <div className="px-4 py-2.5 border-t border-slate-100">
                            <button className="text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors cursor-pointer">
                                Marcar todas como leídas
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── PERFIL ─────────────────────────────────────── */}
            <div ref={profileRef} className="relative">
                <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotiOpen(false); }}
                    className="flex items-center gap-3 h-10 pl-2 pr-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                    {isLoading ? (
                        <div className="flex gap-2 items-center animate-pulse">
                            <div className="h-3.5 w-24 bg-slate-200 rounded" />
                            <div className="w-7 h-7 bg-slate-200 rounded-full" />
                        </div>
                    ) : profile ? (
                        <>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-slate-800 leading-none">
                                    {profile.nombre} {profile.apellido_paterno}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                                    {rolLabels[profile.rol] ?? profile.rol}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center text-navy-700">
                                <LuUser className="w-4 h-4" />
                            </div>
                            <LuChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                        </>
                    ) : (
                        <span className="text-sm text-slate-400">Sin sesión</span>
                    )}
                </button>

                {profileOpen && profile && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Cabecera del perfil */}
                        <div className="px-4 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 shrink-0">
                                    <LuUser className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {profile.nombre} {profile.apellido_paterno}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{profile.email}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold capitalize ${rolColors[profile.rol] ?? "bg-slate-100 text-slate-700"}`}>
                                    {rolLabels[profile.rol] ?? profile.rol}
                                </span>
                                {profile.rfc && (
                                    <span className="text-[10px] text-slate-400 font-mono">{profile.rfc}</span>
                                )}
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="py-1">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer">
                                <LuSettings className="w-4 h-4 shrink-0 text-slate-400" />
                                Configuración
                            </button>
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/logout', { method: 'POST' });
                                    window.location.replace('/auth/login');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                            >
                                <LuLogOut className="w-4 h-4 shrink-0" />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
