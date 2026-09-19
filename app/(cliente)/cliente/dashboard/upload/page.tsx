import { FileAttachment } from "@/app/components/ui/FileAttachment";
import { PageHeader } from "@/app/components/ui/PageHeader";
import {
    LuClipboardList,
    LuFolderOpen,
    LuUpload,
} from "react-icons/lu";

const tiposTarea = [
    "Declaración Mensual ISR",
    "Declaración Mensual IVA",
    "Declaración Anual",
    "Cálculo de Nómina",
    "Contabilidad General",
];

const carpetas = [
    {
        nombre: "Tickets",
        archivos: ["tickets_junio.pdf"],
    },
    {
        nombre: "Documentos de Afiliación",
        archivos: ["contrato_afiliacion_imss.pdf"],
    },
    {
        nombre: "Facturas",
        archivos: ["factura_venta_A001.xml"],
    },
];

export default function UploadPage() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto pr-1">
            <PageHeader 
                title="Cargar Documentación" 
                subtitle="Selecciona los tipos de tarea y adjunta los documentos requeridos" 
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl">
                        <LuClipboardList className="w-5 h-5 text-navy-600" />
                    </div>
                    <h2 className="text-base font-semibold text-navy-950">
                        ¿Para qué necesitas apoyo este mes?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-xl overflow-hidden mt-1">
                    {tiposTarea.map((tipo, index) => (
                        <label
                            key={tipo}
                            className={`flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors
                                ${index % 2 === 0 ? "md:border-r md:border-slate-200" : ""}
                                ${index < tiposTarea.length - (tiposTarea.length % 2 === 0 ? 2 : 1) ? "border-b border-slate-200" : ""}
                                ${index === tiposTarea.length - 1 && tiposTarea.length % 2 !== 0 ? "md:col-span-2 md:border-r-0 border-b-0" : "border-b border-slate-200 md:border-b-0"}
                            `}
                        >
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-navy-600 border-slate-300 rounded focus:ring-navy-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-700">{tipo}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2.5 rounded-xl">
                            <LuFolderOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-base font-semibold text-navy-950">
                            Carpeta General
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-14">
                        Sube aquí documentos generales que aplican a varias tareas. Accesibles para el administrador y tu contador asignado.
                    </p>
                </div>

                <div className="flex flex-col gap-8 ml-14">
                    {carpetas.map((carpeta) => (
                        <div key={carpeta.nombre} className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {carpeta.nombre}
                            </p>

                            {carpeta.archivos.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {carpeta.archivos.map((archivo) => (
                                        <FileAttachment
                                            key={archivo}
                                            nombreArchivo={archivo}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 text-center hover:border-navy-300 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <LuUpload className="w-5 h-5 text-slate-400 group-hover:text-navy-600 transition-colors" />
                                <p className="text-sm font-medium text-slate-600 group-hover:text-navy-700">
                                    Añadir archivos a &ldquo;{carpeta.nombre}&rdquo;
                                </p>
                                <p className="text-xs text-slate-400">
                                    PDF, ZIP, XML, imágenes · Máx. 20 MB c/u
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
