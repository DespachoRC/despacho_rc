import { Button } from "@/app/components/ui/Button";
import { LuPlus } from "react-icons/lu";

export default function UsersManagement() {
    return(
        <div className="w-full h-full grid gap-2 grid-cols-2 grid-rows-[60_1fr_12fr]">
            <div className="flex items-center">
                <h1 className="xl:text-xl font-semibold">Gestión de usuarios</h1>
            </div>
            <div className="flex justify-end items-center">
                <Button
                    text="Nuevo cliente"
                    className="px-8 py-3"
                    icon={<LuPlus />}
                />
            </div>
            <div className="bg-gray border-dark-gray rounded-2xl"></div>
            <div className="bg-gray border-dark-gray rounded-2xl"></div>
            <div className="col-span-2 bg-gray border-dark-gray rounded-2xl"></div>
        </div>
    );
}