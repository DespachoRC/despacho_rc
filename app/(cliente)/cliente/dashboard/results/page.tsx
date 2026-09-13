"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/Badge";
import { ChatBox } from "@/app/components/ui/ChatBox";
import {
    LuFileText,
    LuDownload,
    LuMessageSquare,
} from "react-icons/lu";

// tipos de estatus validos para las filas del historial
type Estatus = "Listo" | "En Proceso" | "Pendiente";

// mapa de variante de badge por estatus
const estatusBadge: Record<Estatus, { variant: "success" | "blue" | "orange"; text: string }> = {
    "Listo":      { variant: "success", text: "Listo" },
    "En Proceso": { variant: "blue",    text: "En Proceso" },
    "Pendiente":  { variant: "orange",  text: "Pendiente" },
};

// datos mock del historial de documentos
const historial: {
    id: number;
    tipo: string;
    periodo: string;
    fechaEntrega: string | null;
    estatus: Estatus;
}[] = [
    { id: 1, tipo: "Declaración Mensual ISR", periodo: "Mayo 2025",  fechaEntrega: "05 Jun 2025", estatus: "Listo" },
    { id: 2, tipo: "Declaración Mensual IVA", periodo: "Mayo 2025",  fechaEntrega: "06 Jun 2025", estatus: "Listo" },
    { id: 3, tipo: "Cálculo de Nómina",       periodo: "Mayo 2025",  fechaEntrega: "07 Jun 2025", estatus: "Listo" },
    { id: 4, tipo: "Declaración Mensual ISR", periodo: "Junio 2025", fechaEntrega: "05 Jul 2025", estatus: "En Proceso" },
    { id: 5, tipo: "Declaración Mensual IVA", periodo: "Junio 2025", fechaEntrega: null,          estatus: "Pendiente" },
];

// mensajes mock del chat con la contadora
const mensajesContadora = [
    {
        id: "1",
        text: "Buenos días, ¿ya pudo subir los estados de cuenta de junio?",
        sender: "cliente" as const,
        time: "09:15",
    },
    {
        id: "2",
        text: "Sí, los acabo de cargar. Son 3 archivos PDF.",
        sender: "despacho" as const,
        time: "09:47",
    },
    {
        id: "3",
        text: "Perfecto, los revisaré y le aviso si necesito algo más. En aprox. 48 hrs tendrá su declaración.",
        sender: "cliente" as const,
        time: "09:50",
    },
];

export default function ResultsPage() {
    // controla visibilidad del chat con la contadora
    const [chatAbierto, setChatAbierto] = useState(true);

    return (
        <div className="flex flex-col gap-6 p-6">

            {/* encabezado con boton toggle de chat a la derecha */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Mis Resultados
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Historial de declaraciones y documentos entregados por el despacho
                    </p>
                </div>

                {/* boton que hace toggle del chat */}
                <button
                    onClick={() => setChatAbierto(!chatAbierto)}
                    className="flex items-center gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                    <LuMessageSquare className="w-4 h-4" />
                    Chat con Contadora
                </button>
            </div>

            {/* chat con la contadora — visible cuando chatAbierto es true */}
            {chatAbierto && (
                <ChatBox
                    nombreCliente="Ana Martínez García (Contadora)"
                    initialMessages={mensajesContadora}
                />
            )}

            {/* contenedor tipo tarjeta con la tabla */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">

                {/* encabezado interno de la tarjeta */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-800">
                        Historial de Documentos
                    </h2>
                    <span className="text-xs text-gray-400 italic">
                        Ordenado por periodo · más reciente primero
                    </span>
                </div>

                {/* tabla semantica de historial */}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                Tipo de Documento
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                Periodo
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                Fecha de Entrega
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                Estatus
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {historial.map((fila) => {
                            const badge = estatusBadge[fila.estatus];
                            return (
                                <tr key={fila.id} className="hover:bg-gray-50/60 transition-colors">

                                    {/* tipo de documento con icono */}
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-2.5">
                                            <LuFileText className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="text-gray-800 font-medium">
                                                {fila.tipo}
                                            </span>
                                        </div>
                                    </td>

                                    {/* periodo */}
                                    <td className="py-4 pr-4 text-gray-600">
                                        {fila.periodo}
                                    </td>

                                    {/* fecha de entrega — guion si aun no hay */}
                                    <td className="py-4 pr-4 text-gray-600">
                                        {fila.fechaEntrega ?? (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>

                                    {/* badge de estatus */}
                                    <td className="py-4 pr-4">
                                        <Badge variant={badge.variant} text={badge.text} />
                                    </td>

                                    {/* boton de descarga solo para documentos listos */}
                                    <td className="py-4">
                                        {fila.estatus === "Listo" ? (
                                            <button className="flex items-center gap-1.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                                <LuDownload className="w-3.5 h-3.5" />
                                                Descargar
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 pl-1">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
