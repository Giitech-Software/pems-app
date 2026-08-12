import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, Search, UserCircle } from "lucide-react";
import {
  getNotificationsByUser,
  logoutUser,
} from "../../../../../packages/firebase";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { firebaseUser, userProfile } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadNotifications() {
      if (!firebaseUser) {
        setUnreadNotifications(0);
        return;
      }

      const notifications = await getNotificationsByUser(firebaseUser.uid);

      if (!isMounted) return;

      setUnreadNotifications(
        notifications.filter((notification) => !notification.isRead).length
      );
    }

    loadUnreadNotifications();
    const intervalId = window.setInterval(loadUnreadNotifications, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [firebaseUser]);

  const notificationsPath =
    userProfile?.role === "tenant" ? "/tenant/notifications" : "/notifications";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <p className="text-sm text-slate-500">Welcome back</p>
            <h2 className="truncate text-base font-bold text-slate-950 sm:text-lg md:text-xl">
              {userProfile?.fullName || "Landlord"}
            </h2>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            placeholder="Search properties, tenants, rooms..."
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to={notificationsPath}
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100 sm:p-3"
            aria-label={
              unreadNotifications > 0
                ? `${unreadNotifications} unread notifications`
                : "Notifications"
            }
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white ring-2 ring-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 md:flex">
            <UserCircle size={26} className="shrink-0 text-slate-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {userProfile?.fullName || "Landlord"}
              </p>
              <p className="truncate text-xs text-slate-500">{userProfile?.role}</p>
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 sm:px-4 sm:py-3"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}