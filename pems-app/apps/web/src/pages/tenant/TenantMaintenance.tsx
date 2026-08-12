import { useEffect, useState, type FormEvent } from "react";
import TenantLayout from "../../layouts/tenant/TenantLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  createMaintenanceRequest,
  getMaintenanceRequestsByTenant,
} from "../../../../../packages/firebase";
import type { MaintenanceRequest } from "../../../../../packages/models";
import { useTenantPortal } from "../tenants/hooks/useTenantPortal";

export default function TenantMaintenance() {
  const { firebaseUser } = useAuth();
  const { tenant } = useTenantPortal(firebaseUser?.uid);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequests() {
    if (!tenant) return;

    const requestRecords = await getMaintenanceRequestsByTenant(tenant.id);
    setRequests(requestRecords);
  }

  useEffect(() => {
    loadRequests();
  }, [tenant]);

  async function handleCreateRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tenant || !title.trim() || !description.trim()) {
      setMessage("Enter a title and description.");
      return;
    }

    await createMaintenanceRequest({
      ownerId: tenant.ownerId,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      buildingId: tenant.buildingId,
      roomId: tenant.roomId,
      title: title.trim(),
      description: description.trim(),
    });

    setTitle("");
    setDescription("");
    setMessage("Maintenance request submitted.");
    await loadRequests();
  }

  return (
    <TenantLayout>
      <PageHeader
        title="Maintenance Requests"
        subtitle="Submit and track repair or maintenance issues."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleCreateRequest}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-950">New Request</h2>
          {message && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
              {message}
            </p>
          )}
          <div className="mt-4 space-y-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Issue title"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-32 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Describe the issue"
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Submit Request
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Recent Requests</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {requests.map((request) => (
              <article key={request.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-950">{request.title}</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{request.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </TenantLayout>
  );
}
