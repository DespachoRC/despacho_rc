import { LuBell, LuUser } from "react-icons/lu";

export function Header() {
    return(
        <header className="flex justify-end items-center gap-8 bg-gray pr-6 rounded-2xl">
            <div className="flex justify-center items-center p-5 rounded-2xl hover:bg-white cursor-pointer">
                <LuBell className="text-lg"/>
            </div>
            <div className="flex items-center gap-6 p-4 rounded-2xl cursor-pointer hover:bg-white">
                <div className="flex gap-2">
                    <span>Jonathan</span> | <span>Administrador</span>    
                </div>
                <div>
                    <LuUser className="text-lg"/>
                </div>
            </div>
        </header>
    );
}