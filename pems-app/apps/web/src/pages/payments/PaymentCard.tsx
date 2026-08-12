import type { Payment, Tenant } from "../../../../../packages/models";
import {
  downloadPaymentReceipt,
  getTenantReceiptName,
} from "../../utils/receipt";

interface PaymentCardProps {
  payment: Payment;
  tenant: Tenant | null;
  tenantName: string;
}

export default function PaymentCard({ payment, tenant, tenantName }: PaymentCardProps) {
  const isConfirmed = (payment.paymentStatus || "confirmed") === "confirmed";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-500">
            {payment.paymentPurpose.replaceAll("_", " ")}
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-950">
            GHS {Number(payment.amount).toLocaleString()}
          </h3>

          <p className="mt-2 break-words text-sm text-slate-500">{tenantName}</p>
        </div>

        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-600">
          {isConfirmed ? "Confirmed" : "Pending"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Payment Date</p>
          <h4 className="mt-1 text-sm font-black text-slate-950">
            {payment.paymentDate}
          </h4>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Receipt</p>
          <h4 className="mt-1 break-words text-sm font-black text-slate-950">
            {payment.receiptNumber || "Not issued"}
          </h4>
        </div>
      </div>

      {payment.notes && (
        <p className="mt-4 break-words text-sm text-slate-500">{payment.notes}</p>
      )}

      <button
        type="button"
        disabled={!isConfirmed || !payment.receiptNumber}
        onClick={() =>
          downloadPaymentReceipt({
            payment,
            tenantName: getTenantReceiptName(tenant) || tenantName,
            tenantId: tenant ? undefined : payment.tenantId,
          })
        }
        className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        Download Receipt
      </button>
    </article>
  );
}