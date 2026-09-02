"use client";

import { useState } from "react";
import { ExpandableCard } from "@/app/components/ui/ExpandableCard";
import { FileAttachment } from "@/app/components/ui/FileAttachment";
import { ChatBox } from "@/app/components/ui/ChatBox";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { LuSend, LuCircleCheck } from "react-icons/lu";

// estructura de datos mock para simular las cotizaciones y sus 4 estados posibles
interface CotizacionMock {
    id: string;
    cliente: string;
    estatusText: string;
    estatusVariant: "success" | "danger" | "blue" | "purple" | "teal" | "orange";
    subtitulo: string;
    precio?: string;
    notasCliente: string;
    archivos?: string[];
    hasChat: boolean;
    chatInitialMessages?: {
        id: string;
        text: string;
        sender: "despacho" | "cliente";
        time: string;
    }[];
}

const mockCotizacionesData: CotizacionMock[] = [
    {
        id: "1",
        cliente: "Ferretería López e Hijos",
        estatusText: "Pendiente de Cotizar",
        estatusVariant: "orange",
        subtitulo: "Declaración Mensual IVA - Junio 2025 · Recibido: 01 Jul 2025",
        notasCliente: "Tengo facturas de gastos y ventas en XML, los adjunto. Favor de revisar el saldo a favor del mes pasado.",
        archivos: ["facturas_junio.pdf", "xml_ventas_jun.zip"],
        hasChat: false,
    },
    {
        id: "2",
        cliente: "María Elena Sandoval",
        estatusText: "Enviada al Cliente",
        estatusVariant: "blue",
        subtitulo: "Declaración Mensual ISR - Junio 2025 · Recibido: 02 Jul 2025",
        precio: "$850",
        notasCliente: "ISR mensual bajo RESICO. Incluye ingresos de plataforma digital.",
        hasChat: true,
        chatInitialMessages: [
            {
                id: "1",
                text: "Buenos días, el precio para la Declaración Mensual de IVA es de $1,450 MXN.",
                sender: "despacho",
                time: "10:32",
            },
            {
                id: "2",
                text: "Hola, ¿puede bajarle un poco? El mes pasado fue $1,200.",
                sender: "cliente",
                time: "10:45",
            },
            {
                id: "3",
                text: "Este mes hay mayor volumen de facturas. Lo mejor que puedo hacer es $1,350 MXN.",
                sender: "despacho",
                time: "10:48",
            },
        ],
    },
    {
        id: "3",
        cliente: "Consultores Nexus SC",
        estatusText: "Aceptada",
        estatusVariant: "success",
        subtitulo: "Cálculo de Nómina - Junio 2025 · Recibido: 28 Jun 2025",
        precio: "$1200",
        notasCliente: "5 empleados este periodo. Hubo un ajuste de sueldo para 2 de ellos.",
        archivos: ["nomina_jun25.xlsx"],
        hasChat: false,
    },
    {
        id: "4",
        cliente: "Grupo Monterrey SA de CV",
        estatusText: "Rechazada — En Negociación",
        estatusVariant: "danger",
        subtitulo: "Contabilidad General - 2T 2025 · Recibido: 30 Jun 2025",
        precio: "$3500",
        notasCliente: "Necesito el balance general trimestral con notas al pie.",
        archivos: ["balance_2t.pdf", "notas_balance.docx"],
        hasChat: true,
        chatInitialMessages: [
            {
                id: "1",
                text: "Buenos días, el precio para la Declaración Mensual de IVA es de $1,450 MXN.",
                sender: "despacho",
                time: "10:32",
            },
            {
                id: "2",
                text: "Hola, ¿puede bajarle un poco? El mes pasado fue $1,200.",
                sender: "cliente",
                time: "10:45",
            },
            {
                id: "3",
                text: "Este mes hay mayor volumen de facturas. Lo mejor que puedo hacer es $1,350 MXN.",
                sender: "despacho",
                time: "10:48",
            },
        ],
    },
];

export default function Task() {
    const [cotizaciones, setCotizaciones] = useState<CotizacionMock[]>(mockCotizacionesData);

    // maneja el envío de una nueva cotización de precio
    const handleEnviarPrecio = (id: string, precioInput: string) => {
        setCotizaciones(
            cotizaciones.map((cot) => {
                if (cot.id === id) {
                    return {
                        ...cot,
                        precio: `$${precioInput}`,
                        estatusText: "Enviada al Cliente",
                        estatusVariant: "blue",
                        hasChat: true,
                        chatInitialMessages: [
                            ...(cot.chatInitialMessages || []),
                            {
                                id: "system-1",
                                text: `Se ha enviado una nueva cotización de precio: $${precioInput} MXN.`,
                                sender: "despacho",
                                time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
                            },
                        ],
                    };
                }
                return cot;
            })
        );
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            {/* encabezado de la seccion */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Tareas y Cotizaciones</h1>
                <p className="text-sm text-dark-gray">
                    Bandeja de solicitudes recibidas de los clientes
                </p>
            </div>

            {/* listado de tarjetas de cotizacion expandable */}
            <div className="flex flex-col gap-4">
                {cotizaciones.map((cot) => {
                    return (
                        <ExpandableCard
                            key={cot.id}
                            cliente={cot.cliente}
                            estatusText={cot.estatusText}
                            estatusVariant={cot.estatusVariant}
                            subtitulo={cot.subtitulo}
                            precio={cot.precio}
                        >
                            {/* layout interior del contenido expandido */}
                            <div className={`grid grid-cols-1 ${cot.hasChat ? "lg:grid-cols-12" : "w-full"} gap-6`}>
                                
                                {/* columna izquierda: notas, archivos adjuntos, fijar precio */}
                                <div className={`${cot.hasChat ? "lg:col-span-5" : "w-full"} flex flex-col gap-5`}>
                                    
                                    {/* notas del cliente */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                                            Notas del Cliente
                                        </span>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                                            {cot.notasCliente}
                                        </div>
                                    </div>

                                    {/* archivos adjuntos si existen */}
                                    {cot.archivos && cot.archivos.length > 0 && (
                                        <div className="flex flex-col gap-2.5">
                                            <span className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                                                Archivos Adjuntos ({cot.archivos.length})
                                            </span>
                                            <div className="flex flex-col gap-2">
                                                {cot.archivos.map((file, idx) => (
                                                    <FileAttachment key={idx} nombreArchivo={file} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* fijar precio: se muestra solo en cotizacion inicial o enviada */}
                                    {(cot.estatusVariant === "orange" || cot.estatusVariant === "blue") && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                                                Fijar Precio
                                            </span>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                                        $
                                                    </span>
                                                    <input
                                                        type="text"
                                                        id={`precio-input-${cot.id}`}
                                                        placeholder="0.00"
                                                        defaultValue={cot.precio ? cot.precio.replace("$", "") : ""}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                                                    />
                                                </div>
                                                <Button
                                                    text="Enviar Cotización"
                                                    className="px-5 py-3 text-sm gap-2 whitespace-nowrap"
                                                    icon={<LuSend className="w-4 h-4" />}
                                                    onClick={() => {
                                                        const el = document.getElementById(`precio-input-${cot.id}`) as HTMLInputElement;
                                                        if (el && el.value.trim()) {
                                                            handleEnviarPrecio(cot.id, el.value.trim());
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* estatus especial: aceptada (diseño limpio con texto e icono verde) */}
                                    {cot.estatusVariant === "success" && (
                                        <div className="flex items-center gap-2 text-green-600 py-1">
                                            <LuCircleCheck className="w-5 h-5 shrink-0" />
                                            <span className="text-sm font-semibold">
                                                Aceptada · El contador está trabajando en esta solicitud
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* columna derecha: chat de negociacion */}
                                {cot.hasChat && (
                                    <div className="lg:col-span-7 flex flex-col gap-2">
                                        <span className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                                            Chat de Negociación
                                        </span>
                                        <ChatBox
                                            nombreCliente={cot.cliente}
                                            initialMessages={cot.chatInitialMessages}
                                        />
                                    </div>
                                )}
                            </div>
                        </ExpandableCard>
                    );
                })}
            </div>
        </div>
    );
}