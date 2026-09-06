import type { Metadata } from "next";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout/Header";

export const metadata: Metadata = {
    title: "Portal Contador | DespachoRC",
    description: "Portal de contador DespachoRC",
};

export default function ContadorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-screen h-screen grid grid-cols-[300_1fr] grid-rows-[90_1fr] gap-5 p-2 overflow-hidden">
            <Sidebar rol="contador" />
            <Header />
            <main className="overflow-y-auto pr-2">
                {children}
            </main>
        </div>
    );
}
