import type { FormEvent } from "react";
import type { Property, Building, Room } from "../../../../../packages/models";
import type { TenantFormData } from "./hooks/useTenants";

interface TenantFormProps {
  formData: TenantFormData;
  properties: Property[];
  loading: boolean;
  isEditing: boolean;
  onChange: <K extends keyof TenantFormData>(
    key: K,
    value: TenantFormData[K]
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  getBuildingsForProperty: (propertyId: string) => Building[];
  getAvailableRooms: (buildingId: string) => Room[];
}

export default function TenantForm({
  formData,
  properties,
  loading,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
  getBuildingsForProperty,
  getAvailableRooms,
}: TenantFormProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  const availableBuildings = getBuildingsForProperty(formData.propertyId);
  const availableRooms = getAvailableRooms(formData.buildingId);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-950">
          {isEditing ? "Edit Tenant" : "Add New Tenant"}
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
        >
          <option value="">Select building</option>
          {availableBuildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          value={formData.roomId}
          onChange={(e) => onChange("roomId", e.target.value)}
          required
        >
          <option value="">Select vacant room</option>
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.roomNumber} - GHS {room.monthlyRent}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Full name"
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
        />
<input
  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
  placeholder="Portal user ID optional"
  value={formData.userId}
  onChange={(e) => onChange("userId", e.target.value)}
/>
        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Phone number"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="email"
          placeholder="Email optional"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Ghana Card number"
          value={formData.ghanaCardNumber}
          onChange={(e) => onChange("ghanaCardNumber", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Occupation"
          value={formData.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Emergency contact name"
          value={formData.emergencyContactName}
          onChange={(e) => onChange("emergencyContactName", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Emergency contact phone"
          value={formData.emergencyContactPhone}
          onChange={(e) => onChange("emergencyContactPhone", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="date"
          value={formData.leaseStartDate}
          onChange={(e) => onChange("leaseStartDate", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="date"
          value={formData.leaseEndDate}
          onChange={(e) => onChange("leaseEndDate", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="number"
          min="0"
          placeholder="Monthly rent"
          value={formData.monthlyRent}
          onChange={(e) => onChange("monthlyRent", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="number"
          min="0"
          placeholder="Rent advance months"
          value={formData.rentAdvanceMonths}
          onChange={(e) => onChange("rentAdvanceMonths", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="number"
          min="0"
          placeholder="Security deposit"
          value={formData.securityDeposit}
          onChange={(e) => onChange("securityDeposit", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="date"
          value={formData.nextRentDueDate}
          onChange={(e) => onChange("nextRentDueDate", e.target.value)}
          required
        />
      </div>

      <button
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : isEditing ? "Update Tenant" : "Save Tenant"}
      </button>
    </form>
  );
}
