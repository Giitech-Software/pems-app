import type { Building } from "../../../../../packages/models";

interface BuildingCardProps {
  building: Building;
  propertyName: string;
  onViewRooms: (building: Building) => void;
  onEdit?: (building: Building) => void;
  onDelete?: (building: Building) => void;
}

export default function BuildingCard({
  building,
  propertyName,
  onViewRooms,
  onEdit,
  onDelete,
}: BuildingCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="min-w-0">
        <p className="break-words text-xs font-bold uppercase tracking-wide text-amber-500 sm:text-sm">
          {propertyName}
        </p>

        <h3 className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl">
          {building.name}
        </h3>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Floors</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {building.numberOfFloors || 0}
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Rooms</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {building.totalRooms || 0}
          </h4>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        {onEdit && <button
          type="button"
          onClick={() => onViewRooms(building)}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          View Rooms
        </button>}

        {onDelete && <button
          type="button"
          onClick={() => onEdit?.(building)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>}

        <button
          type="button"
          onClick={() => onDelete?.(building)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
