import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <section className="min-h-screen flex-1">
          <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}