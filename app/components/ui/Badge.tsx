interface BadgeProps {
    text: string;
    variant: "success" | "danger" | "blue" | "purple" | "teal" | "orange";
}

// mapa de estilos por variante: fondo tenue + texto fuerte + borde del mismo tono
const variantMap: Record<BadgeProps["variant"], string> = {
    success: "bg-green-50  text-green-600  border border-green-200",
    danger:  "bg-red-50    text-red-500    border border-red-200",
    blue:    "bg-blue-50   text-blue-600   border border-blue-200",
    purple:  "bg-purple-50 text-purple-600 border border-purple-200",
    teal:    "bg-teal-50   text-teal-600   border border-teal-200",
    orange:  "bg-orange-50 text-orange-500 border border-orange-200",
};

export function Badge({ text, variant }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${variantMap[variant]}`}
        >
            {text}
        </span>
    );
}
