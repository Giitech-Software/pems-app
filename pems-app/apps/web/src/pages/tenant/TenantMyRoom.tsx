import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import TenantLayout from "../../layouts/tenant/TenantLayout";
import { useAuth } from "../../context/AuthContext";
import { getRoomsByOwner } from "../../../../../packages/firebase";
import { getTenantDisplayId, type Room } from "../../../../../packages/models";
import { useTenantPortal } from "../tenants/hooks/useTenantPortal";

export default function TenantMyRoom() {
  const { firebaseUser } = useAuth();
  const { tenant } = useTenantPortal(firebaseUser?.uid);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    async function loadRoom() {
      if (!tenant) return;

      const rooms = await getRoomsByOwner(tenant.ownerId);
      setRoom(rooms.find((item) => item.id === tenant.roomId) || null);
    }

    loadRoom();
  }, [tenant]);

  return (
    <TenantLayout>
      <PageHeader
        title="My Room"
        subtitle="View assigned room, property information, and occupancy details."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-600">
            Assigned unit
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            {room ? `Room ${room.roomNumber}` : "No room assigned"}
          </h2>
          <p className="mt-2 text-slate-500">
            {tenant ? `Lease started ${tenant.leaseStartDate}` : "Tenant record not found."}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              tenant ? getTenantDisplayId(tenant) : "Tenant ID",
              room?.roomType || "Room type",
              room?.status || "Status",
              `GHS ${Number(room?.monthlyRent || tenant?.monthlyRent || 0).toLocaleString()}`,
            ].map((item) => (
              <div key={item} className="rounded-lg bg-slate-50 p-4 font-bold text-slate-900">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Tenant Details</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-500">Emergency contact</p>
              <p className="font-bold text-slate-950">
                {tenant?.emergencyContactName || "Not provided"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Emergency line</p>
              <p className="font-bold text-slate-950">
                {tenant?.emergencyContactPhone || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </TenantLayout>
  );
}
