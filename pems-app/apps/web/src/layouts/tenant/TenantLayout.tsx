import { useState } from "react";
import TenantSidebar from "../../components/tenant/TenantSidebar";
import Topbar from "../../components/topbar/Topbar";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex">
        <TenantSidebar
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <section className="min-h-screen min-w-0 flex-1">
          <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <div className="w-full max-w-[100vw] overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}