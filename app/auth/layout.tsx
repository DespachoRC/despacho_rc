import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Despacho RC — Acceso",
  description: "Inicia sesión para acceder a tu despacho contable.",
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="w-full min-h-screen flex bg-white selection:bg-navy-900 selection:text-white">
      {/* Panel izquierdo — formulario con mayor respiro y minimalismo */}
      <div className="flex flex-col justify-center items-center w-full lg:max-w-[560px] px-8 sm:px-12 md:px-16 bg-white lg:border-r border-slate-100 relative z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

      {/* Panel derecho — imagen + overlay premium */}
      <div className="relative flex-1 hidden lg:flex flex-col items-center justify-center overflow-hidden bg-navy-950">
        <Image
          src="/hero.jpg"
          alt="hero"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Gradiente sutil para permitir ver la imagen */}
        <div className="absolute inset-0 bg-navy-950/90" />

        {/* Contenido centrado en el panel derecho */}
        <div className="relative flex flex-col items-center justify-center gap-10 p-12 w-full max-w-2xl text-center">
          <Image
            src="/logo.png"
            alt="Despacho RC"
            width={340}
            height={340}
            priority
            className="w-auto h-auto max-w-[340px] max-h-[160px] object-contain drop-shadow-md"
          />
          <div className="space-y-5">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Elegancia y precisión contable
            </h2>
            <p className="text-white text-lg font-normal max-w-lg mx-auto leading-relaxed opacity-95">
              Bienvenido a tu despacho digital. Gestiona clientes, automatiza declaraciones y mantén tus documentos en un entorno seguro y sofisticado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
