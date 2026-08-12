import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Building2, Users } from "lucide-react";
import { getPropertiesByOwner, getTenantsByOwner, getUsersByRole } from "../../../../../packages/firebase";
import type { User } from "../../../../../packages/models";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/admin/AdminLayout";

const toDisplayDate = (value: unknown) => {
  if (!value) {
    return "No activity yet";
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "No activity yet" : parsed.toLocaleString();
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }

  return "No activity yet";
};

interface ActivityItem {
  id: string;
  name: string;
  email: string;
  headline: string;
  details: string[];
  updatedAt: string;
}

export default function AdminDashboard() {
  const [landlords, setLandlords] = useState<User[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLandlords = async () => {
      setLoading(true);
      const subscribers = await getUsersByRole("landlord");
      setLandlords(subscribers);

      const builtItems = await Promise.all(
        subscribers.map(async (landlord) => {
          const [properties, tenants] = await Promise.all([
            getPropertiesByOwner(landlord.id),
            getTenantsByOwner(landlord.id),
          ]);

          const latestProperty = [...properties].sort((left, right) => {
            const leftTime = new Date((left.updatedAt ?? left.createdAt) as string).getTime();
            const rightTime = new Date((right.updatedAt ?? right.createdAt) as string).getTime();
            return rightTime - leftTime;
          })[0];

          const latestTenant = [...tenants].sort((left, right) => {
            const leftTime = new Date((left.updatedAt ?? left.createdAt) as string).getTime();
            const rightTime = new Date((right.updatedAt ?? right.createdAt) as string).getTime();
            return rightTime - leftTime;
          })[0];

          const status = landlord.subscriptionStatus ?? (landlord.isActive ? "active" : "suspended");
          const headline =
            status === "active"
              ? "Approved subscription"
              : status === "pending"
                ? "Awaiting approval"
                : "Subscription suspended";

          const details: string[] = [];

          if (status === "active" && landlord.approvedAt) {
            details.push(`Approved on ${toDisplayDate(landlord.approvedAt)}`);
          }

          if (status === "suspended") {
            details.push(`Reason: ${landlord.suspensionReason || "Account review required"}`);
          }

          if (landlord.lastLoginAt) {
            details.push(`Last login: ${toDisplayDate(landlord.lastLoginAt)}`);
          }

          if (latestProperty) {
            details.push(`Recent property change: ${latestProperty.name}`);
          }

          if (latestTenant) {
            details.push(`Recent tenant change: ${latestTenant.fullName}`);
          }

          if (details.length === 0) {
            details.push("No recent admin activity captured yet");
          }

          return {
            id: landlord.id,
            name: landlord.fullName,
            email: landlord.email,
            headline,
            details,
            updatedAt: toDisplayDate(landlord.updatedAt ?? landlord.createdAt),
          } satisfies ActivityItem;
        })
      );

      setActivityItems(
        builtItems.sort((left, right) => {
          const leftTime = new Date(left.updatedAt).getTime();
          const rightTime = new Date(right.updatedAt).getTime();
          return rightTime - leftTime;
        })
      );
      setLoading(false);
    };

    void loadLandlords();
  }, []);

  const stats = useMemo(() => {
    const activeCount = landlords.filter((landlord) => (landlord.subscriptionStatus ?? (landlord.isActive ? "active" : "suspended")) === "active").length;
    const pendingCount = landlords.filter((landlord) => (landlord.subscriptionStatus ?? (landlord.isActive ? "active" : "suspended")) === "pending").length;
    const suspendedCount = landlords.filter((landlord) => (landlord.subscriptionStatus ?? (landlord.isActive ? "active" : "suspended")) === "suspended").length;

    return [
      { label: "Landlord Accounts", value: landlords.length.toString(), icon: Building2, tone: "text-emerald-600" },
      { label: "Active Subscriptions", value: activeCount.toString(), icon: Users, tone: "text-blue-600" },
      { label: "Pending Review", value: pendingCount.toString(), icon: AlertTriangle, tone: "text-amber-600" },
      { label: "Suspended", value: suspendedCount.toString(), icon: Activity, tone: "text-rose-600" },
    ];
  }, [landlords]);

  const recentLandlordActivity = useMemo(() => activityItems.slice(0, 6), [activityItems]);

  return (
    <AdminLayout>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Track subscription health, approvals, and recent landlord activity."
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <Icon className={stat.tone} size={20} />
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent landlord activity</h2>
              <p className="mt-1 text-sm text-slate-500">Live subscription updates from the landlord accounts on PEMS.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {loading ? "Loading" : `${recentLandlordActivity.length} items`}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Loading subscription activity...
              </div>
            ) : recentLandlordActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No landlord accounts have been registered yet.
              </div>
            ) : (
              recentLandlordActivity.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{item.headline}</span>
                    <p className="mt-2 text-xs text-slate-500">{item.updatedAt}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {item.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-lg font-bold">Subscription snapshot</h2>
          <p className="mt-3 text-sm text-slate-300">
            Review the current health of landlord subscriptions and prioritize accounts needing attention.
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between rounded-xl bg-white/10 p-3">
              <span className="text-slate-300">Active subscriptions</span>
              <strong>{stats[1].value}</strong>
            </div>
            <div className="flex justify-between rounded-xl bg-white/10 p-3">
              <span className="text-slate-300">Pending review</span>
              <strong>{stats[2].value}</strong>
            </div>
            <div className="flex justify-between rounded-xl bg-white/10 p-3">
              <span className="text-slate-300">Suspended</span>
              <strong>{stats[3].value}</strong>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
