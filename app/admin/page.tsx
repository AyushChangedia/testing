import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Operations",
  description: "Noir Café operations dashboard — orders, revenue, inventory and customers.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
