import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Building,
  DoorOpen,
  Users,
  Wallet,
  AlertCircle,
  MessageSquare,
  BarChart3,
  Wrench,
  Bell,
  UserCircle,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", path: "/properties", icon: Building2 },
  { label: "Buildings", path: "/buildings", icon: Building },
  { label: "Rooms", path: "/rooms", icon: DoorOpen },
  { label: "Tenants", path: "/tenants", icon: Users },
  { label: "Payments", path: "/payments", icon: Wallet },
  { label: "Overdue Rent", path: "/overdue-rent", icon: AlertCircle },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Maintenance", path: "/maintenance", icon: Wrench },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Profile", path: "/profile", icon: UserCircle },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col bg-slate-950 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 flex items-start justify-between border-b border-white/10 px-6 py-6">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-amber-400">
              PEMS
            </p>
            <h1 className="mt-2 text-lg font-bold leading-tight">
              Property Engagement &amp; Management System
            </h1>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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
    </>
  );
}
