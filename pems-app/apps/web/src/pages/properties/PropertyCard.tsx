import type { Property } from "../../../../../packages/models";

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (propertyId: string) => void;
}

export default function PropertyCard({
  property,
  onViewDetails,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-600">
            {property.status?.replaceAll("_", " ") || "active"}
          </span>

          <h3 className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl">
            {property.name}
          </h3>

          <p className="mt-2 break-words text-sm text-slate-500">
            {property.area ? `${property.area}, ` : ""}
            {property.city}, {property.country}
          </p>
        </div>
      </div>

      {property.description && (
        <p className="mt-4 break-words text-sm text-slate-500">{property.description}</p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Buildings</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {property.totalBuildings || 0}
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Rooms</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {property.totalRooms || 0}
          </h4>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        {onEdit && <button
          type="button"
          onClick={() => onViewDetails(property)}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          View Details
        </button>}

        {onDelete && <button
          type="button"
          onClick={() => onEdit?.(property)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>}

        <button
          type="button"
          onClick={() => onDelete?.(property.id)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
