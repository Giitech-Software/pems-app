import type { Building } from "../../../../../packages/models";

interface BuildingCardProps {
  building: Building;
  propertyName: string;
  onEdit: (building: Building) => void;
  onDelete: (building: Building) => void;
}

export default function BuildingCard({
  building,
  propertyName,
  onEdit,
  onDelete,
}: BuildingCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-amber-500">
        {propertyName}
      </p>

      <h3 className="mt-2 text-2xl font-black text-slate-950">
        {building.name}
      </h3>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Floors</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {building.numberOfFloors}
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Rooms</p>
          <h4 className="mt-1 text-xl font-black text-slate-950">
            {building.totalRooms || 0}
          </h4>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
          View Rooms
        </button>

        <button
          onClick={() => onEdit(building)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(building)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}