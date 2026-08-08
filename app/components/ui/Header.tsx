import { LuBell, LuUser } from "react-icons/lu";

export function Header() {
    return(
        <header className="flex justify-end items-center gap-8 bg-dark-gray pr-6 rounded-2xl text-base">
            <div className="flex justify-center items-center p-4 rounded-2xl bg-gray cursor-pointer">
                <LuBell className="text-lg"/>
            </div>
            <div className="flex items-center gap-6 px-4 py-2 rounded-2xl cursor-pointer hover:bg-gray">
                <div className="flex flex-col">
                    <span>Jonathan</span>
                    <span>Administrador</span>    
                </div>
                <div>
                    <LuUser className="text-lg"/>
                </div>
            </div>
        </header>
    );
}