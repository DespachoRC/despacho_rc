import type { Metadata } from "next";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";

export const metadata: Metadata = {
    title: "Dashboard | DespachoRC",
    description: "Dashboard"
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return(
        <div className="w-screen h-screen grid grid-cols-[300_1fr] grid-rows-[90_1fr] gap-5 p-2 overflow-hidden">
            <Sidebar />
            <Header />
            <main className="overflow-y-auto pr-2">
                {children}
            </main>
        </div>
    );
}