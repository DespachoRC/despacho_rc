import { ReactNode } from "react";

interface props {
    label: string,
    htmlFor: string,
    type: string,
    name: string,
    placeHolder?: string
    icon?: ReactNode,
    iconPosition?: "left" | "right"
}

export function Input({
    label,
    htmlFor,
    type,
    name,
    placeHolder,
    icon,
    iconPosition = "left"
}: props) {

    return(
        <div className="w-full flex flex-col gap-2">
            <label htmlFor={htmlFor}>{label}</label>
            <div className="relative w-full">
                <input type={type} name={name} id={htmlFor} placeholder={placeHolder} className={`w-full bg-gray border border-gray rounded-xl p-4 focus:outline-dark-gray ${icon && iconPosition === "left" ? "pl-10" : "pr-10"}`} />
                {icon && (
                <span
                    className={`absolute flex items-center text-dark-gray pointer-events-none ${
                    iconPosition === "left" ? "left-3 top-1/2 -translate-y-1/2" : "right-3 top-1/2 -translate-y-1/2"
                    }`}
                >
                    {icon}
                </span>
                )}
            </div>
        </div>
    );
}