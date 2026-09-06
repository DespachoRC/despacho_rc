import type { Metadata } from "next";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout/Header";

export const metadata: Metadata = {
    title: "Portal Cliente | DespachoRC",
    description: "Portal de cliente DespachoRC",
};

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-screen h-screen grid grid-cols-[300_1fr] grid-rows-[90_1fr] gap-5 p-2 overflow-hidden">
            <Sidebar rol="cliente" />
            <Header />
            <main className="overflow-y-auto pr-2">
                {children}
            </main>
        </div>
    );
}
