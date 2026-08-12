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

        <section className="min-h-screen min-w-0 flex-1">
          <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

          <div className="w-full max-w-[100vw] overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
