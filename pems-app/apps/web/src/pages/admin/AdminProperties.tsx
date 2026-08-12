import { useEffect, useMemo, useState } from "react";
import { Building2, Home, Search } from "lucide-react";
import { getAllProperties, getAllUsers } from "../../../../../packages/firebase";
import type { Property, PropertyStatus, User } from "../../../../../packages/models";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/admin/AdminLayout";

type StatusFilter = "all" | PropertyStatus;

const statusLabels: Record<PropertyStatus, string> = {
  active: "Active",
  under_construction: "Under Construction",
  inactive: "Inactive",
  archived: "Archived",
  sold: "Sold",
};

const statusClasses: Record<PropertyStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  under_construction: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-100 text-slate-700",
  archived: "bg-slate-100 text-slate-700",
  sold: "bg-blue-50 text-blue-700",
};

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      const [allProperties, allUsers] = await Promise.all([getAllProperties(), getAllUsers()]);
      setProperties(allProperties);
      setUsers(allUsers);
      setLoading(false);
    };

    void loadProperties();
  }, []);

  const ownerById = useMemo(() => {
    return users.reduce<Record<string, User>>((owners, user) => {
      owners[user.id] = user;
      return owners;
    }, {});
  }, [users]);

  const filteredProperties = useMemo(() => {
    const search = query.trim().toLowerCase();

    return properties.filter((property) => {
      const owner = ownerById[property.ownerId];
      const haystack = `${property.name} ${property.propertyCode} ${property.city} ${property.region || ""} ${
        owner?.fullName || ""
      } ${owner?.email || ""}`.toLowerCase();
      const matchesSearch = search.length === 0 || haystack.includes(search);
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [ownerById, properties, query, statusFilter]);

  const stats = useMemo(() => {
    const active = properties.filter((property) => property.status === "active").length;
    const totalRooms = properties.reduce((sum, property) => sum + (property.totalRooms || 0), 0);
    const totalBuildings = properties.reduce((sum, property) => sum + (property.totalBuildings || 0), 0);

    return [
      ["Registered Properties", properties.length],
      ["Active Properties", active],
      ["Buildings", totalBuildings],
      ["Rooms", totalRooms],
    ];
  }, [properties]);

  return (
    <AdminLayout>
      <PageHeader title="Properties" subtitle="View registered properties across all landlord portfolios." />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px] lg:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Search portfolio</span>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Property, code, city, owner, or email"
                className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm xl:col-span-2">
            Loading registered properties...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm xl:col-span-2">
            No properties match the current filters.
          </div>
        ) : (
          filteredProperties.map((property) => {
            const owner = ownerById[property.ownerId];

            return (
              <article key={property.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="text-emerald-600" size={20} />
                      <h2 className="font-bold text-slate-950">{property.name}</h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {property.address}, {property.city}
                      {property.region ? `, ${property.region}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[property.status]}`}>
                    {statusLabels[property.status]}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase text-slate-400">Code</p>
                    <p className="mt-1 font-semibold text-slate-900">{property.propertyCode || "Not set"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase text-slate-400">Buildings</p>
                    <p className="mt-1 font-semibold text-slate-900">{property.totalBuildings || 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase text-slate-400">Rooms</p>
                    <p className="mt-1 font-semibold text-slate-900">{property.totalRooms || 0}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Home size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{owner?.fullName || "Unknown owner"}</p>
                    <p className="text-xs text-slate-500">{owner?.email || "Owner profile unavailable"}</p>
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
