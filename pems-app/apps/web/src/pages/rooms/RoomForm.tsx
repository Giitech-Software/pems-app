import type { FormEvent } from "react";
import type {
  Building,
  Property,
  RoomStatus,
} from "../../../../../packages/models";
import type { RoomFormData } from "./hooks/useRooms";

interface RoomFormProps {
  formData: RoomFormData;
  properties: Property[];
  buildings: Building[];
  loading: boolean;
  isEditing: boolean;
  onChange: <K extends keyof RoomFormData>(
    key: K,
    value: RoomFormData[K]
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  getBuildingsForProperty: (propertyId: string) => Building[];
}

const roomTypes = ["single", "double", "shop", "office", "apartment", "other"] as const;

const roomStatuses: RoomStatus[] = [
  "occupied",
  "vacant",
  "reserved",
  "maintenance",
];

export default function RoomForm({
  formData,
  properties,
  loading,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
  getBuildingsForProperty,
}: RoomFormProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  const availableBuildings = getBuildingsForProperty(formData.propertyId);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-950">
          {isEditing ? "Edit Room" : "Add New Room"}
        </h2>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <select
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          value={formData.propertyId}
          onChange={(e) => onChange("propertyId", e.target.value)}
          required
          disabled={isEditing}
        >
          <option value="">Select property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          value={formData.buildingId}
          onChange={(e) => onChange("buildingId", e.target.value)}
          required
          disabled={isEditing}
        >
          <option value="">Select building</option>
          {availableBuildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Room number, e.g. A101"
          value={formData.roomNumber}
          onChange={(e) => onChange("roomNumber", e.target.value)}
          required
        />

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 capitalize outline-none focus:border-blue-600"
          value={formData.roomType}
          onChange={(e) => onChange("roomType", e.target.value as RoomFormData["roomType"])}
        >
          {roomTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="number"
          min="0"
          placeholder="Monthly rent, e.g. 800"
          value={formData.monthlyRent}
          onChange={(e) => onChange("monthlyRent", e.target.value)}
          required
        />

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 capitalize outline-none focus:border-blue-600"
          value={formData.status}
          onChange={(e) => onChange("status", e.target.value as RoomStatus)}
        >
          {roomStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <button
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : isEditing ? "Update Room" : "Save Room"}
      </button>
    </form>
  );
}