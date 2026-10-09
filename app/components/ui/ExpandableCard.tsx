"use client";

import { useState, ReactNode } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { Badge } from "@/app/components/ui/Badge";

interface ExpandableCardProps {
    cliente: string;
    estatusText: string;
    estatusVariant: "success" | "danger" | "navy" | "teal" | "amber" | "ghost" | "pending";
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

    return (
        <div className="shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors select-none"
            >
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-navy-950 text-base">{cliente}</span>
                        <Badge text={estatusText} variant={estatusVariant} />
                    </div>
                    <span className="text-xs text-slate-500">{subtitulo}</span>
                </div>

                <div className="flex items-center gap-6">
                    {precio && (
                        <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-navy-950">{precio}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-medium">MXN cotizado</span>
                        </div>
                    )}
                    {isOpen ? (
                        <LuChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <LuChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex flex-col gap-5">
                    {children}
                </div>
            )}
        </div>
    );
}

export function ExpandableCardSkeleton() {
    return (
        <div className="shrink-0 bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center animate-pulse">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-40 bg-slate-200 rounded"></div>
                    <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-3 w-64 bg-slate-200 rounded mt-1"></div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <div className="h-6 w-24 bg-slate-200 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
            </div>
        </div>
    );
}
