import type { FormEvent } from "react";
import type { PropertyType } from "../../../../../packages/models";
import type { PropertyFormData } from "./hooks/useProperties";

interface PropertyFormProps {
  formData: PropertyFormData;
  loading: boolean;
  isEditing: boolean;
  onChange: <K extends keyof PropertyFormData>(
    key: K,
    value: PropertyFormData[K]
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const propertyTypes: PropertyType[] = [
  "apartment",
  "hostel",
  "chamber_and_hall",
  "single_room",
  "self_contained",
  "commercial",
  "mixed_use",
  "compound_house",
  "other",
];
const propertyStatuses = [
  "active",
  "under_construction",
  "inactive",
  "archived",
  "sold",
] as const;

export default function PropertyForm({
  formData,
  loading,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}: PropertyFormProps) {
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
          {isEditing ? "Edit Property" : "Add New Property"}
        </h2>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>

<input
  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
  placeholder="Property code, e.g. PEMS-001"
  value={formData.propertyCode}
  onChange={(e) => onChange("propertyCode", e.target.value)}
  required
/>

<select
  className="rounded-xl border border-slate-200 px-4 py-3 capitalize outline-none focus:border-blue-600"
  value={formData.status}
  onChange={(e) => onChange("status", e.target.value as any)}
>
  {propertyStatuses.map((status) => (
    <option key={status} value={status}>
      {status.replaceAll("_", " ")}
    </option>
  ))}
</select>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Property name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 capitalize outline-none focus:border-blue-600"
          value={formData.propertyType}
          onChange={(e) =>
            onChange("propertyType", e.target.value as PropertyType)
          }
        >
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Area, e.g. Adenta"
          value={formData.area}
          onChange={(e) => onChange("area", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="City"
          value={formData.city}
          onChange={(e) => onChange("city", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Region"
          value={formData.region}
          onChange={(e) => onChange("region", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Country"
          value={formData.country}
          onChange={(e) => onChange("country", e.target.value)}
          required
        />
<input
  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
  placeholder="Latitude optional"
  value={formData.latitude}
  onChange={(e) => onChange("latitude", e.target.value)}
/>

<input
  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
  placeholder="Longitude optional"
  value={formData.longitude}
  onChange={(e) => onChange("longitude", e.target.value)}
/>
        <textarea
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600 md:col-span-2"
          placeholder="Short description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
        />
      </div>

      <button
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : isEditing ? "Update Property" : "Save Property"}
      </button>
    </form>
  );
}