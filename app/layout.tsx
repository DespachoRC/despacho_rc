import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

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
      lang="es"
    >
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
