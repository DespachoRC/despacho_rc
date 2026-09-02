"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LuLayoutPanelLeft, 
    LuUsers, 
    LuBookOpen, 
    LuClipboardList, 
    LuFolderOpen,
    LuArrowLeftFromLine
} from "react-icons/lu";
import Image from "next/image";

interface SidebarProps {
    // prop de rol para filtrado futuro segun el tipo de usuario autenticado
    rol?: string;
}

export function Sidebar({ rol }: SidebarProps) {
    const pathname = usePathname();

    // lista completa de rutas del sistema; filtrar por rol en la fase de autenticacion real
    const navItems = [
        { name: "Métricas", href: "/dashboard/metrics", icon: LuLayoutPanelLeft },
        { name: "Gestión de usuarios", href: "/dashboard/users-management", icon: LuUsers },
        { name: "Catálogos", href: "/dashboard/catalogs", icon: LuBookOpen },
        { name: "Tareas y cotizaciones", href: "/dashboard/tasks", icon: LuClipboardList },
        { name: "Carpetas generales", href: "/dashboard/folders", icon: LuFolderOpen },
    ];

    return (
        <aside className="row-span-2 flex flex-col justify-evenly items-center bg-primary rounded-2xl">
            <div className="w-full flex justify-center">
                <Image
                    src="/logo.png"
                    alt="logo_rc"
                    width={100}
                    height={100}
                />
            </div>
            <nav className="w-full h-5/8">
                <ul className="w-full flex flex-col items-center gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href} className="w-9/10">
                                <Link
                                    href={item.href}
                                    className={`w-full flex items-center gap-4 py-4 pl-4 rounded-xl cursor-pointer transition-colors ${
                                        isActive
                                            ?  "font-semibold text-white"
                                            :  "hover:bg-gray text-gray hover:text-black"
                                    }`}
                                >
                                    <Icon className={`w-6 h-6 shrink-0 ${isActive ? "text-white" : ""}`} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="w-9/10 flex items-center gap-4 text-white py-4 pl-4 rounded-xl cursor-pointer hover:bg-primary-900 transition-colors">
                <LuArrowLeftFromLine />
                <span>Cerrar sesión</span>
            </div>
        </aside>
    );
}