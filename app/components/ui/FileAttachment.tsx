import { LuFileText, LuDownload } from "react-icons/lu";

interface FileAttachmentProps {
    nombreArchivo: string;
    onDownload?: () => void;
}

export function FileAttachment({ nombreArchivo, onDownload }: FileAttachmentProps) {
    return (
        <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <LuFileText className="w-5 h-5 text-dark-gray" />
                <span className="text-sm font-medium text-gray-700">{nombreArchivo}</span>
            </div>

            <button
                type="button"
                onClick={onDownload}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
            >
                <LuDownload className="w-3.5 h-3.5" />
                Descargar
            </button>
        </div>
    );
}
