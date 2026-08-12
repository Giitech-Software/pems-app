import type { FormEvent } from "react";
import {
  getTenantDisplayId,
  type PaymentMethod,
  type PaymentPurpose,
  type Tenant,
} from "../../../../../packages/models";
import type { PaymentFormData } from "./hooks/usePayments";

interface PaymentFormProps {
  formData: PaymentFormData;
  tenants: Tenant[];
  loading: boolean;
  onChange: <K extends keyof PaymentFormData>(
    key: K,
    value: PaymentFormData[K]
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const paymentPurposes: PaymentPurpose[] = [
  "rent",
  "security_deposit",
  "utility_bill",
  "maintenance_fee",
  "other",
];

const paymentMethods: PaymentMethod[] = [
  "cash",
  "momo",
  "bank_transfer",
  "card",
  "cheque",
];

export default function PaymentForm({
  formData,
  tenants,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
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
        <h2 className="text-xl font-black text-slate-950">Record Payment</h2>

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
          value={formData.tenantId}
          onChange={(e) => onChange("tenantId", e.target.value)}
          required
        >
          <option value="">Select tenant</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {getTenantDisplayId(tenant)} - {tenant.fullName} - GHS{" "}
              {tenant.monthlyRent}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="number"
          min="0"
          placeholder="Amount paid"
          value={formData.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          required
        />

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 capitalize outline-none focus:border-blue-600"
          value={formData.paymentPurpose}
          onChange={(e) =>
            onChange("paymentPurpose", e.target.value as PaymentPurpose)
          }
        >
          {paymentPurposes.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 px-4 py-3 capitalize outline-none focus:border-blue-600"
          value={formData.paymentMethod}
          onChange={(e) =>
            onChange("paymentMethod", e.target.value as PaymentMethod)
          }
        >
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => onChange("paymentDate", e.target.value)}
          required
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="date"
          value={formData.periodCoveredFrom}
          onChange={(e) => onChange("periodCoveredFrom", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          type="date"
          value={formData.periodCoveredTo}
          onChange={(e) => onChange("periodCoveredTo", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Reference number optional"
          value={formData.referenceNumber}
          onChange={(e) => onChange("referenceNumber", e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
          placeholder="Receipt number optional"
          value={formData.receiptNumber}
          onChange={(e) => onChange("receiptNumber", e.target.value)}
        />

        <textarea
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600 md:col-span-2"
          placeholder="Notes optional"
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
        />
      </div>

      <button
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Payment"}
      </button>
    </form>
  );
}
