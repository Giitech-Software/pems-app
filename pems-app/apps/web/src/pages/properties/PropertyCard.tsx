import type { Property } from "../../../../../packages/models";

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}

export default function PropertyCard({
  property,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
         <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-600">
  {property.status?.replaceAll("_", " ") || "active"}
</span>

          <h3 className="mt-2 text-2xl font-black text-slate-950">
            {property.name}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {property.area ? `${property.area}, ` : ""}
            {property.city}, {property.country}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          Active
        </span>
      </div>

      {property.description && (
        <p className="mt-4 text-sm text-slate-500">{property.description}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Buildings</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {property.totalBuildings}
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Rooms</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {property.totalRooms}
          </h4>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
          View Details
        </button>

        <button
          onClick={() => onEdit(property)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(property.id)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}