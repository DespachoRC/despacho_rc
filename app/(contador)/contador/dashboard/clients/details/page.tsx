"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LuArrowLeft,
    LuBuilding2,
    LuInbox,
    LuMessageSquare,
    LuUpload,
    LuFolder,
    LuFileText,
} from "react-icons/lu";
import { FileAttachment } from "@/app/components/ui/FileAttachment";
import { ChatBox } from "@/app/components/ui/ChatBox";
import { Button } from "@/app/components/ui/Button";

interface Message {
    id: string;
    text: string;
    sender: "despacho" | "cliente";
    time: string;
}

export default function ClientDetailsPage() {
    const [activeTab, setActiveTab] = useState<"insumos" | "chat" | "entregables" | "carpeta">("insumos");

    const initialMessages: Message[] = [
        {
            id: "1",
            text: "Buenos días, ¿ya pudo subir los estados de cuenta de junio?",
            sender: "despacho",
            time: "09:15",
        },
        {
            id: "2",
            text: "Sí, los acabo de cargar. Son 3 archivos PDF.",
            sender: "cliente",
            time: "09:47",
        },
        {
            id: "3",
            text: "Perfecto, los revisaré y le aviso si necesito algo más. En aprox. 48 hrs tendrá su declaración.",
            sender: "despacho",
            time: "09:50",
        },
    ];

    const tabs = [
        { id: "insumos", label: "Bandeja de Insumos", icon: LuInbox },
        { id: "chat", label: "Chat Operativo", icon: LuMessageSquare },
        { id: "entregables", label: "Cargar Entregables", icon: LuUpload },
        { id: "carpeta", label: "Carpeta General", icon: LuFolder },
    ] as const;

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <div className="flex flex-col gap-6">
                <div>
                    <Link
                        href="/contador/dashboard/clients"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-700 transition-colors font-medium"
                    >
                        <LuArrowLeft className="w-4 h-4" />
                        Volver a Mis Clientes
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                        <LuBuilding2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-navy-950">
                            Grupo Monterrey SA de CV
                        </h1>
                        <p className="text-sm text-slate-500 font-normal mt-0.5">
                            Persona Moral · contacto@grupomonterrey.mx
                        </p>
                    </div>
                </div>

                <div className="bg-slate-100/70 p-1.5 rounded-xl inline-flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? "bg-white text-navy-950 shadow-sm border-b-2 border-navy-600"
                                        : "text-slate-500 hover:text-navy-700"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === "insumos" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 text-navy-600 rounded-lg">
                                        <LuFileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-lg font-bold text-navy-950">
                                            Declaración Mensual IVA
                                        </h3>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                                            Junio 2025
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">
                                    Recibido: 01 Jul 2025
                                </span>
                            </div>

                            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                                <p className="text-sm text-slate-600 italic">
                                    &quot;Tengo facturas de gastos y ventas en XML, favor revisar saldo a favor del mes pasado.&quot;
                                </p>
                            </div>

                            <div className="space-y-2 pt-1">
                                <FileAttachment nombreArchivo="facturas_junio.pdf" />
                                <FileAttachment nombreArchivo="gastos_junio.zip" />
                                <FileAttachment nombreArchivo="xml_ventas_jun.zip" />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 text-navy-600 rounded-lg">
                                        <LuFileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-lg font-bold text-navy-950">
                                            Contabilidad General
                                        </h3>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                                            Junio 2025
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">
                                    Recibido: 01 Jul 2025
                                </span>
                            </div>

                            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                                <p className="text-sm text-slate-600 italic">
                                    &quot;Los estados de cuenta cubren todo junio. Hay un crédito que vence en julio.&quot;
                                </p>
                            </div>

                            <div className="space-y-2 pt-1">
                                <FileAttachment nombreArchivo="estados_cuenta_junio.pdf" />
                                <FileAttachment nombreArchivo="comprobantes_banco.zip" />
                                <FileAttachment nombreArchivo="conciliacion_junio.xlsx" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 h-full min-h-[500px]">
                        <ChatBox
                            nombreCliente="Grupo Monterrey SA de CV"
                            initialMessages={initialMessages}
                        />
                    </div>
                )}

                {activeTab === "entregables" && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-xl space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-navy-950">
                                Subir Entregable
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 tracking-wider block uppercase">
                                Tarea · Periodo (ID)
                            </label>
                            <select
                                defaultValue="[T-001] Declaración Mensual IVA — Mayo 2025"
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent cursor-pointer"
                            >
                                <option value="[T-001] Declaración Mensual IVA — Mayo 2025">
                                    [T-001] Declaración Mensual IVA — Mayo 2025
                                </option>
                                <option value="[T-002] Declaración Mensual IVA — Junio 2025">
                                    [T-002] Declaración Mensual IVA — Junio 2025
                                </option>
                                <option value="[T-003] Contabilidad General — Junio 2025">
                                    [T-003] Contabilidad General — Junio 2025
                                </option>
                                <option value="[T-004] Cálculo de Nómina — Mayo 2025">
                                    [T-004] Cálculo de Nómina — Mayo 2025
                                </option>
                            </select>
                            <p className="text-xs text-slate-400 font-medium pt-0.5">
                                ID único por tarea para evitar confusión entre solicitudes del mismo tipo.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 tracking-wider block uppercase">
                                Archivo Entregable
                            </label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-navy-300 group transition-colors">
                                <LuUpload className="w-6 h-6 text-slate-400 group-hover:text-navy-600 transition-colors" />
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-navy-700">
                                    Arrastra aquí el documento entregable final
                                </span>
                                <span className="text-xs text-slate-400 font-normal">
                                    PDF, ZIP, XML, imágenes · Máx. 20 MB c/u
                                </span>
                            </div>
                        </div>

                        <Button
                            text="Subir Documento y Notificar al Cliente"
                            icon={<LuUpload className="w-4 h-4" />}
                            className="w-full justify-center py-3.5 mt-2"
                        />
                    </div>
                )}

                {activeTab === "carpeta" && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                                <LuFolder className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-navy-950">
                                    Carpeta General — Grupo Monterrey SA de CV
                                </h2>
                                <p className="text-sm text-slate-500 font-normal mt-1">
                                    Documentos generales subidos por el cliente. Solo lectura.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                    Tickets
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                    2 archivos
                                </span>
                            </div>
                            <div className="space-y-2">
                                <FileAttachment nombreArchivo="ticket_combustible_jun.pdf" />
                                <FileAttachment nombreArchivo="ticket_papeleria_jun.jpg" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                    Documentos de Afiliación
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                    0 archivos
                                </span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-400 font-normal italic">
                                    El cliente aún no ha subido archivos en esta sección.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                    Facturas
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                    2 archivos
                                </span>
                            </div>
                            <div className="space-y-2">
                                <FileAttachment nombreArchivo="factura_proveedor_001.xml" />
                                <FileAttachment nombreArchivo="factura_proveedor_002.xml" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
