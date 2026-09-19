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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 text-slate-500 p-3 rounded-xl flex items-center justify-center">
                        <LuBuilding2 className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-navy-950 text-base">{cliente}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{regimen}</span>
                    </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                    {totalArchivos} {totalArchivos === 1 ? "archivo" : "archivos"}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-6 md:gap-0 border-t border-slate-100 pt-6">
                
                <div className="md:pr-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                        <div className="flex items-center gap-2 text-navy-600">
                            <LuFolder className="w-4 h-4 shrink-0" />
                            <span>Tickets</span>
                        </div>
                        <span className="text-slate-500 font-semibold">{categories.tickets.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {categories.tickets.length > 0 ? (
                            categories.tickets.map((file, i) => (
                                <div key={i}>{renderFileAttachment(file.nombre)}</div>
                            ))
                        ) : (
                            <span className="text-xs italic text-slate-400 py-2">Sin archivos</span>
                        )}
                    </div>
                </div>

                <div className="md:px-6 pt-6 md:pt-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                        <div className="flex items-center gap-2 text-navy-600">
                            <LuFolder className="w-4 h-4 shrink-0" />
                            <span>Documentos de Afiliación</span>
                        </div>
                        <span className="text-slate-500 font-semibold">{categories.afiliacion.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {categories.afiliacion.length > 0 ? (
                            categories.afiliacion.map((file, i) => (
                                <div key={i}>{renderFileAttachment(file.nombre)}</div>
                            ))
                        ) : (
                            <span className="text-xs italic text-slate-400 py-2">Sin archivos</span>
                        )}
                    </div>
                </div>

                <div className="md:pl-6 pt-6 md:pt-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                        <div className="flex items-center gap-2 text-navy-600">
                            <LuFolder className="w-4 h-4 shrink-0" />
                            <span>Facturas</span>
                        </div>
                        <span className="text-slate-500 font-semibold">{categories.facturas.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {categories.facturas.length > 0 ? (
                            categories.facturas.map((file, i) => (
                                <div key={i}>{renderFileAttachment(file.nombre)}</div>
                            ))
                        ) : (
                            <span className="text-xs italic text-slate-400 py-2">Sin archivos</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export function ClientFolderCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-200 w-12 h-12 rounded-xl" />
                    <div className="flex flex-col gap-2">
                        <div className="h-5 w-40 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                    </div>
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-6 md:gap-0 border-t border-slate-100 pt-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex flex-col gap-3 ${i === 1 ? 'md:pr-6' : i === 2 ? 'md:px-6 pt-6 md:pt-0' : 'md:pl-6 pt-6 md:pt-0'}`}>
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-4 w-4 bg-slate-200 rounded" />
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="h-10 w-full bg-slate-200 rounded-xl" />
                            <div className="h-10 w-full bg-slate-200 rounded-xl opacity-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
