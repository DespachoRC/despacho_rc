"use client";

import { useState } from "react";
import { ExpandableCard } from "@/app/components/ui/ExpandableCard";
import { FileAttachment } from "@/app/components/ui/FileAttachment";
import { Button } from "@/app/components/ui/Button";
import { ChatBox } from "@/app/components/ui/ChatBox";
import {
    LuCheck,
    LuX,
    LuCircleAlert,
    LuMessageSquare,
} from "react-icons/lu";

// mensajes mock del chat de negociacion para la tarjeta rechazada
const mensajesNegociacion = [
    {
        id: "1",
        text: "Buenos días, el precio para la Declaración Mensual de IVA es de $1,450 MXN.",
        sender: "cliente" as const,
        time: "10:32",
    },
    {
        id: "2",
        text: "Hola, ¿puede bajarle un poco? El mes pasado fue $1,200.",
        sender: "despacho" as const,
        time: "10:45",
    },
    {
        id: "3",
        text: "Este mes hay mayor volumen de facturas. Lo mejor que puedo hacer es $1,350 MXN.",
        sender: "cliente" as const,
        time: "11:02",
    },
];

export default function BudgetsPage() {
    // controla si el chat de negociacion de la tarjeta rechazada esta visible
    const [chatAbierto, setChatAbierto] = useState(true);

    return (
        <div className="flex flex-col gap-6 p-6">

            {/* encabezado de la vista */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Mis Presupuestos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Revisa las cotizaciones enviadas por el despacho y toma una decisión
                </p>
            </div>

            {/* tarjeta 1: pendiente de respuesta */}
            <ExpandableCard
                cliente="Declaración Mensual ISR"
                estatusText="Pendiente de Respuesta"
                estatusVariant="orange"
                subtitulo="Periodo: Junio 2025 · Solicitado: 02 Jul 2025"
                precio="$850"
            >
                {/* descripcion del servicio */}
                <p className="text-sm text-gray-600">
                    ISR mensual bajo RESICO. Incluye ingresos de plataforma digital.
                </p>

                {/* botones de decision */}
                <div className="flex items-center gap-3">
                    <Button
                        text="Aceptar Presupuesto"
                        icon={<LuCheck className="w-4 h-4" />}
                        className="bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm font-semibold"
                    />
                    <Button
                        text="Rechazar y Negociar"
                        icon={<LuX className="w-4 h-4" />}
                        className="bg-red-500 hover:bg-red-600 px-5 py-2.5 text-sm font-semibold"
                    />
                </div>
            </ExpandableCard>

            {/* tarjeta 2: aceptada */}
            <ExpandableCard
                cliente="Cálculo de Nómina"
                estatusText="Aceptada"
                estatusVariant="success"
                subtitulo="Periodo: Junio 2025 · Solicitado: 28 Jun 2025"
                precio="$1,200"
            >
                {/* descripcion */}
                <p className="text-sm text-gray-600">
                    5 empleados este periodo. Hubo un ajuste de sueldo para 2 de ellos.
                </p>

                {/* archivo adjunto de la cotizacion */}
                <FileAttachment nombreArchivo="nomina_jun25.xlsx" />

                {/* mensaje de estado aceptado */}
                <div className="flex items-center gap-2 text-green-600">
                    <LuCheck className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium">
                        Presupuesto aceptado · El contador ha comenzado a trabajar en su solicitud
                    </p>
                </div>
            </ExpandableCard>

            {/* tarjeta 3: rechazada y en negociacion (expandida por defecto) */}
            <ExpandableCard
                cliente="Contabilidad General"
                estatusText="Rechazada"
                estatusVariant="danger"
                subtitulo="Periodo: 2T 2025 · Solicitado: 30 Jun 2025"
                precio="$3,500"
            >
                {/* descripcion */}
                <p className="text-sm text-gray-600">
                    Necesito el balance general trimestral con notas al pie.
                </p>

                {/* archivos adjuntos en fila */}
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <div className="flex-1">
                        <FileAttachment nombreArchivo="balance_2t.pdf" />
                    </div>
                    <div className="flex-1">
                        <FileAttachment nombreArchivo="notas_balance.docx" />
                    </div>
                </div>

                {/* estado rechazado */}
                <div className="flex items-center gap-2 text-red-500">
                    <LuCircleAlert className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium">
                        Presupuesto rechazado · En proceso de negociación
                    </p>
                </div>

                {/* boton para abrir/cerrar el chat de negociacion */}
                <button
                    onClick={() => setChatAbierto(!chatAbierto)}
                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors cursor-pointer w-fit"
                >
                    <LuMessageSquare className="w-4 h-4" />
                    {chatAbierto ? "Cerrar chat" : "Abrir chat de negociación"}
                </button>

                {/* chatbox de negociacion */}
                {chatAbierto && (
                    <ChatBox
                        nombreCliente="Administrador del Despacho"
                        initialMessages={mensajesNegociacion}
                    />
                )}
            </ExpandableCard>
        </div>
    );
}
