import type { Room } from "../../../../../packages/models";

interface RoomCardProps {
  room: Room;
  propertyName: string;
  buildingName: string;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export default function RoomCard({
  room,
  propertyName,
  buildingName,
  onEdit,
  onDelete,
}: RoomCardProps) {
  const statusStyles = {
    occupied: "bg-blue-50 text-blue-600",
    vacant: "bg-emerald-50 text-emerald-600",
    reserved: "bg-amber-50 text-amber-600",
    maintenance: "bg-red-50 text-red-600",
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-amber-500">
            {propertyName}
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Room {room.roomNumber}
          </h3>

          <p className="mt-2 text-sm text-slate-500">{buildingName}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
            statusStyles[room.status]
          }`}
        >
          {room.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Room Type</p>
          <h4 className="mt-1 text-lg font-black capitalize text-slate-950">
            {room.roomType.replaceAll("_", " ")}
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Monthly Rent</p>
          <h4 className="mt-1 text-lg font-black text-slate-950">
            GHS {room.monthlyRent}
          </h4>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
          Assign Tenant
        </button>

        <button
          onClick={() => onEdit(room)}
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-100"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(room)}
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}