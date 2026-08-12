import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "../../components/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  createNotification,
  getNotificationsByOwner,
  getTenantsByOwner,
  getFriendlyDataError,
} from "../../../../../packages/firebase";
import {
  getTenantDisplayId,
  RENT_DUE_REMINDER_SCHEDULE,
  type Notification,
  type Tenant,
} from "../../../../../packages/models";

export default function Notifications() {
  const { firebaseUser, userProfile } = useAuth();
  const canManage = userProfile?.role === "landlord";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadNotifications() {
    if (!firebaseUser) return;

    const [notificationRecords, tenantRecords] = await Promise.all([
      getNotificationsByOwner(firebaseUser.uid),
      getTenantsByOwner(firebaseUser.uid),
    ]);

    setNotifications(notificationRecords);
    setTenants(tenantRecords);
  }

  useEffect(() => {
    loadNotifications();
  }, [firebaseUser]);

  async function handleCreateNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !title.trim() || !message.trim()) {
      setNotice("Enter a title and message.");
      return;
    }

    const recipients =
      tenantId === "all"
        ? tenants
        : tenants.filter((tenant) => tenant.id === tenantId);

    if (recipients.length === 0) {
      setNotice("Select at least one tenant.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      await Promise.all(
        recipients.map((tenant) =>
          createNotification({
            ownerId: firebaseUser.uid,
            tenantId: tenant.id,
            userId: tenant.userId || tenant.id,
            title: title.trim(),
            message: message.trim(),
            type: "system",
          })
        )
      );

      setTitle("");
      setMessage("");
      setTenantId("all");
      setNotice("Notice sent.");
      await loadNotifications();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not send this notice."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        subtitle="Manage rent due reminders, payment confirmations, messages, and tenant alerts."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {canManage && <form
          onSubmit={handleCreateNotice}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-950">Create Notice</h2>

          {notice && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
              {notice}
            </p>
          )}

          <div className="mt-5 space-y-4">
            <select
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="all">All tenants</option>
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
              placeholder="Notice title"
            />

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-32 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Message to tenant"
            />

            <button
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Sending..." : "Send Notice"}
            </button>
          </div>
        </form>}

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Rent Due Reminder Schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Automated notifications are prepared for each tenant based on their next rent due date.
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
                      ? "Sent on the tenant rent due date."
                      : `Sent ${reminder.daysBeforeDue} days before rent is due.`}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Active
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Notification Activity
        </h2>

        <div className="mt-5 divide-y divide-slate-100">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-950">{notification.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
              </div>
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {notification.isRead ? "Read" : "Unread"}
              </span>
            </article>
          ))}
        </div>

        {notifications.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No notifications have been sent yet.
          </p>
        )}
      </section>
    </DashboardLayout>
  );
}
