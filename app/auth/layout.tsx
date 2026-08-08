import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DespachoRC",
  description: "Login",
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="w-screen h-screen flex">
      {children}
    </div>
  );
}
