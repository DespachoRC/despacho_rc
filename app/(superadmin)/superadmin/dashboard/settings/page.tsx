import { ProfileSettings } from "@/app/components/features/ProfileSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Configuración | DespachoRC",
};

export default function SettingsPage() {
    return <ProfileSettings />;
}
