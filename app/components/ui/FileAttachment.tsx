import { LuFileText, LuDownload, LuLoader } from "react-icons/lu";

interface FileAttachmentProps {
    nombreArchivo: string;
    onDownload?: () => void;
    isDownloading?: boolean;
}

export function FileAttachment({ nombreArchivo, onDownload, isDownloading = false }: FileAttachmentProps) {
    return (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:bg-slate-100">
            <div className="flex items-center gap-3">
                <LuFileText className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-navy-950">{nombreArchivo}</span>
            </div>

            <button
                type="button"
                onClick={onDownload}
                disabled={isDownloading}
                className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <>
                        <LuLoader className="w-3.5 h-3.5 animate-spin" />
                        Descargando
                    </>
                ) : (
                    <>
                        <LuDownload className="w-3.5 h-3.5" />
                        Descargar
                    </>
                )}
            </button>
        </div>
    );
}
