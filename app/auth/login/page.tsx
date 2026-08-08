'use client';

import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()

        console.log("Iniciaste sesión!");
    }

    return(
        <>
            <div className="w-2/5 h-full flex flex-col gap-6 justify-center items-center bg-white">
                <div className="w-full max-w-130 flex justify-center items-center">
                    <Image
                        src="/logo.png"
                        alt="logo_despachoRC"
                        width={350}
                        height={350}
                    />
                </div>
                <div className="w-full max-w-130 flex flex-col text-center xl:text-xl">
                    Ingresa tu correo electrónico y contraseña para ingresar a tu cuenta.
                </div>
                <form onSubmit={handleSubmit} action="" method="post" className="w-full h-2/5 max-w-130 flex flex-col gap-4">
                    <Input
                        label="Correo:"
                        htmlFor="email"
                        type="email"
                        name="email"
                        placeHolder="Ingresa correo"
                    />
                    <Input
                        label="Contraseña:"
                        htmlFor="password"
                        type="password"
                        name="password"
                        placeHolder="Ingresa contraseña"
                    />

                    <div className="w-full flex flex-col gap-6 items-center mt-6">
                        <Button
                            text="Iniciar sesión"
                            type="submit"
                        />
                        <Link href="/password-reset" className="w-full text-center">Olvidé mi contraseña</Link>
                    </div>
                </form>
            </div>
            <div className="relative w-3/5 h-full">
                <Image
                    src="/hero.png"
                    alt="hero_despachoRC"
                    fill
                    className="object-cover"
                />
            </div>
        </>
    );
}