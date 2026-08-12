import { NavLink } from "react-router-dom";
import {
  Bell,
  DoorOpen,
  History,
  LayoutDashboard,
  MessageSquare,
  UserCircle,
  Wallet,
  Wrench,
  X,
} from "lucide-react";

interface TenantSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/tenant", icon: LayoutDashboard },
  { label: "My Room", path: "/tenant/my-room", icon: DoorOpen },
  { label: "Rent Status", path: "/tenant/rent-status", icon: Wallet },
  { label: "Payment History", path: "/tenant/payment-history", icon: History },
  { label: "Maintenance", path: "/tenant/maintenance", icon: Wrench },
  { label: "Messages", path: "/tenant/messages", icon: MessageSquare },
  { label: "Notifications", path: "/tenant/notifications", icon: Bell },
  { label: "Profile", path: "/tenant/profile", icon: UserCircle },
];

export default function TenantSidebar({ isMobileOpen, onClose }: TenantSidebarProps) {
  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close tenant navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-6">
          <div>
            <p className="text-xs font-bold tracking-[0.35em] text-amber-400">PEMS</p>
            <h1 className="mt-2 text-lg font-bold leading-tight">Tenant Portal</h1>
            <p className="mt-1 text-sm text-slate-300">Rent Control Centre</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close tenant navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/tenant"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-900/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
