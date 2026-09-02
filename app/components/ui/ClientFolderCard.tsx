import { ReactNode } from "react";
import { LuBuilding2, LuFolder } from "react-icons/lu";

interface FileItem {
    nombre: string;
    url?: string;
}

interface ClientFolderCardProps {
    cliente: string;
    regimen: string;
    totalArchivos: number;
    categories: {
        tickets: FileItem[];
        afiliacion: FileItem[];
        facturas: FileItem[];
    };
    renderFileAttachment: (nombreArchivo: string) => ReactNode;
}

export function ClientFolderCard({
    cliente,
    regimen,
    totalArchivos,
    categories,
    renderFileAttachment,
}: ClientFolderCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
            
            {/* encabezado de la carpeta del cliente */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* contenedor del icono de edificio */}
                    <div className="bg-gray-100 text-dark-gray p-3 rounded-xl flex items-center justify-center">
                        <LuBuilding2 className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-base">{cliente}</span>
                        <span className="text-xs text-dark-gray mt-0.5">{regimen}</span>
                    </div>
                </div>
                {/* total de archivos de todas las categorias */}
                <span className="text-xs font-semibold text-dark-gray">
                    {totalArchivos} {totalArchivos === 1 ? "archivo" : "archivos"}
                </span>
            </div>

            {/* cuerpo: grid de 3 columnas (categorias) divididas por lineas verticales */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 gap-6 md:gap-0">
                
                {/* columna 1: tickets */}
                <div className="md:pr-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-700 tracking-wider uppercase">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <LuFolder className="w-4 h-4 shrink-0" />
                            <span>Tickets</span>
                        </div>
                        <span className="text-dark-gray font-semibold">{categories.tickets.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {categories.tickets.length > 0 ? (
                            categories.tickets.map((file, i) => (
                                <div key={i}>{renderFileAttachment(file.nombre)}</div>
                            ))
                        ) : (
                            <span className="text-xs italic text-gray-400 py-2">Sin archivos</span>
                        )}
                    </div>
                </div>

                {/* columna 2: documentos de afiliacion */}
                <div className="md:px-6 pt-6 md:pt-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-700 tracking-wider uppercase">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <LuFolder className="w-4 h-4 shrink-0" />
                            <span>Documentos de Afiliación</span>
                        </div>
                        <span className="text-dark-gray font-semibold">{categories.afiliacion.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {categories.afiliacion.length > 0 ? (
                            categories.afiliacion.map((file, i) => (
                                <div key={i}>{renderFileAttachment(file.nombre)}</div>
                            ))
                        ) : (
                            <span className="text-xs italic text-gray-400 py-2">Sin archivos</span>
                        )}
                    </div>
                </div>

                {/* columna 3: facturas */}
                <div className="md:pl-6 pt-6 md:pt-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-700 tracking-wider uppercase">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <LuFolder className="w-4 h-4 shrink-0" />
                            <span>Facturas</span>
                        </div>
                        <span className="text-dark-gray font-semibold">{categories.facturas.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {categories.facturas.length > 0 ? (
                            categories.facturas.map((file, i) => (
                                <div key={i}>{renderFileAttachment(file.nombre)}</div>
                            ))
                        ) : (
                            <span className="text-xs italic text-gray-400 py-2">Sin archivos</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
