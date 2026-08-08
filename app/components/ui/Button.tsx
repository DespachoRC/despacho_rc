interface props {
    text: string,
    type?: "submit" | "reset" | "button",
    isLoading?: boolean,
    disabled?: boolean,
    className?: string,
}

export function Button({
    text, 
    type = "button", 
    isLoading = false, 
    disabled,
    className,
}: props) {
    
    const isDisabled = disabled || isLoading;
    const buttonText = isLoading ? "Cargando..." : text;
    
    return (
        <button 
            type={type} 
            disabled={isDisabled} 
            className={`w-full bg-primary rounded-xl p-4 text-white disabled:opacity-50 cursor-pointer ${className}`}
        >
            {buttonText}
        </button>
    );
}