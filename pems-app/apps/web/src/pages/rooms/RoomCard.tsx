import type { Room } from "../../../../../packages/models";

interface RoomCardProps {
  room: Room;
  propertyName: string;
  buildingName: string;
  onAssignTenant: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export default function RoomCard({
  room,
  propertyName,
  buildingName,
  onAssignTenant,
  onEdit,
  onDelete,
}: RoomCardProps) {
  const statusStyles = {
    occupied: "bg-blue-50 text-blue-600",
    vacant: "bg-emerald-50 text-emerald-600",
    reserved: "bg-amber-50 text-amber-600",
    maintenance: "bg-red-50 text-red-600",
  };

  const canAssignTenant = room.status === "vacant";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-xs font-bold uppercase tracking-wide text-amber-500 sm:text-sm">
            {propertyName}
          </p>

          <h3 className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl">
            Room {room.roomNumber}
          </h3>

          <p className="mt-2 text-sm text-slate-500">{buildingName}</p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${
            statusStyles[room.status]
          }`}
        >
          {room.status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Room Type</p>
          <h4 className="mt-1 break-words text-lg font-black capitalize text-slate-950">
            {room.roomType.replaceAll("_", " ")}
          </h4>
        </div>

        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Monthly Rent</p>
          <h4 className="mt-1 text-lg font-black text-slate-950">
            GHS {Number(room.monthlyRent || 0).toLocaleString()}
          </h4>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <button
          type="button"
          onClick={() => onAssignTenant(room)}
          disabled={!canAssignTenant}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {canAssignTenant ? "Assign Tenant" : "Assigned"}
        </button>

        <button
          type="button"
          onClick={() => onEdit(room)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(room)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}