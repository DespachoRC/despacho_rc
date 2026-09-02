"use client";

import { ClientFolderCard } from "@/app/components/ui/ClientFolderCard";
import { FileAttachment } from "@/app/components/ui/FileAttachment";

// mock de datos de carpetas generales por cliente mapeando las capturas
const mockCarpetas = [
    {
        id: "1",
        cliente: "Grupo Monterrey SA de CV",
        regimen: "Persona Moral",
        totalArchivos: 4,
        categories: {
            tickets: [
                { nombre: "ticket_combustible_jun.pdf" },
                { nombre: "ticket_papeleria_jun.jpg" },
            ],
            afiliacion: [],
            facturas: [
                { nombre: "factura_proveedor_001.xml" },
                { nombre: "factura_proveedor_002.xml" },
            ],
        },
    },
    {
        id: "2",
        cliente: "Ferretería López e Hijos",
        regimen: "Actividades Empresariales",
        totalArchivos: 3,
        categories: {
            tickets: [
                { nombre: "tickets_junio.pdf" },
            ],
            afiliacion: [
                { nombre: "contrato_afiliacion_imss.pdf" },
            ],
            facturas: [
                { nombre: "factura_venta_A001.xml" },
            ],
        },
    },
    {
        id: "3",
        cliente: "Consultores Nexus SC",
        regimen: "Régimen General de Ley",
        totalArchivos: 1,
        categories: {
            tickets: [],
            afiliacion: [
                { nombre: "alta_imss_empleados.pdf" },
            ],
            facturas: [],
        },
    },
    {
        id: "4",
        cliente: "María Elena Sandoval",
        regimen: "RESICO - Personas Físicas",
        totalArchivos: 1,
        categories: {
            tickets: [
                { nombre: "ticket_viaje_jun.pdf" },
            ],
            afiliacion: [],
            facturas: [],
        },
    },
    {
        id: "5",
        cliente: "Inmobiliaria Cenit SA",
        regimen: "Régimen de Arrendamiento",
        totalArchivos: 2,
        categories: {
            tickets: [],
            afiliacion: [
                { nombre: "doc_afiliacion_infonavit.pdf" },
            ],
            facturas: [
                { nombre: "facturas_renta_jun.xml" },
            ],
        },
    },
];

export default function Folders() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            {/* encabezado de la seccion */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Carpetas Generales</h1>
                <p className="text-sm text-dark-gray">
                    Documentos generales subidos por cada cliente, organizados por tipo de archivo
                </p>
            </div>

            {/* grid de tarjetas de carpetas de clientes */}
            <div className="flex flex-col gap-6">
                {mockCarpetas.map((carpeta) => (
                    <ClientFolderCard
                        key={carpeta.id}
                        cliente={carpeta.cliente}
                        regimen={carpeta.regimen}
                        totalArchivos={carpeta.totalArchivos}
                        categories={carpeta.categories}
                        renderFileAttachment={(nombre) => (
                            <FileAttachment nombreArchivo={nombre} />
                        )}
                    />
                ))}
            </div>
        </div>
    );
}