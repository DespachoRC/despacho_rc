'use client';

import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { LuMail, LuLock } from "react-icons/lu";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Error al iniciar sesión.');
                return;
            }

            // determina la ruta destino segun el rol del usuario o correo
            const user = data.user;
            const rol = (user?.user_metadata?.rol || user?.user_metadata?.role || "").toLowerCase();
            const cleanEmail = email.toLowerCase().trim();

            let redirectUrl = "/dashboard/metrics";

            if (rol.includes("contador") || cleanEmail === "lriozcristobal@gmail.com") {
                redirectUrl = "/contador/dashboard/clients";
            } else if (rol.includes("cliente") || cleanEmail === "luispm2424@gmail.com") {
                redirectUrl = "/cliente/dashboard/upload";
            } else if (rol.includes("superadmin") || rol.includes("owner") || cleanEmail === "juan.garcia@ejemplo.com") {
                redirectUrl = "/superadmin/dashboard";
            } else {
                redirectUrl = "/dashboard/metrics";
            }

            router.push(redirectUrl);
            router.refresh();
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }

    return(
        <>
            <div className="w-full max-w-130 flex flex-col justify-center items-center">
                <Image
                    src="/logo_text.png"
                    alt="logo_despachoRC"
                    width={350}
                    height={350}
                />
            </div>
            <div className="w-full max-w-130 flex flex-col text-center xl:text-lg font-semibold">
                Ingresa tu correo electrónico y contraseña para ingresar a tu cuenta.
            </div>
            <form onSubmit={handleSubmit} className="w-full h-3/7 max-w-130 flex flex-col gap-4">
                <Input
                    label="Correo:"
                    htmlFor="email"
                    type="email"
                    name="email"
                    placeHolder="Ingresa correo"
                    icon={<LuMail />}
                />
                <Input
                    label="Contraseña:"
                    htmlFor="password"
                    type="password"
                    name="password"
                    placeHolder="Ingresa contraseña"
                    icon={<LuLock />}
                />

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <div className="w-full flex flex-col gap-6 items-center mt-6">
                    <Button
                        text="Iniciar sesión"
                        type="submit"
                        className="w-full p-4"
                        isLoading={loading}
                    />
                    <Link href="/password-reset" className="w-full text-center">Olvidé mi contraseña</Link>
                </div>
            </form>
        </>
    );
}