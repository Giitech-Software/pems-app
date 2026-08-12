import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Landlords", path: "/admin/landlords", icon: ShieldCheck },
  { label: "Properties", path: "/admin/properties", icon: Building2 },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col bg-slate-950 text-white">
      <div className="shrink-0 border-b border-white/10 px-6 py-6">
        <p className="text-xs font-bold tracking-[0.3em] text-amber-400">
          PEMS
        </p>
        <h1 className="mt-2 text-lg font-bold">Admin Console</h1>
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
