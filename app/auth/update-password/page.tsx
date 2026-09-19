"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { LuLock } from "react-icons/lu";
import { createClient } from "@/core/db/client";

const schema = z.object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: FormValues) => {
        setApiError(null);
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: values.password
            });

            if (error) {
                setApiError(error.message);
            } else {
                setSuccess(true);
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

    if (success) {
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
