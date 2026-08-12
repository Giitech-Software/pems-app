import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import TenantCard from "./TenantCard";
import TenantEmptyState from "./TenantEmptyState";
import TenantForm from "./TenantForm";
import { useTenants } from "./hooks/useTenants";
import {
  approveTenantLinkRequest,
  getTenantLinkRequestsByOwnerEmail,
  rejectTenantLinkRequest,
} from "../../../../../packages/firebase/tenantLinkRequestService";
import {
  getTenantDisplayId,
  type Tenant,
  type TenantLinkRequest,
} from "../../../../../packages/models";

interface AssignTenantLocationState {
  assignRoomId?: string;
}

function TenantProfileDialog({
  tenant,
  propertyName,
  buildingName,
  roomNumber,
  onToggleProfilePermission,
  canManage,
  onClose,
}: {
  tenant: Tenant;
  propertyName: string;
  buildingName: string;
  roomNumber: string;
  onToggleProfilePermission: () => void;
  canManage: boolean;
  onClose: () => void;
}) {
  const detailGroups = [
    ["Tenant ID", getTenantDisplayId(tenant)],
    ["Phone", tenant.phone || "Not provided"],
    ["Email", tenant.email || "Not provided"],
    ["Ghana Card", tenant.ghanaCardNumber || "Not provided"],
    ["Occupation", tenant.occupation || "Not provided"],
    ["Property", propertyName],
    ["Building", buildingName],
    ["Room", roomNumber],
    ["Lease Start", tenant.leaseStartDate || "Not set"],
    ["Lease End", tenant.leaseEndDate || "Not set"],
    ["Monthly Rent", `GHS ${Number(tenant.monthlyRent || 0).toLocaleString()}`],
    ["Rent Advance", `${tenant.rentAdvanceMonths || 0} months`],
    ["Security Deposit", `GHS ${Number(tenant.securityDeposit || 0).toLocaleString()}`],
    ["Next Rent Due", tenant.nextRentDueDate || "Not set"],
    ["Emergency Contact", tenant.emergencyContactName || "Not provided"],
    ["Emergency Phone", tenant.emergencyContactPhone || "Not provided"],
    ["Tenant Updates", tenant.profileUpdateAllowed ? "Allowed" : "Locked"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-500">
              Tenant Profile
            </p>
            <h2 className="mt-1 break-words text-2xl font-black text-slate-950">
              {tenant.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {propertyName} - {buildingName} - Room {roomNumber}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {canManage && <button
              type="button"
              onClick={onToggleProfilePermission}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              {tenant.profileUpdateAllowed ? "Lock Updates" : "Allow Updates"}
            </button>}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {detailGroups.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-2 break-words text-sm font-black text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Tenants() {
  const { firebaseUser, userProfile } = useAuth();
  const canManage = userProfile?.role === "landlord";
  const location = useLocation();
  const navigate = useNavigate();
  const handledAssignRoomId = useRef<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [pendingRequests, setPendingRequests] = useState<TenantLinkRequest[]>([]);
  const [requestNotice, setRequestNotice] = useState("");
  const [requestLoadingId, setRequestLoadingId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const {
    tenants,
    properties,
    rooms,
    formData,
    editingTenant,
    showForm,
    loading,
    error,
    updateField,
    startCreate,
    startCreateForRoom,
    startEdit,
    resetForm,
    saveTenant,
    removeTenant,
    setTenantProfileUpdatePermission,
    getPropertyName,
    getBuildingName,
    getRoomNumber,
    getBuildingsForProperty,
    getAvailableRooms,
  } = useTenants(firebaseUser?.uid);

  const locationState = location.state as AssignTenantLocationState | null;
  const assignRoomId = locationState?.assignRoomId;
  const hasVacantRooms = rooms.some((room) => room.status === "vacant");

  const selectedTenantContext = useMemo(() => {
    if (!selectedTenant) return null;

    return {
      propertyName: getPropertyName(selectedTenant.propertyId),
      buildingName: getBuildingName(selectedTenant.buildingId),
      roomNumber: getRoomNumber(selectedTenant.roomId),
    };
  }, [selectedTenant, properties, rooms]);

  async function loadPendingRequests() {
    if (!firebaseUser?.email) return;

    const requests = await getTenantLinkRequestsByOwnerEmail(firebaseUser.email);
    setPendingRequests(requests);
  }

  useEffect(() => {
    if (canManage) loadPendingRequests();
  }, [firebaseUser?.email, canManage]);

  useEffect(() => {
    if (!showForm) return;

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [showForm, editingTenant]);

  useEffect(() => {
    if (!assignRoomId || handledAssignRoomId.current === assignRoomId) return;

    const room = rooms.find((item) => item.id === assignRoomId);

    if (!room) return;

    if (room.status !== "vacant") {
      setRequestNotice("This room is no longer vacant, so it cannot be assigned.");
      handledAssignRoomId.current = assignRoomId;
      navigate("/tenants", { replace: true, state: null });
      return;
    }

    startCreateForRoom(room);
    setRequestNotice(`Assigning tenant to Room ${room.roomNumber}.`);
    handledAssignRoomId.current = assignRoomId;
    navigate("/tenants", { replace: true, state: null });
  }, [assignRoomId, navigate, rooms, startCreateForRoom]);

  async function handleToggleProfilePermission(tenant: Tenant) {
    const nextValue = !tenant.profileUpdateAllowed;
    await setTenantProfileUpdatePermission(tenant, nextValue);
    setSelectedTenant({ ...tenant, profileUpdateAllowed: nextValue });
    setRequestNotice(
      nextValue
        ? `${tenant.fullName} can now update their tenant profile.`
        : `${tenant.fullName}'s profile updates are now locked.`
    );
  }

  async function handleApproveRequest(request: TenantLinkRequest) {
    if (!firebaseUser?.uid) return;

    setRequestLoadingId(request.id);
    setRequestNotice("");

    try {
      await approveTenantLinkRequest(request.id, firebaseUser.uid, request);
      setRequestNotice(`${request.fullName} has been linked to your account.`);
      await loadPendingRequests();
    } catch {
      setRequestNotice("Could not approve this request right now.");
    } finally {
      setRequestLoadingId(null);
    }
  }

  async function handleRejectRequest(request: TenantLinkRequest) {
    setRequestLoadingId(request.id);
    setRequestNotice("");

    try {
      await rejectTenantLinkRequest(request.id);
      setRequestNotice(`${request.fullName}'s request was declined.`);
      await loadPendingRequests();
    } catch {
      setRequestNotice("Could not reject this request right now.");
    } finally {
      setRequestLoadingId(null);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Tenants"
        subtitle="Manage tenant records, rent status, and room assignments."
      />
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      {requestNotice && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {requestNotice}
        </div>
      )}

      {canManage && pendingRequests.length > 0 && (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Pending tenant signups
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Approve tenant accounts that requested access through your email.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-words font-black text-slate-950">
                    {request.fullName}
                  </p>
                  <p className="break-words text-sm text-slate-500">
                    {request.email || request.phone}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => handleApproveRequest(request)}
                    disabled={requestLoadingId === request.id}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {requestLoadingId === request.id ? "Working..." : "Approve"}
                  </button>

                  <button
                    onClick={() => handleRejectRequest(request)}
                    disabled={requestLoadingId === request.id}
                    className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-300 disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {canManage && <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              startCreate();
            }
          }}
          disabled={!hasVacantRooms && !editingTenant}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {showForm ? "Close Form" : "Add Tenant"}
        </button>
      </div>}

      {canManage && showForm && (
        <div ref={formRef}>
          <TenantForm
            formData={formData}
            properties={properties}
            loading={loading}
            isEditing={!!editingTenant}
            onChange={updateField}
            onSubmit={saveTenant}
            onCancel={resetForm}
            getBuildingsForProperty={getBuildingsForProperty}
            getAvailableRooms={getAvailableRooms}
          />
        </div>
      )}

      <section className="mt-8">
        {tenants.length === 0 ? (
          <TenantEmptyState hasVacantRooms={hasVacantRooms} onAdd={canManage ? startCreate : undefined} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                propertyName={getPropertyName(tenant.propertyId)}
                buildingName={getBuildingName(tenant.buildingId)}
                roomNumber={getRoomNumber(tenant.roomId)}
                onViewProfile={setSelectedTenant}
                onEdit={canManage ? startEdit : undefined}
                onDelete={canManage ? removeTenant : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {selectedTenant && selectedTenantContext && (
        <TenantProfileDialog
          tenant={selectedTenant}
          propertyName={selectedTenantContext.propertyName}
          buildingName={selectedTenantContext.buildingName}
          roomNumber={selectedTenantContext.roomNumber}
          onToggleProfilePermission={() => handleToggleProfilePermission(selectedTenant)}
          canManage={canManage}
          onClose={() => setSelectedTenant(null)}
        />
      )}
    </DashboardLayout>
  );
}
