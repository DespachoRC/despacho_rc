import { FileAttachment } from "@/app/components/ui/FileAttachment";
import {
    LuClipboardList,
    LuFolderOpen,
    LuUpload,
} from "react-icons/lu";

// opciones de tipo de tarea que el cliente puede seleccionar
const tiposTarea = [
    "Declaración Mensual ISR",
    "Declaración Mensual IVA",
    "Declaración Anual",
    "Cálculo de Nómina",
    "Contabilidad General",
];

// estructura mock de carpeta general con archivos ya subidos
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
        <div className="flex flex-col gap-6 p-6">

            {/* encabezado de la vista */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Cargar Documentación
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Selecciona los tipos de tarea y adjunta los documentos requeridos
                </p>
            </div>

            {/* seccion 1: seleccion de tipos de apoyo */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2">
                    <LuClipboardList className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-semibold text-gray-800">
                        ¿Para qué necesitas apoyo este mes?
                    </h2>
                </div>

                {/* grid de checkboxes estaticos */}
                <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-xl overflow-hidden">
                    {tiposTarea.map((tipo, index) => (
                        <label
                            key={tipo}
                            className={`flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors
                                ${index % 2 === 0 ? "border-r border-gray-200" : ""}
                                ${index < tiposTarea.length - 2 ? "border-b border-gray-200" : ""}
                                ${index === tiposTarea.length - 1 && tiposTarea.length % 2 !== 0 ? "col-span-2 border-r-0" : ""}
                            `}
                        >
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">{tipo}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* seccion 2: carpeta general con zonas de subida */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                <div>
                    <div className="flex items-center gap-2">
                        <LuFolderOpen className="w-5 h-5 text-green-600" />
                        <h2 className="text-base font-semibold text-gray-800">
                            Carpeta General
                        </h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-7">
                        Sube aquí documentos generales que aplican a varias tareas. Accesibles para el administrador y tu contador asignado.
                    </p>
                </div>

                {/* columnas de categoria con archivos y zona de subida */}
                <div className="flex flex-col gap-8">
                    {carpetas.map((carpeta) => (
                        <div key={carpeta.nombre} className="flex flex-col gap-3">

                            {/* encabezado de categoria */}
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {carpeta.nombre}
                            </p>

                            {/* archivos ya subidos */}
                            <div className="flex flex-col gap-2">
                                {carpeta.archivos.map((archivo) => (
                                    <FileAttachment
                                        key={archivo}
                                        nombreArchivo={archivo}
                                    />
                                ))}
                            </div>

                            {/* zona de subida estatica */}
                            <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
                                <LuUpload className="w-5 h-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-500">
                                    Añadir archivos a &ldquo;{carpeta.nombre}&rdquo;
                                </p>
                                <p className="text-xs text-gray-400">
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
