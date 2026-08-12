import TenantLayout from "../../layouts/tenant/TenantLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useTenantPortal } from "../tenants/hooks/useTenantPortal";
import {
  downloadPaymentReceipt,
  getTenantReceiptName,
} from "../../utils/receipt";

export default function TenantPaymentHistory() {
  const { firebaseUser } = useAuth();
  const { tenant, payments } = useTenantPortal(firebaseUser?.uid);

  return (
    <TenantLayout>
      <PageHeader
        title="Payment History"
        subtitle="View all rent payments, receipts, and transaction records."
      />

      <section className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Purpose</th>
              <th className="px-5 py-4">Method</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Receipt</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const isConfirmed = (payment.paymentStatus || "confirmed") === "confirmed";

              return (
                <tr key={payment.id}>
                  <td className="px-5 py-4 font-semibold text-slate-950">
                    {payment.paymentDate}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {payment.paymentPurpose.replaceAll("_", " ")}
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">
                    {payment.paymentMethod.replaceAll("_", " ")}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {payment.currency} {Number(payment.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {payment.receiptNumber || "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={!isConfirmed || !payment.receiptNumber}
                      onClick={() =>
                        downloadPaymentReceipt({
                          payment,
                          tenantName: getTenantReceiptName(tenant),
                          tenantId: tenant?.tenantCode,
                        })
                      }
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="border-t border-slate-100 p-8 text-center text-sm text-slate-500">
            No payments have been recorded yet.
          </div>
        )}
      </section>
    </TenantLayout>
  );
}