import { useEffect, useMemo, useState } from "react";
import { getUsersByRole, updateUserAccount } from "../../../../../packages/firebase";
import type { User } from "../../../../../packages/models";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/admin/AdminLayout";

const badgeClasses = {
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-rose-50 text-rose-700",
} as const;

type FilterStatus = "all" | "active" | "pending" | "suspended";

export default function AdminLandlords() {
  const [landlords, setLandlords] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [suspensionReasons, setSuspensionReasons] = useState<Record<string, string>>({});

  const loadLandlords = async () => {
    setLoading(true);
    const subscribers = await getUsersByRole("landlord");
    setLandlords(subscribers);
    setLoading(false);
  };

  useEffect(() => {
    void loadLandlords();
  }, []);

  const filteredLandlords = useMemo(() => {
    const search = query.trim().toLowerCase();

    return landlords.filter((landlord) => {
      const normalizedStatus = landlord.subscriptionStatus ?? (landlord.isActive ? "active" : "suspended");
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      const haystack = `${landlord.fullName} ${landlord.email}`.toLowerCase();
      const matchesQuery = search.length === 0 || haystack.includes(search);

      return matchesStatus && matchesQuery;
    });
  }, [landlords, query, statusFilter]);

  const handleStatusChange = async (userId: string, nextStatus: User["subscriptionStatus"], reason?: string) => {
    const payload: Partial<Pick<User, "subscriptionStatus" | "isActive" | "approvedAt" | "suspensionReason">> = {
      subscriptionStatus: nextStatus,
      isActive: nextStatus === "active",
    };

    if (nextStatus === "active") {
      payload.approvedAt = new Date().toISOString();
      payload.suspensionReason = "";
    }

    if (nextStatus === "suspended") {
      payload.suspensionReason = reason || "Account review required";
    }

    await updateUserAccount(userId, payload);

    setLandlords((current) =>
      current.map((landlord) =>
        landlord.id === userId
          ? {
              ...landlord,
              subscriptionStatus: nextStatus,
              isActive: nextStatus === "active",
              approvedAt: nextStatus === "active" ? new Date().toISOString() : landlord.approvedAt,
              suspensionReason: nextStatus === "suspended" ? reason || "Account review required" : "",
            }
          : landlord
      )
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Landlord subscribers"
        subtitle="Approve, monitor, and manage the landlords subscribed to PEMS."
      />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="landlord-search">
              Search landlord
            </label>
            <input
              id="landlord-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find by name or email"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="status-filter">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="mt-2 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm xl:col-span-3">
            Loading landlord accounts...
          </div>
        ) : filteredLandlords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm xl:col-span-3">
            No landlords match the current filters.
          </div>
        ) : (
          filteredLandlords.map((landlord) => {
            const status = landlord.subscriptionStatus ?? (landlord.isActive ? "active" : "suspended");

            return (
              <article key={landlord.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{landlord.fullName}</h2>
                    <p className="mt-1 text-sm text-slate-500">{landlord.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClasses[status]}`}>
                    {status === "active" ? "Active" : status === "suspended" ? "Suspended" : "Pending"}
                  </span>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Subscription history</p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {status === "active" ? "Subscribed" : status === "pending" ? "Awaiting review" : "Paused"}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="text-sm font-semibold text-slate-700" htmlFor={`suspension-${landlord.id}`}>
                    Reason for suspension
                  </label>
                  <textarea
                    id={`suspension-${landlord.id}`}
                    rows={2}
                    value={suspensionReasons[landlord.id] ?? landlord.suspensionReason ?? ""}
                    onChange={(e) =>
                      setSuspensionReasons((current) => ({
                        ...current,
                        [landlord.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional note for admins"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(landlord.id, "active")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(landlord.id, "suspended", suspensionReasons[landlord.id] ?? landlord.suspensionReason)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                    >
                      Suspend
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(landlord.id, "pending")}
                      className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      Pending
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </AdminLayout>
  );
}
