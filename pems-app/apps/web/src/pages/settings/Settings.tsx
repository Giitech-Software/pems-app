import { useEffect, useState, type FormEvent } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  defaultUserSettings,
  getUserSettings,
  updateUserSettings,
} from "../../../../../packages/firebase";

export default function Settings() {
  const { firebaseUser } = useAuth();
  const [settings, setSettings] = useState(defaultUserSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      if (!firebaseUser) return;

      const userSettings = await getUserSettings(firebaseUser.uid);
      setSettings({
        rentDueReminders: userSettings.rentDueReminders,
        paymentConfirmationAlerts: userSettings.paymentConfirmationAlerts,
        maintenanceStatusNotifications: userSettings.maintenanceStatusNotifications,
        monthlyReportDigest: userSettings.monthlyReportDigest,
        defaultRentGraceDays: userSettings.defaultRentGraceDays,
        defaultCurrency: userSettings.defaultCurrency,
      });
    }

    loadSettings();
  }, [firebaseUser]);

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser) return;

    setSaving(true);
    setMessage("");

    try {
      await updateUserSettings(firebaseUser.uid, settings);
      setMessage("Settings saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage profile, account preferences, and property system settings."
      />

      <form onSubmit={handleSaveSettings} className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Notification Preferences
          </h2>

          <div className="mt-4 divide-y divide-slate-100">
            {[
              ["rentDueReminders", "Rent due reminders"],
              ["paymentConfirmationAlerts", "Payment confirmation alerts"],
              ["maintenanceStatusNotifications", "Maintenance status notifications"],
              ["monthlyReportDigest", "Monthly report digest"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className="font-semibold text-slate-900">{label}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-blue-600"
                  checked={Boolean(settings[key as keyof typeof settings])}
                  onChange={(event) =>
                    setSettings((currentSettings) => ({
                      ...currentSettings,
                      [key]: event.target.checked,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-lg font-bold">Account Controls</h2>
          <p className="mt-3 text-sm text-slate-300">
            Configure system defaults for rent tracking, room status, and report delivery.
          </p>

          <label className="mt-6 block text-sm font-bold text-slate-300">
            Rent grace period days
            <input
              type="number"
              min={0}
              value={settings.defaultRentGraceDays}
              onChange={(event) =>
                setSettings((currentSettings) => ({
                  ...currentSettings,
                  defaultRentGraceDays: Number(event.target.value || 0),
                }))
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-600"
            />
          </label>

          {message && (
            <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">
              {message}
            </p>
          )}

          <button
            disabled={saving}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
