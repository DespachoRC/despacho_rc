import type { Metadata } from "next";
import { SuperadminSidebar } from "@/app/components/superadmin/SuperadminSidebar";
import { Header } from "@/app/components/layout/Header";
import { ProfileProvider } from "@/app/components/layout/ProfileContext";

export const metadata: Metadata = {
    title: "Superadmin Dashboard | DespachoRC",
    description: "Panel de administración global solo lectura para el rol Superadmin (Owner)",
};

export default function SuperadminDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProfileProvider>
            <div className="w-screen h-screen grid grid-cols-[auto_1fr] grid-rows-[70px_1fr] gap-4 p-3 overflow-hidden bg-slate-50">
                <SuperadminSidebar />
                <Header />
                <main className="overflow-y-auto p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm min-w-0 flex flex-col gap-6">
                    {children}
                </main>
            </div>
        </ProfileProvider>
    );
}
