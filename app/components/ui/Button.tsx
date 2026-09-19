import { ReactNode } from "react";

interface ButtonProps {
    text?: string;
    type?: "submit" | "reset" | "button";
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    variant?: "solid" | "outline" | "ghost" | "destructive";
    onClick?: () => void;
}

const variantStyles = {
    solid: "bg-navy-900 text-white hover:bg-navy-800 border border-transparent shadow-sm",
    outline: "bg-transparent text-navy-700 border border-navy-700 hover:bg-navy-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent",
    destructive: "bg-rose-500 text-white hover:bg-rose-600 border border-transparent shadow-sm",
};

export function Button({
    text, 
    type = "button", 
    isLoading = false, 
    disabled,
    className = "",
    icon,
    iconPosition = "left",
    variant = "solid",
    onClick,
}: ButtonProps) {
    
    const isDisabled = disabled || isLoading;
    const buttonText = isLoading ? "Cargando..." : text;
    
    return (
        <button 
            type={type} 
            disabled={isDisabled}
            onClick={onClick}
            className={`flex justify-center items-center gap-2 rounded-xl text-base font-semibold px-5 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${className}`}
        >
            {iconPosition === "left" && icon}
            {buttonText}
            {iconPosition === "right" && icon}
        </button>
    );
}