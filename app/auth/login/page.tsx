'use client';

import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { LuMail, LuLock } from "react-icons/lu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
    email: z.string().email("Ingresa un correo electrónico válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type AuthState = "idle" | "validating" | "fetching" | "success" | "error";

export default function Login() {
    const router = useRouter();
    const [apiError, setApiError] = useState<string | null>(null);
    const [status, setStatus] = useState<AuthState>("idle");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setApiError(null);
        setStatus("fetching");

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                if (res.status === 401) {
                    setApiError(data.error || "Correo o contraseña incorrectos.");
                } else if (res.status === 403) {
                    setApiError(data.error || "Tu cuenta ha sido desactivada. Contacta soporte.");
                } else {
                    setApiError(data.error ?? "Ocurrió un error al iniciar sesión.");
                }
                return;
            }

            setStatus("success");
            
            // determina la ruta destino segun el nombre del rol devuelto por la API
            const role = String(data.role ?? "").toLowerCase();
            let redirectUrl = "/dashboard/metrics";

            if (role.includes("contador")) {
                redirectUrl = "/contador/dashboard/clients";
            } else if (role.includes("cliente")) {
                redirectUrl = "/cliente/dashboard/upload";
            } else if (role.includes("owner")) {
                redirectUrl = "/superadmin/dashboard";
            } else {
                // admin o cualquier otro rol con acceso al panel
                redirectUrl = "/dashboard/metrics";
            }

            // Esperar 2 segundos para mostrar la pantalla de carga antes de redirigir
            setTimeout(() => {
                router.push(redirectUrl);
                router.refresh();
            }, 2000);
            
        } catch {
            setStatus("error");
            setApiError('Error de conexión. Intenta de nuevo.');
        }
    };

    return (
        <div className="w-full flex flex-col gap-7">
            {/* --- Intro Overlay Animado (Solo en Success) --- */}
            {status === "success" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950 animate-in fade-in duration-500">
                    <div className="animate-in zoom-in-75 duration-700 delay-150 flex flex-col items-center gap-6">
                        <Image
                            src="/logo.png"
                            alt="Despacho RC"
                            width={340}
                            height={340}
                            priority
                            className="w-auto h-auto max-w-[340px] max-h-[160px] object-contain drop-shadow-2xl animate-pulse"
                        />
                        <div className="flex items-center gap-3 opacity-80">
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logo pequeño — visible en móvil donde el panel derecho está oculto */}
            <div className="lg:hidden flex justify-center mb-4">
                <Image src="/logo_text.png" alt="Despacho RC" width={200} height={60} />
            </div>

            <div className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Bienvenido de vuelta
                </h1>
                <p className="text-base text-slate-500 mt-2 font-medium">
                    Ingresa tus credenciales para acceder a tu cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
                <div className="space-y-5">
                    <Input
                        label="Correo electrónico"
                        htmlFor="email"
                        type="email"
                        placeholder="tu@correo.com"
                        icon={<LuMail />}
                        error={errors.email?.message}
                        {...register("email")}
                        className="bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
                    />
                    <Input
                        label="Contraseña"
                        htmlFor="password"
                        type="password"
                        placeholder="••••••••"
                        icon={<LuLock />}
                        error={errors.password?.message}
                        {...register("password")}
                        className="bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
                    />
                </div>

                {apiError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                        <p className="text-destructive text-sm font-semibold">{apiError}</p>
                    </div>
                )}

                <div className="flex flex-col gap-6 mt-4">
                    <Button
                        text="Iniciar sesión"
                        type="submit"
                        className="w-full py-3.5 text-[15px] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                        isLoading={status === "fetching" || status === "success"}
                    />
                    <Link
                        href="/auth/password-reset"
                        className="text-center text-sm text-slate-500 hover:text-navy-700 font-semibold transition-colors duration-200"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </form>
        </div>
    );
}