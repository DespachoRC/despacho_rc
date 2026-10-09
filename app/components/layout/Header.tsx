'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuBell, LuUser, LuLogOut, LuSettings, LuChevronDown, LuX, LuMessageSquare, LuFileText, LuCheck, LuFolder, LuUserCheck } from "react-icons/lu";
import { useProfile } from "./ProfileContext";
import { createClient } from "@/core/db/clients";
import toast from "react-hot-toast";

interface Notificacion {
    id: string;
    usuario_id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    url_destino: string | null;
    leida: boolean;
    created_at: string;
}

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

const tipoIcons = {
    cotizacion: LuFileText,
    mensaje:    LuMessageSquare,
    actividad:  LuCheck,
    archivo:    LuFolder,
    asignacion: LuUserCheck,
};

export function Header() {
    const { profile, isLoading } = useProfile();
    const router = useRouter();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notiOpen,    setNotiOpen]    = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notiRef    = useRef<HTMLDivElement>(null);

    const [notificacionesState, setNotificacionesState] = useState<{
        userId: string;
        items: Notificacion[];
    } | null>(null);
    const [isLoadingNotis, setIsLoadingNotis] = useState(true);
    const [activeToastState, setActiveToastState] = useState<{
        userId: string;
        notification: Notificacion;
    } | null>(null);
    const seenNotificationsRef = useRef<{
        userId: string;
        ids: Set<string>;
        initialized: boolean;
    } | null>(null);
    const notificaciones = notificacionesState && notificacionesState.userId === profile?.id
        ? notificacionesState.items
        : [];
    const activeToast = activeToastState && activeToastState.userId === profile?.id
        ? activeToastState.notification
        : null;

    const mostrarToastNotificacion = useCallback((userId: string, notification: Notificacion) => {
        setActiveToastState({ userId, notification });
        window.setTimeout(() => {
            setActiveToastState((current) =>
                current?.userId === userId && current.notification.id === notification.id
                    ? null
                    : current
            );
        }, 5000);
    }, []);

    const agregarNotificacion = useCallback((
        userId: string,
        notification: Notificacion,
        anunciar: boolean
    ) => {
        let seen = seenNotificationsRef.current;
        if (seen?.userId !== userId) {
            seen = { userId, ids: new Set<string>(), initialized: false };
            seenNotificationsRef.current = seen;
        }

        const isNew = !seen.ids.has(notification.id);
        seen.ids.add(notification.id);
        setNotificacionesState((current) => {
            const prev = current?.userId === userId ? current.items : [];
            return {
                userId,
                items: [notification, ...prev.filter((item) => item.id !== notification.id)]
                    .slice(0, 30),
            };
        });

        if (anunciar && isNew) mostrarToastNotificacion(userId, notification);
    }, [mostrarToastNotificacion]);

    const fetchNotificaciones = useCallback(async (userId: string, anunciarNuevas = false) => {
        try {
            const res = await fetch('/api/notificaciones', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'No se pudieron cargar las notificaciones');
            }

            const notifications = (json.data ?? []) as Notificacion[];
            const seen = seenNotificationsRef.current;
            for (const notification of notifications) {
                agregarNotificacion(userId, notification, anunciarNuevas && Boolean(seen?.initialized));
            }
            setNotificacionesState((current) => {
                const prev = current?.userId === userId ? current.items : [];
                const byId = new Map<string, Notificacion>();
                for (const notificacion of notifications) {
                    byId.set(notificacion.id, notificacion);
                }
                for (const notificacion of prev) {
                    byId.set(notificacion.id, notificacion);
                }
                return {
                    userId,
                    items: [...byId.values()]
                        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
                        .slice(0, 30),
                };
            });
            if (seenNotificationsRef.current?.userId === userId) {
                seenNotificationsRef.current.initialized = true;
            }
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
            if (!anunciarNuevas) toast.error("No se pudieron cargar las notificaciones.");
        } finally {
            setIsLoadingNotis(false);
        }
    }, [agregarNotificacion]);

    // Suscripción Realtime a notificaciones del usuario
    useEffect(() => {
        if (!profile?.id) return;

        const userId = profile.id;
        seenNotificationsRef.current = { userId, ids: new Set<string>(), initialized: false };
        void fetchNotificaciones(userId);

        const supabase = createClient();
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let cancelled = false;

        const subscribeToNotifications = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('No se pudo obtener la sesión para Realtime:', error);
                return;
            }
            if (!session?.access_token) {
                console.error('No hay sesión autenticada disponible para Realtime de notificaciones.');
                return;
            }

            await supabase.realtime.setAuth(session.access_token);
            if (cancelled) return;

            channel = supabase
                .channel(`notificaciones:${userId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notificaciones",
                        filter: `usuario_id=eq.${userId}`,
                    },
                    (payload) => {
                        const nueva = payload.new as Notificacion;
                        if (nueva.usuario_id !== userId) return;
                        agregarNotificacion(userId, nueva, true);
                    }
                )
                .subscribe((status, subscribeError) => {
                    if (status === 'SUBSCRIBED') {
                        if (process.env.NODE_ENV === 'development') {
                            console.info(`Suscripción Realtime activa para notificaciones (${userId}).`);
                        }
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        console.error('Falló la suscripción Realtime de notificaciones:', subscribeError ?? status);
                    }
                });
        };
        void subscribeToNotifications();

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.access_token) {
                void supabase.realtime.setAuth(session.access_token);
            }
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void fetchNotificaciones(userId, true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            cancelled = true;
            authSubscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (channel) void supabase.removeChannel(channel);
        };
    }, [profile?.id, fetchNotificaciones, agregarNotificacion]);

    // Cierra el dropdown al click fuera
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

    const noLeidas = notificaciones.filter((n) => !n.leida).length;

    const handleNotiClick = async (noti: Notificacion) => {
        if (!noti.leida) {
            try {
                const res = await fetch(`/api/notificaciones/${noti.id}/leida`, { method: 'PATCH' });
                const result = await res.json();
                if (!res.ok || !result.success) {
                    throw new Error(result.error || 'No se pudo marcar la notificación como leída');
                }

                setNotificacionesState((current) => {
                    if (!current || current.userId !== profile?.id) return current;
                    return {
                        ...current,
                        items: current.items.map((n) => (n.id === noti.id ? { ...n, leida: true } : n)),
                    };
                });
            } catch (error) {
                console.error("Error marcando notificación como leída:", error);
                toast.error("No se pudo marcar la notificación como leída.");
            }
        }
        setNotiOpen(false);
        if (noti.url_destino) {
            router.push(noti.url_destino);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            const res = await fetch('/api/notificaciones/marcar-todas', { method: 'POST' });
            const result = await res.json();
            if (!res.ok || !result.success) {
                throw new Error(result.error || 'No se pudieron marcar todas como leídas');
            }

            setNotificacionesState((current) => {
                if (!current || current.userId !== profile?.id) return current;
                return { ...current, items: current.items.map((n) => ({ ...n, leida: true })) };
            });
        } catch (error) {
            console.error("Error marcando notificaciones como leídas:", error);
            toast.error("No se pudieron marcar todas como leídas.");
        }
    };

    return (
        <>
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
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                        )}
                    </button>

                    {notiOpen && (
                        <div className="absolute top-[calc(100%+8px)] right-0 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
                                {noLeidas > 0 && (
                                    <span className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold">
                                        {noLeidas} nuevas
                                    </span>
                                )}
                            </div>

                            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                {isLoadingNotis ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <li key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                                            <span className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <div className="h-3 w-3/4 bg-slate-200 rounded" />
                                                <div className="h-2 w-1/2 bg-slate-100 rounded" />
                                            </div>
                                        </li>
                                    ))
                                ) : notificaciones.length === 0 ? (
                                    <li className="px-4 py-8 text-center text-xs text-slate-400 italic">
                                        No tienes notificaciones
                                    </li>
                                ) : (
                                    notificaciones.map((noti) => {
                                        const IconComponent = tipoIcons[noti.tipo as keyof typeof tipoIcons] || LuBell;
                                        const fecha = new Date(noti.created_at).toLocaleTimeString("es-MX", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        });

                                        return (
                                            <li key={noti.id}>
                                                <button
                                                    onClick={() => handleNotiClick(noti)}
                                                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                                        !noti.leida ? "bg-navy-50/40" : ""
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                                        !noti.leida ? "bg-navy-600 text-white" : "bg-slate-100 text-slate-500"
                                                    }`}>
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <p className={`text-xs truncate ${!noti.leida ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                                                                {noti.titulo}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 shrink-0">{fecha}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                                            {noti.mensaje}
                                                        </p>
                                                    </div>
                                                    {!noti.leida && (
                                                        <span className="w-2 h-2 rounded-full bg-navy-600 shrink-0 mt-2" />
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>

                            {notificaciones.length > 0 && (
                                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                    <button
                                        onClick={handleMarcarTodasLeidas}
                                        className="text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors cursor-pointer"
                                    >
                                        Marcar todas como leídas
                                    </button>
                                </div>
                            )}
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
                                <button 
                                    onClick={() => {
                                        setProfileOpen(false);
                                        let basePath: string;
                                        if (profile.rol === 'owner') {
                                            basePath = '/superadmin/dashboard';
                                        } else if (profile.rol === 'admin') {
                                            basePath = '/dashboard';
                                        } else {
                                            basePath = `/${profile.rol}/dashboard`;
                                        }
                                        router.push(`${basePath}/settings`);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                                >
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

            {/* ── TOAST FLOTANTE DE NOTIFICACIÓN EN TIEMPO REAL ───────────── */}
            {activeToast && (
                <div
                    onClick={() => handleNotiClick(activeToast)}
                    className="fixed bottom-6 right-6 z-[100] max-w-sm bg-white text-navy-950 p-4 rounded-2xl shadow-xl border border-slate-200 flex items-start gap-3.5 cursor-pointer animate-in fade-in slide-in-from-bottom-5 duration-300 hover:border-navy-200 hover:shadow-2xl transition-all"
                >
                    <div className="p-2 bg-navy-50 rounded-xl text-navy-700 mt-0.5 shrink-0">
                        <LuBell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-950">{activeToast.titulo}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2">{activeToast.mensaje}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveToastState(null);
                        }}
                        aria-label="Cerrar notificación"
                        className="text-slate-400 hover:text-navy-800 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <LuX className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );
}
