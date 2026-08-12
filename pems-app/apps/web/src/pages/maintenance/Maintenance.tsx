import { useEffect, useMemo, useState, type FormEvent } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  createMaintenanceRequest,
  getMaintenanceRequestsByOwner,
  getTenantsByOwner,
  updateMaintenanceRequestStatus,
  getFriendlyDataError,
} from "../../../../../packages/firebase";
import {
  getTenantDisplayId,
  type MaintenanceRequest,
  type MaintenanceStatus,
  type Tenant,
} from "../../../../../packages/models";

const statusLabels: Record<MaintenanceStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Maintenance() {
  const { firebaseUser, userProfile } = useAuth();
  const canManage = userProfile?.role === "landlord";
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMaintenance() {
    if (!firebaseUser) return;

    const [requestRecords, tenantRecords] = await Promise.all([
      getMaintenanceRequestsByOwner(firebaseUser.uid),
      getTenantsByOwner(firebaseUser.uid),
    ]);

    setRequests(requestRecords);
    setTenants(tenantRecords);
    setTenantId((currentTenantId) => currentTenantId || tenantRecords[0]?.id || "");
  }

  useEffect(() => {
    loadMaintenance();
  }, [firebaseUser]);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === tenantId),
    [tenantId, tenants]
  );

  async function handleCreateRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !selectedTenant || !title.trim() || !description.trim()) {
      setMessage("Select a tenant and enter the maintenance details.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await createMaintenanceRequest({
        ownerId: firebaseUser.uid,
        tenantId: selectedTenant.id,
        propertyId: selectedTenant.propertyId,
        buildingId: selectedTenant.buildingId,
        roomId: selectedTenant.roomId,
        title: title.trim(),
        description: description.trim(),
      });

      setTitle("");
      setDescription("");
      setMessage("Maintenance request created.");
      await loadMaintenance();
    } catch (error) {
      setMessage(getFriendlyDataError(error, "Could not create the maintenance request."));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    requestId: string,
    status: MaintenanceStatus
  ) {
    try {
      await updateMaintenanceRequestStatus(requestId, status);
      await loadMaintenance();
    } catch (error) {
      setMessage(getFriendlyDataError(error, "Could not update the maintenance request."));
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Maintenance"
        subtitle="Track tenant complaints, repairs, and maintenance progress."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
        {canManage && <form
          onSubmit={handleCreateRequest}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-950">Add Request</h2>

          {message && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
              {message}
            </p>
          )}

          <div className="mt-5 space-y-4">
            <select
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {getTenantDisplayId(tenant)} - {tenant.fullName}
                </option>
              ))}
            </select>

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

            <button
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Request"}
            </button>
          </div>
        </form>}

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Requests</h2>

          <div className="mt-4 divide-y divide-slate-100">
            {requests.map((request) => {
              const tenant = tenants.find((item) => item.id === request.tenantId);

              return (
                <article key={request.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">{request.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {tenant
                          ? `${getTenantDisplayId(tenant)} - ${tenant.fullName}`
                          : "Tenant"}{" "}
                        - {request.description}
                      </p>
                    </div>

                    <select
                      value={request.status}
                      onChange={(event) =>
                        handleStatusChange(
                          request.id,
                          event.target.value as MaintenanceStatus
                        )
                      }
                      className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-600"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>

          {requests.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              No maintenance requests have been created yet.
            </p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
