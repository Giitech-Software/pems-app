import type { FormEvent } from "react";
import type { Property } from "../../../../../packages/models";
import type { BuildingFormData } from "./hooks/useBuildings";

interface BuildingFormProps {
  formData: BuildingFormData;
  properties: Property[];
  loading: boolean;
  isEditing: boolean;
  onChange: <K extends keyof BuildingFormData>(
    key: K,
    value: BuildingFormData[K]
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export default function BuildingForm({
  formData,
  properties,
  loading,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}: BuildingFormProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-950">
          {isEditing ? "Edit Building" : "Add New Building"}
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

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Building name, e.g. Block A"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="number"
          min="1"
          placeholder="Number of floors"
          value={formData.numberOfFloors}
          onChange={(e) => onChange("numberOfFloors", e.target.value)}
          required
        />
      </div>

      <button
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : isEditing ? "Update Building" : "Save Building"}
      </button>
    </form>
  );
}