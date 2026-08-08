import type { Metadata } from "next";
import { Sidebar } from "../components/ui/Sidebar";
import { Header } from "../components/ui/Header";

export const metadata: Metadata = {
    title: "Dashboard | DespachoRC",
    description: "Dashboard"
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
    return(
        <div className="w-screen h-screen grid grid-cols-[300_1fr] grid-rows-[90_1fr] gap-2 p-2">
            <Sidebar />
            <Header />
            <main>
                {children}
            </main>
        </div>
    );
}