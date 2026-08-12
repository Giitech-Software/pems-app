import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import TenantLayout from "../../layouts/tenant/TenantLayout";
import {
  RENT_DUE_REMINDER_SCHEDULE,
  type Notification,
} from "../../../../../packages/models";
import {
  getNotificationsByUser,
  markNotificationAsRead,
} from "../../../../../packages/firebase";
import { useAuth } from "../../context/AuthContext";

export default function TenantNotifications() {
  const { firebaseUser } = useAuth();
  const [alerts, setAlerts] = useState<Notification[]>([]);

  async function loadAlerts() {
    if (!firebaseUser) return;

    const notificationRecords = await getNotificationsByUser(firebaseUser.uid);
    setAlerts(notificationRecords);
  }

  useEffect(() => {
    loadAlerts();
  }, [firebaseUser]);

  async function handleMarkRead(notificationId: string) {
    await markNotificationAsRead(notificationId);
    await loadAlerts();
  }

  return (
    <TenantLayout>
      <PageHeader
        title="Notifications"
        subtitle="Review rent due reminders, payment confirmations, landlord messages, and maintenance updates."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Rent Due Reminder Timeline
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            You will receive reminders before rent is due and on the due day.
          </p>

          <div className="mt-5 divide-y divide-slate-100">
            {RENT_DUE_REMINDER_SCHEDULE.map((reminder) => (
              <article
                key={reminder.stage}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-bold text-slate-950">{reminder.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {reminder.daysBeforeDue === 0
                      ? "Notification arrives on due day."
                      : `${reminder.daysBeforeDue} days before your rent is due.`}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Active
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Recent Alerts</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-950">{alert.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
                </div>
                <button
                  onClick={() => handleMarkRead(alert.id)}
                  className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
                >
                  {alert.isRead ? "Read" : "Mark read"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </TenantLayout>
  );
}
