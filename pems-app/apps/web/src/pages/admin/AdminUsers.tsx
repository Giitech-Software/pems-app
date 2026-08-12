import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { getAllUsers, updateUserAccount } from "../../../../../packages/firebase";
import type { User, UserRole } from "../../../../../packages/models";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/admin/AdminLayout";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "inactive";

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  landlord: "Landlord",
  property_manager: "Property Manager",
  tenant: "Tenant",
};

const statusClasses = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-rose-50 text-rose-700",
} as const;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingUserId, setUpdatingUserId] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        search.length === 0 ||
        `${user.fullName} ${user.email} ${user.phone || ""}`.toLowerCase().includes(search);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? user.isActive : !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const counts = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "super_admin").length,
      landlords: users.filter((user) => user.role === "landlord").length,
      tenants: users.filter((user) => user.role === "tenant").length,
    }),
    [users]
  );

  async function handleStatusChange(user: User, isActive: boolean) {
    setUpdatingUserId(user.id);

    try {
      await updateUserAccount(user.id, {
        isActive,
        subscriptionStatus:
          user.role === "landlord" ? (isActive ? "active" : "suspended") : user.subscriptionStatus,
        suspensionReason: isActive ? "" : "Disabled by platform administrator",
      });

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive,
                subscriptionStatus:
                  item.role === "landlord" ? (isActive ? "active" : "suspended") : item.subscriptionStatus,
                suspensionReason: isActive ? "" : "Disabled by platform administrator",
              }
            : item
        )
      );
    } finally {
      setUpdatingUserId("");
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Users" subtitle="Search users, review roles, and control platform account access." />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Users", counts.total],
          ["Super Admins", counts.admins],
          ["Landlords", counts.landlords],
          ["Tenants", counts.tenants],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Search users</span>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, email, or phone"
                className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All roles</option>
              <option value="super_admin">Super admins</option>
              <option value="landlord">Landlords</option>
              <option value="property_manager">Property managers</option>
              <option value="tenant">Tenants</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => void loadUsers()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Workflow</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-5 py-6 text-slate-500" colSpan={6}>
                  Loading platform users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-slate-500" colSpan={6}>
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const status = user.isActive ? "active" : "inactive";
                const isSuperAdmin = user.role === "super_admin";

                return (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.phone || "No phone captured"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{roleLabels[user.role]}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[status]}`}>
                        {status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {user.role === "tenant" && user.tenantAccessApproved === false
                        ? "Awaiting landlord approval"
                        : user.role === "landlord"
                          ? user.subscriptionStatus || "pending"
                          : "Platform access"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isSuperAdmin ? (
                        <span className="inline-flex items-center justify-end gap-2 text-xs font-bold text-emerald-700">
                          <ShieldCheck size={15} />
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingUserId === user.id}
                          onClick={() => void handleStatusChange(user, !user.isActive)}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                        >
                          {updatingUserId === user.id
                            ? "Saving..."
                            : user.isActive
                              ? "Disable"
                              : "Enable"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
