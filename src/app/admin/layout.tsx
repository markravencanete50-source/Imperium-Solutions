import type { Metadata } from "next";
import { AuthProvider } from "@/components/admin/auth";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Imperium Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="adm">{children}</div>
    </AuthProvider>
  );
}
