import { ReactNode } from "react";

interface KpiCardProps {
    icon: ReactNode;
    value: number | string;
    label: string;
    color?: "blue" | "orange" | "green" | "purple";
}

// mapa de colores para icono y label segun la variante recibida
const colorMap: Record<NonNullable<KpiCardProps["color"]>, string> = {
    blue:   "text-blue-500",
    orange: "text-orange-400",
    green:  "text-emerald-500",
    purple: "text-purple-500",
};

export function KpiCard({ icon, value, label, color = "blue" }: KpiCardProps) {
    const colorClass = colorMap[color];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col gap-3">
            {/* icono coloreado segun la variante */}
            <span className={`text-2xl ${colorClass}`}>{icon}</span>

            {/* valor numerico principal */}
            <span className="text-5xl font-bold text-gray-900 leading-none">{value}</span>

            {/* etiqueta descriptiva, mismo color que el icono */}
            <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        </div>
    );
}
