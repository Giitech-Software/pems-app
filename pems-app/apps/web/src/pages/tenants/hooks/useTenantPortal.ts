import { useEffect, useState } from "react";
import {
  getPaymentsByTenant,
  getTenantByUserId,
} from "../../../../../../packages/firebase";
import {
  RENT_DUE_REMINDER_SCHEDULE,
  type Payment,
  type RentDueReminderStage,
  type Tenant,
} from "../../../../../../packages/models";

export interface TenantRentReminder {
  stage: RentDueReminderStage;
  label: string;
  scheduledDate: string;
  daysBeforeDue: number;
}

function getRentReminderSchedule(nextRentDueDate?: string): TenantRentReminder[] {
  if (!nextRentDueDate) return [];

  const dueDate = new Date(nextRentDueDate);

  if (Number.isNaN(dueDate.getTime())) return [];

  return RENT_DUE_REMINDER_SCHEDULE.map((reminder) => {
    const scheduledDate = new Date(dueDate);
    scheduledDate.setDate(dueDate.getDate() - reminder.daysBeforeDue);

    return {
      ...reminder,
      scheduledDate: scheduledDate.toISOString().slice(0, 10),
    };
  });
}

export function useTenantPortal(userId?: string) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTenantPortal() {
    if (!userId) return;

    setLoading(true);

    try {
      const tenantRecord = await getTenantByUserId(userId);
      setTenant(tenantRecord);

      if (tenantRecord) {
        const tenantPayments = await getPaymentsByTenant(tenantRecord.id);
        setPayments(tenantPayments);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenantPortal();
  }, [userId]);

  const totalPaid = payments
    .filter((payment) => payment.paymentPurpose === "rent")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const expectedRent = tenant?.monthlyRent || 0;

  const outstandingRent = Math.max(expectedRent - totalPaid, 0);
  const rentReminderSchedule = getRentReminderSchedule(tenant?.nextRentDueDate);

  return {
    tenant,
    payments,
    loading,
    totalPaid,
    expectedRent,
    outstandingRent,
    rentReminderSchedule,
    reload: loadTenantPortal,
  };
}
