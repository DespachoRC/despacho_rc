"use client";

import React, { forwardRef, ReactNode, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    isLabelNeed?: boolean;
    htmlFor?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        isLabelNeed = true,
        htmlFor,
        type,
        icon,
        iconPosition = "left",
        error,
        className,
        ...props
    }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;

        return (
            <div className="w-full flex flex-col gap-2">
                {isLabelNeed && label ? (
                    <label htmlFor={htmlFor} className="text-base font-medium text-slate-700">
                        {label}
                    </label>
                ) : null}
                <div className="relative w-full">
                    <input
                        ref={ref}
                        type={inputType}
                        id={htmlFor}
                        className={`w-full bg-navy-50 border ${
                            error ? "border-rose-500" : "border-slate-200"
                        } rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-navy-700 transition-all ${
                            icon && iconPosition === "left" ? "pl-10" : ""
                        } ${icon && iconPosition === "right" ? "pr-10" : ""} ${isPassword ? "pr-12" : ""} ${className || ""}`}
                        {...props}
                    />
                    {icon && (
                        <span
                            className={`absolute flex items-center text-slate-500 pointer-events-none ${
                                iconPosition === "left"
                                    ? "left-3 top-1/2 -translate-y-1/2"
                                    : "right-3 top-1/2 -translate-y-1/2"
                            }`}
                        >
                            {icon}
                        </span>
                    )}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
                {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";