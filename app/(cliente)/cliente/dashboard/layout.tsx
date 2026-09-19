import type { Metadata } from "next";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout/Header";
import { ProfileProvider } from "@/app/components/layout/ProfileContext";

export const metadata: Metadata = {
    title: "Portal Cliente | DespachoRC",
    description: "Portal de cliente DespachoRC",
};

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProfileProvider>
            <div className="w-screen h-screen grid grid-cols-[auto_1fr] grid-rows-[70px_1fr] gap-4 p-3 overflow-hidden bg-slate-50">
                <Sidebar />
                <Header />
                <main className="overflow-y-auto p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm min-w-0">
                    {children}
                </main>
            </div>
        </ProfileProvider>
    );
}
