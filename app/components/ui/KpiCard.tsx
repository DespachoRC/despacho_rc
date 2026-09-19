import { ReactNode } from "react";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";

interface KpiCardProps {
    icon: ReactNode;
    value: number | string;
    label: string;
    subtitle?: string;
    delta?: number;
    color?: "navy" | "teal" | "amber" | "rose" | "emerald"; // kept for API compat, no longer affects color
}

export function KpiCard({ icon, value, label, subtitle, delta }: KpiCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-3 transition-all hover:shadow-md hover:border-slate-300">
            <div className="flex justify-between items-start">
                {/* icon — siempre en slate-800 */}
                <span className="text-2xl text-slate-800">{icon}</span>
                {delta !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        delta >= 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                    }`}>
                        {delta >= 0 ? <LuTrendingUp className="w-3 h-3" /> : <LuTrendingDown className="w-3 h-3" />}
                        {Math.abs(delta)}%
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-0.5 mt-1">
                {/* value — bold y negro */}
                <span className="text-3xl font-bold text-slate-900 leading-none tracking-tight">{value}</span>
                {/* label — slate medio, no neón */}
                <span className="text-sm font-medium text-slate-600 mt-1">{label}</span>
                {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
            </div>
        </div>
    );
}

export function KpiCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 animate-pulse">
            <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
            <div className="flex flex-col gap-2 mt-1">
                <div className="h-9 w-14 bg-slate-200 rounded-lg"></div>
                <div className="h-3.5 w-20 bg-slate-200 rounded"></div>
            </div>
        </div>
    );
}

