import { getTenantDisplayId, type Tenant } from "../../../../../packages/models";

interface TenantCardProps {
  tenant: Tenant;
  propertyName: string;
  buildingName: string;
  roomNumber: string;
  onViewProfile: (tenant: Tenant) => void;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export default function TenantCard({
  tenant,
  propertyName,
  buildingName,
  roomNumber,
  onViewProfile,
  onEdit,
  onDelete,
}: TenantCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-xs font-bold uppercase tracking-wide text-amber-500 sm:text-sm">
            {getTenantDisplayId(tenant)} - {propertyName}
          </p>

          <h3 className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl">
            {tenant.fullName}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {buildingName} - Room {roomNumber}
          </p>
        </div>

        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          {tenant.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Phone</p>
          <h4 className="mt-1 break-words text-sm font-black text-slate-950">
            {tenant.phone || "Not provided"}
          </h4>
        </div>

        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Monthly Rent</p>
          <h4 className="mt-1 text-sm font-black text-slate-950">
            GHS {Number(tenant.monthlyRent || 0).toLocaleString()}
          </h4>
        </div>

        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Lease Start</p>
          <h4 className="mt-1 break-words text-sm font-black text-slate-950">
            {tenant.leaseStartDate || "Not set"}
          </h4>
        </div>

        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Next Rent Due</p>
          <h4 className="mt-1 break-words text-sm font-black text-red-600">
            {tenant.nextRentDueDate || "Not set"}
          </h4>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        {onEdit && <button
          type="button"
          onClick={() => onViewProfile(tenant)}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          View Profile
        </button>}

        {onDelete && <button
          type="button"
          onClick={() => onEdit?.(tenant)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>}

        <button
          type="button"
          onClick={() => onDelete?.(tenant)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
