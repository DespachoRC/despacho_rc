"use client";

import Link from "next/link";
import {
    LuShieldCheck,
    LuUser,
    LuCalculator,
    LuCrown,
} from "react-icons/lu";

// portal temporal de desarrollo: permite acceder a cada vista de rol sin autenticacion
// este archivo debe ser revertido antes de pasar a produccion
const roles = [
    {
        label: "Administrador",
        href: "/dashboard/metrics",
        icon: LuShieldCheck,
        color: "bg-blue-600 hover:bg-blue-700",
        descripcion: "Panel de control, usuarios, catálogos, tareas y carpetas",
    },
    {
        label: "Cliente",
        href: "/cliente/dashboard",
        icon: LuUser,
        color: "bg-emerald-600 hover:bg-emerald-700",
        descripcion: "Cotizaciones, tareas en progreso y carpeta de archivos",
    },
    {
        label: "Contador",
        href: "/contador/dashboard",
        icon: LuCalculator,
        color: "bg-orange-600 hover:bg-orange-700",
        descripcion: "Actividades asignadas, entregables y cartera de clientes",
    },
    {
        label: "Superadmin",
        href: "/superadmin/dashboard",
        icon: LuCrown,
        color: "bg-purple-600 hover:bg-purple-700",
        descripcion: "Configuración global del sistema y gestión de cuentas",
    },
];

export default function DevPortal() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-10 p-8">

            {/* encabezado del portal de desarrollo */}
            <div className="flex flex-col items-center gap-2 text-center">
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Modo Desarrollo
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">
                    Portal de Desarrollo
                </h1>
                <p className="text-gray-500 text-sm max-w-md">
                    Selecciona el rol que quieres previsualizar. Este portal no existe en producción.
                </p>
            </div>

            {/* grid de tarjetas de rol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
                {roles.map((rol) => {
                    const Icon = rol.icon;
                    return (
                        <Link
                            key={rol.href}
                            href={rol.href}
                            className={`flex items-start gap-4 ${rol.color} text-white rounded-2xl p-6 shadow-md transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5`}
                        >
                            <div className="bg-white/20 p-3 rounded-xl shrink-0">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-base">
                                    {rol.label}
                                </span>
                                <span className="text-white/80 text-xs leading-relaxed">
                                    {rol.descripcion}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <p className="text-xs text-gray-400 italic">
                Recuerda restaurar este archivo antes del merge a producción.
            </p>
        </div>
    );
}
