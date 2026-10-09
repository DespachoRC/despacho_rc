"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LuBuilding2,
    LuLogOut,
    LuShieldCheck,
} from "react-icons/lu";
import Image from "next/image";
import { useProfile } from "../layout/ProfileContext";

export function SuperadminSidebar() {
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

    const navItems = [
        { name: "Organizaciones", href: "/superadmin/dashboard", icon: LuBuilding2 },
    ];

    return (
        <aside
            className="group/sidebar row-span-2 flex flex-col justify-between items-center bg-navy-950 rounded-2xl py-6 shadow-lg
                       w-[68px] hover:w-[260px] transition-[width] duration-300 ease-in-out overflow-hidden border border-navy-800/50"
        >
            <div className="w-full flex justify-center px-3 mb-2">
                <Image
                    src="/logo.png"
                    alt="logo_rc"
                    width={48}
                    height={48}
                    className="opacity-90 shrink-0 drop-shadow-md"
                />
            </div>

            <div className="w-8 group-hover/sidebar:w-[220px] h-px bg-white/15 mb-4 transition-[width] duration-300" />

            <nav className="flex-1 w-full flex flex-col items-center gap-1 px-2 overflow-hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.name}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 min-w-0
                                ${isActive
                                    ? "bg-navy-700/80 text-white shadow-sm font-semibold"
                                    : "text-slate-300 hover:bg-navy-800/60 hover:text-white"
                                }`}
                        >
                            <Icon className={`w-6 h-6 shrink-0 ${isActive ? "text-amber-400" : ""}`} />
                            <span className="text-base font-medium whitespace-normal leading-tight opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-100 overflow-hidden flex-1 text-left">
                                {item.name}
                            </span>
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="w-8 group-hover/sidebar:w-[220px] h-px bg-white/15 mb-4 transition-[width] duration-300" />

            <div className="w-full flex flex-col gap-2 px-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200">
                    <div className="w-7 h-7 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center shrink-0">
                        <LuShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-col min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-100 hidden sm:flex">
                        {isLoading ? (
                            <>
                                <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
                                <div className="h-2 w-12 bg-slate-800 rounded mt-1 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-semibold text-slate-100 truncate leading-none">
                                    {profile?.nombre} {profile?.apellido_paterno}
                                </p>
                                <p className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-wider truncate">
                                    Superadmin (Owner)
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
                               text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-all duration-200 bg-transparent border-none"
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
