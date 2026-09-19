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
                    setApiError("Correo o contraseña incorrectos.");
                } else if (res.status === 403) {
                    setApiError("Tu cuenta ha sido desactivada. Contacta soporte.");
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
            } else {
                // admin, owner o cualquier otro rol con acceso al panel
                redirectUrl = "/dashboard/metrics";
            }

            router.push(redirectUrl);
            router.refresh();
        } catch {
            setStatus("error");
            setApiError('Error de conexión. Intenta de nuevo.');
        }
    };

    return (
        <div className="w-full flex flex-col gap-7">
            {/* Logo pequeño — visible en móvil donde el panel derecho está oculto */}
            <div className="md:hidden flex justify-center">
                <Image src="/logo_text.png" alt="Despacho RC" width={200} height={60} />
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Bienvenido de vuelta
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Ingresa tus credenciales para acceder a tu cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                    label="Correo electrónico"
                    htmlFor="email"
                    type="email"
                    placeholder="tu@correo.com"
                    icon={<LuMail />}
                    error={errors.email?.message}
                    {...register("email")}
                />
                <Input
                    label="Contraseña"
                    htmlFor="password"
                    type="password"
                    placeholder="••••••••"
                    icon={<LuLock />}
                    error={errors.password?.message}
                    {...register("password")}
                />

                {apiError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl transition-all duration-200">
                        <p className="text-destructive text-sm font-medium">{apiError}</p>
                    </div>
                )}

                <div className="flex flex-col gap-4 mt-2">
                    <Button
                        text="Iniciar sesión"
                        type="submit"
                        className="w-full py-3"
                        isLoading={status === "fetching" || status === "success"}
                    />
                    <Link
                        href="/auth/password-reset"
                        className="text-center text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors duration-200"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </form>
        </div>
    );
}