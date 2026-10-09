"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { LuLock, LuCircleAlert } from "react-icons/lu";
import { createClient } from "@/core/db/clients";

const schema = z.object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

type PageState = "verifying" | "ready" | "invalid" | "success";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [pageState, setPageState] = useState<PageState>("verifying");
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        // Supabase redirige con error en query params cuando el token expiró o es inválido
        const params = new URLSearchParams(window.location.search);
        const errorCode = params.get("error_code");
        if (errorCode) {
            setPageState("invalid");
            return;
        }

        const supabase = createClient();

        // El callback PKCE canjea el código y guarda la sesión en cookies.
        // El cliente del navegador la recupera desde esas mismas cookies.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setPageState("ready");
            } else if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
                setPageState("ready");
            }
        });

        // Timeout: si en 5 segundos no llegó sesión, el token es inválido
        const timeout = setTimeout(() => {
            setPageState((current) => current === "verifying" ? "invalid" : current);
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const onSubmit = async (values: FormValues) => {
        setApiError(null);
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: values.password,
            });

            if (error) {
                setApiError(error.message);
            } else {
                setPageState("success");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 3000);
            }
        } catch {
            setApiError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    // Estado: verificando token
    if (pageState === "verifying") {
        return (
            <div className="w-full flex flex-col gap-7 animate-in fade-in duration-300">
                <div className="flex flex-col gap-5 text-center items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-2">
                        <div className="w-7 h-7 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Verificando enlace...
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Por favor espera mientras validamos tu solicitud.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Estado: token inválido o expirado
    if (pageState === "invalid") {
        return (
            <div className="w-full flex flex-col gap-7 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col gap-5 text-center items-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-2">
                        <LuCircleAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Enlace inválido o expirado
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Este enlace de recuperación ya no es válido. Los enlaces expiran en 60 minutos.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/auth/password-reset")}
                        className="mt-2 text-sm font-semibold text-navy-600 hover:text-navy-800 transition-colors underline underline-offset-2"
                    >
                        Solicitar un nuevo enlace
                    </button>
                </div>
            </div>
        );
    }

    // Estado: contraseña actualizada con éxito
    if (pageState === "success") {
        return (
            <div className="w-full flex flex-col gap-7 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col gap-5 text-center items-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                        <LuLock className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            ¡Contraseña actualizada!
                        </h1>
                        <p className="text-base text-slate-500 mt-2 font-medium leading-relaxed">
                            Tu contraseña se ha cambiado correctamente. Serás redirigido al inicio de sesión en unos segundos.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Estado: formulario listo para usar
    return (
        <div className="w-full flex flex-col gap-7">
            <div className="flex flex-col gap-5">
                <div className="mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Nueva contraseña
                    </h1>
                    <p className="text-base text-slate-500 mt-2 font-medium leading-relaxed">
                        Ingresa y confirma tu nueva contraseña para acceder a tu cuenta.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
                    <div className="space-y-5">
                        <Input
                            label="Nueva Contraseña"
                            htmlFor="password"
                            type="password"
                            placeholder="••••••••"
                            icon={<LuLock />}
                            error={errors.password?.message}
                            {...register("password")}
                            className="bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
                        />
                        <Input
                            label="Confirmar Contraseña"
                            htmlFor="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            icon={<LuLock />}
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                            className="bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
                        />
                    </div>

                    {apiError && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                            <p className="text-destructive text-sm font-semibold">{apiError}</p>
                        </div>
                    )}

                    <Button
                        text="Guardar contraseña"
                        type="submit"
                        className="w-full py-3.5 mt-2 text-[15px] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                        isLoading={isLoading}
                    />
                </form>
            </div>
        </div>
    );
}
