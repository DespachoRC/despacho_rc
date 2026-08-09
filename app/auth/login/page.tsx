'use client';

import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { LuMail, LuLock } from "react-icons/lu";

export default function Login() {
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()

        console.log("Iniciaste sesión!");
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
            <form onSubmit={handleSubmit} action="" method="post" className="w-full h-3/7 max-w-130 flex flex-col gap-4">
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

                <div className="w-full flex flex-col gap-6 items-center mt-6">
                    <Button
                        text="Iniciar sesión"
                        type="submit"
                        className="w-full p-4"
                    />
                    <Link href="/password-reset" className="w-full text-center">Olvidé mi contraseña</Link>
                </div>
            </form>
        </>
    );
}