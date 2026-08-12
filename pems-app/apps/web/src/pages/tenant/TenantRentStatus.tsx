import { useEffect, useState } from "react";
import TenantLayout from "../../layouts/tenant/TenantLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useTenantPortal } from "../tenants/hooks/useTenantPortal";
import {
  getTenantDisplayId,
  type OnlinePaymentMethod,
  type PaymentRequest,
} from "../../../../../packages/models";
import {
  createPaymentRequest,
  getPaymentRequestsByTenant,
} from "../../../../../packages/firebase";
import { initializePaystackCheckout } from "../../services/onlinePayments";

const supportedMethods: OnlinePaymentMethod[] = [
  "mobile_money",
  "card",
  "bank_transfer",
];

function buildProviderReference(tenantId: string) {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PEMS-PAY-${datePart}-${tenantId.slice(0, 5).toUpperCase()}-${randomPart}`;
}

function formatStatus(status: PaymentRequest["status"]) {
  return status.replaceAll("_", " ");
}

export default function TenantRentStatus() {
  const { firebaseUser } = useAuth();
  const { tenant, expectedRent, outstandingRent, rentReminderSchedule } =
    useTenantPortal(firebaseUser?.uid);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadPaymentRequests() {
    if (!tenant) return;

    const requests = await getPaymentRequestsByTenant(tenant.id);
    setPaymentRequests(requests);
  }

  useEffect(() => {
    loadPaymentRequests();
  }, [tenant?.id]);

  async function handleCreateOnlinePaymentRequest() {
    if (!tenant) {
      setNotice("Your tenant record is not assigned yet.");
      return;
    }

    if (!firebaseUser) {
      setNotice("Sign in again before starting online checkout.");
      return;
    }

    if (outstandingRent <= 0) {
      setNotice("There is no outstanding rent balance to pay online.");
      return;
    }

    setRequestingPayment(true);
    setNotice("");

    try {
      const paymentRequestId = await createPaymentRequest({
        ownerId: tenant.ownerId,
        tenantId: tenant.id,
        tenantUserId: firebaseUser.uid,
        propertyId: tenant.propertyId,
        buildingId: tenant.buildingId,
        roomId: tenant.roomId,
        amount: outstandingRent,
        currency: "GHS",
        provider: "paystack",
        supportedMethods,
        providerReference: buildProviderReference(tenant.id),
        notes: "Initial online payment request. Checkout URL will be attached after provider setup.",
      });

      try {
        const idToken = await firebaseUser?.getIdToken();

        if (!idToken) {
          throw new Error("Sign in again before starting online checkout.");
        }

        const checkoutUrl = await initializePaystackCheckout(paymentRequestId, idToken);
        window.location.assign(checkoutUrl);
        return;
      } catch (checkoutError) {
        const message = checkoutError instanceof Error ? checkoutError.message : "Checkout is not configured yet.";
        setNotice(`Payment request created. ${message}`);
      }

      await loadPaymentRequests();
    } finally {
      setRequestingPayment(false);
    }
  }

  const latestRequest = paymentRequests[0];

  return (
    <TenantLayout>
      <PageHeader
        title="Rent Status"
        subtitle="View your current rent balance, next due date, and room details."
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tenant ID", tenant ? getTenantDisplayId(tenant) : "Not assigned"],
          ["Current Balance", `GHS ${outstandingRent.toLocaleString()}`],
          ["Next Due Date", tenant?.nextRentDueDate || "Not assigned"],
          ["Monthly Rent", `GHS ${Number(expectedRent || 0).toLocaleString()}`],
        ].map(([label, value]) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-500">
            Online Payments
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Mobile Money, Visa, Mastercard and Bank
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This creates a provider-ready payment request without marking your rent as paid until a verified checkout webhook confirms success.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {supportedMethods.map((method) => (
              <span
                key={method}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700"
              >
                {method.replaceAll("_", " ")}
              </span>
            ))}
          </div>

          {notice && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
              {notice}
            </p>
          )}

          <button
            type="button"
            disabled={requestingPayment || !tenant || outstandingRent <= 0}
            onClick={handleCreateOnlinePaymentRequest}
            className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
          >
            {requestingPayment ? "Creating Request..." : "Prepare Online Payment"}
          </button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">Payment Requests</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {paymentRequests.length > 0 ? (
              paymentRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      GHS {Number(request.amount || 0).toLocaleString()}
                    </p>
                    <p className="mt-1 break-words text-xs text-slate-500">
                      {request.providerReference}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                    {formatStatus(request.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No online payment request has been created yet.
              </p>
            )}
          </div>

          {latestRequest?.checkoutUrl && (
            <a
              href={latestRequest.checkoutUrl}
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Continue Checkout
            </a>
          )}
        </article>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Rent Due Notifications
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Reminder dates are calculated from your next rent due date.
        </p>

        <div className="mt-5 divide-y divide-slate-100">
          {rentReminderSchedule.length > 0 ? (
            rentReminderSchedule.map((reminder) => (
              <article
                key={reminder.stage}
                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-slate-950">{reminder.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Scheduled for {reminder.scheduledDate}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Active
                </span>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No rent due date is assigned yet.
            </p>
          )}
        </div>
      </section>
    </TenantLayout>
  );
}
