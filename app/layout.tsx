import type { Metadata } from "next";
import { Montserrat, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "DespachoRC",
  description: "DespachoRC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return(
    <html
      lang="es" className={cn("font-sans", geist.variable)}
    >
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
