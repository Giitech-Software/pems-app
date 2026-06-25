import { Bell, Menu, Search, UserCircle } from "lucide-react";
import { logoutUser } from "../../../../../packages/firebase";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h2 className="text-lg font-bold text-slate-950 md:text-xl">
              {userProfile?.fullName || "Landlord"}
            </h2>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Search properties, tenants, rooms..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-xl border border-slate-200 p-3 text-slate-700 hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 md:flex">
            <UserCircle size={26} className="text-slate-500" />
            <div>
              <p className="text-sm font-bold text-slate-950">
                {userProfile?.fullName || "Landlord"}
              </p>
              <p className="text-xs text-slate-500">{userProfile?.role}</p>
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}