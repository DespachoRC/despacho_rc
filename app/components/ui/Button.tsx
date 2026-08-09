import { ReactNode } from "react";

interface props {
    text?: string,
    type?: "submit" | "reset" | "button",
    isLoading?: boolean,
    disabled?: boolean,
    className?: string,
    icon?: ReactNode,
    iconPostion?: string
}

export function Button({
    text, 
    type = "button", 
    isLoading = false, 
    disabled,
    className,
    icon,
    iconPostion = "left"
}: props) {
    
    const isDisabled = disabled || isLoading;
    const buttonText = isLoading ? "Cargando..." : text;
    
    return (
        <button 
            type={type} 
            disabled={isDisabled} 
            className={`flex justify-center items-center gap-6 bg-primary rounded-xl text-white disabled:opacity-50 cursor-pointer ${className}`}
        >
            {icon}
            {buttonText}
        </button>
    );
}