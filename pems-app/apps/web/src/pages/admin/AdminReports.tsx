import { useEffect, useMemo, useState } from "react";
import { Banknote, Building2, ClipboardList, TrendingUp, Users } from "lucide-react";
import {
  getAllMaintenanceRequests,
  getAllPayments,
  getAllProperties,
  getAllTenants,
  getAllUsers,
} from "../../../../../packages/firebase";
import type { MaintenanceRequest, Payment, Property, Tenant, User } from "../../../../../packages/models";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/admin/AdminLayout";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

function getDateValue(value: unknown) {
  if (!value) {
    return 0;
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "object" && value !== null) {
    const timestamp = value as {
      toMillis?: unknown;
      toDate?: unknown;
      seconds?: unknown;
      nanoseconds?: unknown;
    };

    if (typeof timestamp.toMillis === "function") {
      const milliseconds = (timestamp.toMillis as () => number)();
      return Number.isFinite(milliseconds) ? milliseconds : 0;
    }

    if (typeof timestamp.toDate === "function") {
      const date = (timestamp.toDate as () => Date)();
      return date instanceof Date ? date.getTime() : 0;
    }

    if (typeof timestamp.seconds === "number") {
      const nanoseconds = typeof timestamp.nanoseconds === "number" ? timestamp.nanoseconds : 0;
      return timestamp.seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
    }
  }

  return 0;
}

export default function AdminReports() {
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportNow] = useState(() => Date.now());

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      const [allUsers, allProperties, allTenants, allPayments, allMaintenanceRequests] = await Promise.all([
        getAllUsers(),
        getAllProperties(),
        getAllTenants(),
        getAllPayments(),
        getAllMaintenanceRequests(),
      ]);

      setUsers(allUsers);
      setProperties(allProperties);
      setTenants(allTenants);
      setPayments(allPayments);
      setMaintenanceRequests(allMaintenanceRequests);
      setLoading(false);
    };

    void loadReports();
  }, []);

  const reports = useMemo(() => {
    const now = reportNow;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const newUsers = users.filter((user) => getDateValue(user.createdAt) >= thirtyDaysAgo).length;
    const activeTenants = tenants.filter((tenant) => tenant.isActive).length;
    const totalRooms = properties.reduce((sum, property) => sum + (property.totalRooms || 0), 0);
    const rentCollected = payments
      .filter((payment) => payment.paymentPurpose === "rent")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const pendingMaintenance = maintenanceRequests.filter((request) => request.status === "pending").length;
    const completedMaintenance = maintenanceRequests.filter((request) => request.status === "completed").length;
    const occupancyRate = totalRooms > 0 ? Math.round((activeTenants / totalRooms) * 100) : 0;
    const maintenanceCompletionRate =
      maintenanceRequests.length > 0 ? Math.round((completedMaintenance / maintenanceRequests.length) * 100) : 0;

    return [
      {
        title: "User growth",
        value: users.length.toString(),
        detail: `${newUsers} new users in the last 30 days`,
        icon: Users,
        progress: users.length > 0 ? Math.min(100, Math.round((newUsers / users.length) * 100)) : 0,
      },
      {
        title: "Portfolio occupancy",
        value: `${occupancyRate}%`,
        detail: `${activeTenants} active tenants across ${totalRooms} rooms`,
        icon: Building2,
        progress: occupancyRate,
      },
      {
        title: "Rent collection",
        value: currencyFormatter.format(rentCollected),
        detail: `${payments.length} payment records captured`,
        icon: Banknote,
        progress: payments.length > 0 ? 72 : 0,
      },
      {
        title: "Maintenance volume",
        value: maintenanceRequests.length.toString(),
        detail: `${pendingMaintenance} pending, ${completedMaintenance} completed`,
        icon: ClipboardList,
        progress: maintenanceCompletionRate,
      },
    ];
  }, [maintenanceRequests, payments, properties, tenants, users]);

  const landlordLeaderboard = useMemo(() => {
    const landlords = users.filter((user) => user.role === "landlord");

    return landlords
      .map((landlord) => {
        const ownerProperties = properties.filter((property) => property.ownerId === landlord.id);
        const ownerTenants = tenants.filter((tenant) => tenant.ownerId === landlord.id);
        const ownerPayments = payments.filter((payment) => payment.ownerId === landlord.id);
        const collected = ownerPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

        return {
          id: landlord.id,
          name: landlord.fullName,
          email: landlord.email,
          properties: ownerProperties.length,
          tenants: ownerTenants.length,
          collected,
        };
      })
      .sort((left, right) => right.collected - left.collected)
      .slice(0, 6);
  }, [payments, properties, tenants, users]);

  return (
    <AdminLayout>
      <PageHeader title="Reports" subtitle="Review system-wide operating metrics from live platform records." />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <article key={report.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-wide text-amber-600">{report.title}</p>
                <Icon className="text-slate-500" size={20} />
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{loading ? "..." : report.value}</p>
              <p className="mt-2 text-sm text-slate-500">{report.detail}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${report.progress}%` }} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-emerald-600" size={22} />
            <div>
              <h2 className="text-lg font-bold text-slate-950">Top landlord portfolios</h2>
              <p className="text-sm text-slate-500">Ranked by captured payment value.</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Landlord</th>
                  <th className="px-4 py-3">Properties</th>
                  <th className="px-4 py-3">Tenants</th>
                  <th className="px-4 py-3 text-right">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={4}>
                      Loading report data...
                    </td>
                  </tr>
                ) : landlordLeaderboard.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={4}>
                      No landlord activity has been captured yet.
                    </td>
                  </tr>
                ) : (
                  landlordLeaderboard.map((landlord) => (
                    <tr key={landlord.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">{landlord.name}</p>
                        <p className="text-xs text-slate-500">{landlord.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{landlord.properties}</td>
                      <td className="px-4 py-3 text-slate-600">{landlord.tenants}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-950">
                        {currencyFormatter.format(landlord.collected)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-lg font-bold">Operating snapshot</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between rounded-xl bg-white/10 p-3">
              <span className="text-slate-300">Active properties</span>
              <strong>{properties.filter((property) => property.status === "active").length}</strong>
            </div>
            <div className="flex justify-between rounded-xl bg-white/10 p-3">
              <span className="text-slate-300">Active tenants</span>
              <strong>{tenants.filter((tenant) => tenant.isActive).length}</strong>
            </div>
            <div className="flex justify-between rounded-xl bg-white/10 p-3">
              <span className="text-slate-300">Pending maintenance</span>
              <strong>{maintenanceRequests.filter((request) => request.status === "pending").length}</strong>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
