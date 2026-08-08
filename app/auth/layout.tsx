import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "DespachoRC",
  description: "Login",
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="w-screen h-screen grid grid-cols-[2fr_3fr] grid-rows-1">
      <div className="flex flex-col gap-6 justify-center items-center">
        {children}
      </div>
      <div className="relative">
          <Image
              src="/hero.jpg"
              alt="hero"
              fill
              className="object-cover object-center rounded-l-4xl"
          />
          <div className="w-full h-full absolute top left flex justify-center items-center bg-primary z-100 opacity-80 rounded-l-4xl">
            <Image
              src="/logo_text_white.png"
              alt="logo_text_white"
              width={500}
              height={500} 
            />
          </div>
      </div>
    </div>
  );
}
