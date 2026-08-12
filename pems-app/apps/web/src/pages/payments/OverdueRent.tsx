import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getPaymentsByOwner,
  getRoomsByOwner,
  getTenantsByOwner,
} from "../../../../../packages/firebase";
import {
  getTenantDisplayId,
  type Payment,
  type Room,
  type Tenant,
} from "../../../../../packages/models";

function getDaysOverdue(nextRentDueDate?: string) {
  if (!nextRentDueDate) return 0;

  const dueDate = new Date(nextRentDueDate);
  const today = new Date();

  if (Number.isNaN(dueDate.getTime()) || dueDate >= today) return 0;

  return Math.ceil(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function OverdueRent() {
  const { firebaseUser } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverdueRent() {
      if (!firebaseUser) return;

      setLoading(true);

      try {
        const [tenantRecords, paymentRecords, roomRecords] = await Promise.all([
          getTenantsByOwner(firebaseUser.uid),
          getPaymentsByOwner(firebaseUser.uid),
          getRoomsByOwner(firebaseUser.uid),
        ]);

        setTenants(tenantRecords);
        setPayments(paymentRecords);
        setRooms(roomRecords);
      } finally {
        setLoading(false);
      }
    }

    loadOverdueRent();
  }, [firebaseUser]);

  const overdueTenants = useMemo(() => {
    return tenants
      .map((tenant) => {
        const daysOverdue = getDaysOverdue(tenant.nextRentDueDate);
        const rentPaidSinceDueDate = payments
          .filter((payment) => {
            if (payment.tenantId !== tenant.id || payment.paymentPurpose !== "rent") {
              return false;
            }

            if (!tenant.nextRentDueDate) return true;

            return new Date(payment.paymentDate) >= new Date(tenant.nextRentDueDate);
          })
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const balance = Math.max(Number(tenant.monthlyRent || 0) - rentPaidSinceDueDate, 0);
        const room = rooms.find((room) => room.id === tenant.roomId);

        return {
          ...tenant,
          balance,
          daysOverdue,
          roomNumber: room?.roomNumber || "Unknown room",
        };
      })
      .filter((tenant) => tenant.isActive && tenant.daysOverdue > 0 && tenant.balance > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [payments, rooms, tenants]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Overdue Rent"
        subtitle="Review tenants with outstanding balances and prioritize follow-up."
      />

      <section className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Tenant</th>
              <th className="px-5 py-4">Tenant ID</th>
              <th className="px-5 py-4">Room</th>
              <th className="px-5 py-4">Balance</th>
              <th className="px-5 py-4">Overdue</th>
              <th className="px-5 py-4">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {overdueTenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-5 py-4 font-semibold text-slate-950">{tenant.fullName}</td>
                <td className="px-5 py-4 text-slate-600">{getTenantDisplayId(tenant)}</td>
                <td className="px-5 py-4 text-slate-600">{tenant.roomNumber}</td>
                <td className="px-5 py-4 font-bold text-slate-950">
                  GHS {tenant.balance.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {tenant.daysOverdue} days
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Follow up</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && overdueTenants.length === 0 && (
          <div className="border-t border-slate-100 p-8 text-center text-sm text-slate-500">
            No overdue rent found.
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
