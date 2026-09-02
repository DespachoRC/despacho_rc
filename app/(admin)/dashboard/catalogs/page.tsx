import { LuPlus, LuFileText, LuBriefcase, LuFolderOpen } from "react-icons/lu";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";

export default function Catalogs() {

    const catalogosData = [
        {
            titulo: "Regímenes Fiscales",
            icon: <LuFileText />,
            items: [
            { id: "1", nombre: "RESICO - Personas Físicas", activo: true },
            { id: "2", nombre: "Régimen General de Ley", activo: true },
            { id: "3", nombre: "Persona Moral", activo: true },
            { id: "4", nombre: "Régimen de Arrendamiento", activo: true },
            { id: "5", nombre: "Actividades Empresariales", activo: true },
            { id: "6", nombre: "Plataformas Tecnológicas", activo: false },
            ]
        },
        {
            titulo: "Tipos de Documento / Tarea",
            icon: <LuBriefcase />,
            items: [
            { id: "1", nombre: "Declaración Mensual ISR", activo: true },
            { id: "2", nombre: "Declaración Mensual IVA", activo: true },
            { id: "3", nombre: "Declaración Anual", activo: true },
            { id: "4", nombre: "Cálculo de Nómina", activo: true },
            { id: "5", nombre: "Contabilidad General", activo: true },
            { id: "6", nombre: "Alta ante el SAT", activo: false },
            ]
        },
        {
            titulo: "Especialidades de Contadores",
            icon: <LuBriefcase />,
            items: [
            { id: "1", nombre: "Personas Morales", activo: true },
            { id: "2", nombre: "Personas Físicas RESICO", activo: true },
            { id: "3", nombre: "Nómina e IMSS", activo: true },
            { id: "4", nombre: "Plataformas Digitales", activo: true },
            { id: "5", nombre: "Comercio Exterior", activo: false },
            ]
        },
        {
            titulo: "Carpeta General — Tipos de Archivo",
            icon: <LuFolderOpen />,
            items: [
            { id: "1", nombre: "Tickets", activo: true },
            { id: "2", nombre: "Documentos de Afiliación", activo: true },
            { id: "3", nombre: "Facturas", activo: true },
            ]
        }
    ];

    return(
        <div className="w-full h-full grid gap-2 grid-cols-1 grid-rows-[60_1fr]">
            <div className="flex items-center">
                <h1 className="xl:text-xl font-semibold">Catálogos</h1>
            </div>
            <div className="grid grid-cols-3 gap-6">
                {catalogosData.map((catalogo, index) => (
                    <div key={index} className="flex flex-col gap-4 bg-white border border-dark-gray rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="text-lg">{catalogo.icon}</span>
                            <h2 className="font-semibold">{catalogo.titulo}</h2>
                        </div>
                        <form action="" method="post" className="flex gap-2">
                            <Input
                                isLabelNeed={false}
                                type="text"
                                name="add_new_regime"
                                placeHolder="Añadir nuevo..."
                            />
                            <Button
                                icon={<LuPlus />}
                                className="px-5"
                            />
                        </form>
                        <ul className="flex flex-col gap-2">
                            {catalogo.items.map((item) => (
                            <li key={item.id} className="flex justify-between items-center py-1 text-sm border-b border-gray-100">
                                <span className={item.activo ? "" : "text-dark-gray"}>
                                {item.nombre}
                                </span>
                                <label htmlFor="" className="cursor-pointer">
                                    <input type="checkbox" name="" id="" className="sr-only peer"/>
                                    <div className="w-16 h-8 flex items-center bg-dark-gray p-1 rounded-full peer-focus:outline-none peer peer-checked:bg-primary transition-colors duration-300">
                                        <div className="w-7 h-7 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                                    </div>
                                </label>
                            </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}