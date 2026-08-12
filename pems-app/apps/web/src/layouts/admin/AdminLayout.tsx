import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Topbar from "../../components/topbar/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex">
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar />
        </div>

        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        )}

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
