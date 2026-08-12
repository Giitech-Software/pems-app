import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import PaymentCard from "./PaymentCard";
import PaymentEmptyState from "./PaymentEmptyState";
import PaymentForm from "./PaymentForm";
import { usePayments } from "./hooks/usePayments";
import { getPaymentRequestsByOwner } from "../../../../../packages/firebase";
import type { PaymentRequest } from "../../../../../packages/models";

function formatRequestStatus(status: PaymentRequest["status"]) {
  return status.replaceAll("_", " ");
}

export default function Payments() {
  const { firebaseUser } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  const {
    payments,
    tenants,
    formData,
    showForm,
    loading,
    error,
    updateField,
    startCreate,
    resetForm,
    savePayment,
    getTenantName,
    getTenantById,
  } = usePayments(firebaseUser?.uid);

  const hasTenants = tenants.length > 0;

  useEffect(() => {
    async function loadPaymentRequests() {
      if (!firebaseUser) return;

      const requests = await getPaymentRequestsByOwner(firebaseUser.uid);
      setPaymentRequests(requests);
    }

    loadPaymentRequests();
  }, [firebaseUser]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Payments"
        subtitle="Record rent, deposits, utility bills, and payment history."
      />
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-amber-500">
              Online Payment Requests
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Mobile money, card and bank requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              These are checkout-ready records. They do not become payments until provider verification succeeds.
            </p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {paymentRequests.length} requests
          </span>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {paymentRequests.length > 0 ? (
            paymentRequests.slice(0, 5).map((request) => (
              <article
                key={request.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-950">
                    {getTenantName(request.tenantId)}
                  </p>
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {request.providerReference}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                    {request.provider}
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                    {formatRequestStatus(request.status)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    GHS {Number(request.amount || 0).toLocaleString()}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No online payment requests have been created yet.
            </p>
          )}
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              startCreate();
            }
          }}
          disabled={!hasTenants}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {showForm ? "Close Form" : "Record Manual Payment"}
        </button>
      </div>

      {showForm && (
        <PaymentForm
          formData={formData}
          tenants={tenants}
          loading={loading}
          onChange={updateField}
          onSubmit={savePayment}
          onCancel={resetForm}
        />
      )}

      <section className="mt-8">
        {payments.length === 0 ? (
          <PaymentEmptyState hasTenants={hasTenants} onAdd={startCreate} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                tenant={getTenantById(payment.tenantId)}
                tenantName={getTenantName(payment.tenantId)}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
