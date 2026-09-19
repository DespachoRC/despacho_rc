'use client';

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { LuMail, LuArrowLeft, LuMailCheck } from "react-icons/lu";

const schema = z.object({
    email: z.string().email("Ingresa un correo electrónico válido."),
});

type FormValues = z.infer<typeof schema>;

export default function PasswordResetPage() {
    const [sent, setSent] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: FormValues) => {
        setApiError(null);
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/recuperar-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setApiError(data.error ?? "Ocurrió un error. Intenta de nuevo.");
            } else {
                setSent(true);
            }
        } catch {
            setApiError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-7">
            <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium w-fit"
            >
                <LuArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
            </Link>

            {sent ? (
                /* Estado de confirmación */
                <div className="flex flex-col gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <LuMailCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Revisa tu correo
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Te enviamos un enlace de recuperación a{" "}
                            <span className="font-semibold text-slate-700">{getValues("email")}</span>.
                            El enlace expira en 60 minutos.
                        </p>
                    </div>
                    <p className="text-xs text-slate-400">
                        ¿No lo encuentras? Revisa la carpeta de spam o{" "}
                        <button
                            onClick={() => setSent(false)}
                            className="text-navy-600 hover:text-navy-800 font-medium transition-colors underline underline-offset-2"
                        >
                            intenta de nuevo
                        </button>
                        .
                    </p>
                </div>
            ) : (
                /* Formulario */
                <div className="flex flex-col gap-5">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Recuperar contraseña
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                            Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecerla.
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

                        {apiError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                                <p className="text-rose-700 text-sm font-medium">{apiError}</p>
                            </div>
                        )}

                        <Button
                            text="Enviar enlace de recuperación"
                            type="submit"
                            className="w-full py-3 mt-1"
                            isLoading={isLoading}
                        />
                    </form>
                </div>
            )}
        </div>
    );
}
