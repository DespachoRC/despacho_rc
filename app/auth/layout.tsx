import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Despacho RC — Acceso",
  description: "Inicia sesión para acceder a tu despacho contable.",
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="w-screen h-screen flex">
      {/* Panel izquierdo — formulario */}
      <div className="flex flex-col justify-center items-center w-full max-w-[480px] px-10 bg-white border-r border-slate-100">
        {children}
      </div>

      {/* Panel derecho — imagen + overlay */}
      <div className="relative flex-1 hidden md:block">
        <Image
          src="/hero.jpg"
          alt="hero"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Overlay navy más transparente para dejar ver la imagen */}
        <div className="absolute inset-0 bg-navy-900/80 flex flex-col items-center justify-center gap-8">
          <Image
            src="/logo_text_white.png"
            alt="Despacho RC"
            width={340}
            height={340}
            priority
          />
          <p className="text-navy-200 text-sm font-light max-w-xs text-center leading-relaxed">
            Tu despacho contable digital. Gestiona clientes, declaraciones y documentos desde un solo lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
