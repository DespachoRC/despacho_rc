interface BadgeProps {
    text: string;
    variant?: "success" | "danger" | "navy" | "teal" | "amber" | "ghost" | "pending";
}

const variantMap: Record<NonNullable<BadgeProps["variant"]>, string> = {
    // fondo muy sutil, texto oscuro del mismo tono — sin bordes neón
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger:  "bg-rose-50   text-rose-700   border border-rose-200",
    navy:    "bg-navy-50   text-navy-700   border border-navy-200",
    teal:    "bg-teal-50   text-teal-700   border border-teal-200",
    amber:   "bg-amber-50  text-amber-700  border border-amber-200",
    pending: "bg-amber-50  text-amber-700  border border-amber-200",
    ghost:   "bg-slate-100 text-slate-700  border border-slate-200",
};

export function Badge({ text, variant = "navy" }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap ${variantMap[variant]}`}
        >
            {text}
        </span>
    );
}
