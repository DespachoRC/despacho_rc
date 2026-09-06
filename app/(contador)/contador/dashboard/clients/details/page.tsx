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

// interfaz para los mensajes del chat operativo
interface Message {
    id: string;
    text: string;
    sender: "despacho" | "cliente";
    time: string;
}

export default function ClientDetailsPage() {
    // estado activo para el control de pestanas
    const [activeTab, setActiveTab] = useState<"insumos" | "chat" | "entregables" | "carpeta">("insumos");

    // mensajes iniciales del chat operativo para el mock
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

    // definicion de pestañas navegables
    const tabs = [
        { id: "insumos", label: "Bandeja de Insumos", icon: LuInbox },
        { id: "chat", label: "Chat Operativo", icon: LuMessageSquare },
        { id: "entregables", label: "Cargar Entregables", icon: LuUpload },
        { id: "carpeta", label: "Carpeta General", icon: LuFolder },
    ] as const;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* enlace para volver al listado de mis clientes */}
            <div>
                <Link
                    href="/contador/dashboard/clients"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium"
                >
                    <LuArrowLeft className="w-4 h-4" />
                    Volver a Mis Clientes
                </Link>
            </div>

            {/* encabezado de la vista del cliente */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl text-gray-700">
                    <LuBuilding2 className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Grupo Monterrey SA de CV
                    </h1>
                    <p className="text-sm text-gray-500 font-normal">
                        Persona Moral · contacto@grupomonterrey.mx
                    </p>
                </div>
            </div>

            {/* sistema de navegacion por pestañas */}
            <div className="bg-gray-100/70 p-1.5 rounded-xl inline-flex gap-2 w-full sm:w-auto overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                isActive
                                    ? "bg-white text-gray-900 shadow-sm border-b-2 border-primary"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* contenido segun pestaña activa */}
            {activeTab === "insumos" && (
                <div className="space-y-6">
                    {/* tarjeta de solicitud 1: declaracion mensual iva */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-primary rounded-lg">
                                    <LuFileText className="w-5 h-5" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Declaración Mensual IVA
                                    </h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                                        Junio 2025
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                Recibido: 01 Jul 2025
                            </span>
                        </div>

                        <div className="bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-600 italic">
                                &quot;Tengo facturas de gastos y ventas en XML, favor revisar saldo a favor del mes pasado.&quot;
                            </p>
                        </div>

                        <div className="space-y-2 pt-1">
                            <FileAttachment nombreArchivo="facturas_junio.pdf" />
                            <FileAttachment nombreArchivo="gastos_junio.zip" />
                            <FileAttachment nombreArchivo="xml_ventas_jun.zip" />
                        </div>
                    </div>

                    {/* tarjeta de solicitud 2: contabilidad general */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-primary rounded-lg">
                                    <LuFileText className="w-5 h-5" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Contabilidad General
                                    </h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                                        Junio 2025
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                Recibido: 01 Jul 2025
                            </span>
                        </div>

                        <div className="bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-600 italic">
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
                <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    <ChatBox
                        nombreCliente="Grupo Monterrey SA de CV"
                        initialMessages={initialMessages}
                    />
                </div>
            )}

            {activeTab === "entregables" && (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm space-y-3">
                    <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mx-auto">
                        <LuUpload className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Cargar Entregables</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Aquí podrás subir declaraciones, acusaciones y reportes para Grupo Monterrey SA de CV.
                    </p>
                </div>
            )}

            {activeTab === "carpeta" && (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm space-y-3">
                    <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mx-auto">
                        <LuFolder className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Carpeta General</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Expediente digital y documentos permanentes de la empresa.
                    </p>
                </div>
            )}
        </div>
    );
}
