"use client";

import { useState, ReactNode } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

interface ExpandableCardProps {
    cliente: string;
    estatusText: string;
    estatusVariant: "success" | "danger" | "blue" | "purple" | "teal" | "orange";
    subtitulo: string;
    precio?: string;
    children: ReactNode;
}

export function ExpandableCard({
    cliente,
    estatusText,
    estatusVariant,
    subtitulo,
    precio,
    children,
}: ExpandableCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // renderizado de badge localmente para evitar problemas de dependencias circulares si hay
    const variantStyles = {
        success: "bg-green-50  text-green-600  border border-green-200",
        danger:  "bg-red-50    text-red-500    border border-red-200",
        blue:    "bg-blue-50   text-blue-600   border border-blue-200",
        purple:  "bg-purple-50 text-purple-600 border border-purple-200",
        teal:    "bg-teal-50   text-teal-600   border border-teal-200",
        orange:  "bg-orange-50 text-orange-500 border border-orange-200",
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* encabezado de la tarjeta clickeable */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
            >
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-base">{cliente}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${variantStyles[estatusVariant]}`}>
                            {estatusText}
                        </span>
                    </div>
                    <span className="text-xs text-dark-gray">{subtitulo}</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* precio si esta cotizado */}
                    {precio && (
                        <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-gray-900">{precio}</span>
                            <span className="text-[10px] text-dark-gray uppercase font-medium">MXN cotizado</span>
                        </div>
                    )}
                    {/* icono de chevron */}
                    {isOpen ? (
                        <LuChevronUp className="w-5 h-5 text-dark-gray" />
                    ) : (
                        <LuChevronDown className="w-5 h-5 text-dark-gray" />
                    )}
                </div>
            </div>

            {/* contenido expandible */}
            {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex flex-col gap-5">
                    {children}
                </div>
            )}
        </div>
    );
}
