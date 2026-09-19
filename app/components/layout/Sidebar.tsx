"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LuLayoutPanelLeft,
    LuUsers,
    LuBookOpen,
    LuClipboardList,
    LuFolderOpen,
    LuLogOut,
    LuUpload,
    LuReceiptText,
    LuChartBar,
    LuBriefcase,
} from "react-icons/lu";
import Image from "next/image";
import { useProfile } from "./ProfileContext";

export function Sidebar() {
    const pathname = usePathname();
    const { profile, isLoading } = useProfile();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            window.location.replace('/auth/login');
        }
    };

    const adminNavItems = [
        { name: "Métricas", href: "/dashboard/metrics", icon: LuLayoutPanelLeft },
        { name: "Gestión de usuarios", href: "/dashboard/users-management", icon: LuUsers },
        { name: "Catálogos", href: "/dashboard/catalogs", icon: LuBookOpen },
        { name: "Cotizaciones", href: "/dashboard/tasks", icon: LuClipboardList },
        { name: "Carpetas generales", href: "/dashboard/folders", icon: LuFolderOpen },
    ];

    const clienteNavItems = [
        { name: "Cargar documentación", href: "/cliente/dashboard/upload", icon: LuUpload },
        { name: "Mis presupuestos", href: "/cliente/dashboard/budgets", icon: LuReceiptText },
        { name: "Mis resultados", href: "/cliente/dashboard/results", icon: LuChartBar },
    ];

    const contadorNavItems = [
        { name: "Mis clientes", href: "/contador/dashboard/clients", icon: LuBriefcase },
    ];

    const navItems =
        isLoading ? [] :
            profile?.rol === "cliente" ? clienteNavItems :
                profile?.rol === "contador" ? contadorNavItems :
                    adminNavItems;

    return (
        <aside
            className="group/sidebar row-span-2 flex flex-col justify-between items-center bg-navy-900 rounded-2xl py-6 shadow-lg
                       w-[68px] hover:w-[260px] transition-[width] duration-300 ease-in-out overflow-hidden"
        >
            <div className="w-full flex justify-center px-3 mb-2">
                <Image
                    src="/logo.png"
                    alt="logo_rc"
                    width={48}
                    height={48}
                    className="opacity-90 shrink-0"
                />
            </div>

            <div className="w-8 group-hover/sidebar:w-[220px] h-px bg-white/20 mb-4 transition-[width] duration-300" />

            <nav className="flex-1 w-full flex flex-col items-center gap-1 px-2 overflow-hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.name}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 min-w-0
                                ${isActive
                                    ? "bg-navy-600/60 text-white"
                                    : "text-slate-300 hover:bg-navy-700/60 hover:text-white"
                                }`}
                        >
                            <Icon className={`w-6 h-6 shrink-0 ${isActive ? "text-white" : ""}`} />
                            <span className="text-base font-medium whitespace-normal leading-tight opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-100 overflow-hidden flex-1 text-left">
                                {item.name}
                            </span>
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-navy-400 shrink-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="w-8 group-hover/sidebar:w-[220px] h-px bg-white/20 mb-4 transition-[width] duration-300" />

            <div className="w-full flex flex-col gap-2 px-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200">
                    <div className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 shrink-0">
                        {isLoading ? (
                            <div className="w-4 h-4 rounded-full bg-slate-300 animate-pulse" />
                        ) : (
                            <span className="text-xs font-bold">{profile?.nombre?.charAt(0) || "U"}</span>
                        )}
                    </div>
                    <div className="flex-col min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-100 hidden sm:flex">
                        {isLoading ? (
                            <>
                                <div className="h-3 w-20 bg-slate-400 rounded animate-pulse" />
                                <div className="h-2 w-12 bg-slate-500 rounded mt-1 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-semibold text-slate-200 truncate leading-none">
                                    {profile?.nombre} {profile?.apellido_paterno}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 capitalize truncate">
                                    {profile?.rol}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                               text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-all duration-200 bg-transparent border-none"
                >
                    <LuLogOut className="w-6 h-6 shrink-0" />
                    <span className="text-base font-medium whitespace-normal leading-tight opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-100 flex-1 text-left">
                        Cerrar sesión
                    </span>
                </button>
            </div>
        </aside>
    );
}
