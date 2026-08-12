import { useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import {
  defaultPlatformSettings,
  getPlatformSettings,
  updatePlatformSettings,
  type PlatformSettings,
} from "../../../../../packages/firebase";
import PageHeader from "../../components/PageHeader";
import AdminLayout from "../../layouts/admin/AdminLayout";

const settingItems: Array<{
  key: keyof PlatformSettings;
  title: string;
  description: string;
}> = [
  {
    key: "accountSuspensionPolicy",
    title: "Account suspension policy",
    description: "Allow admins to disable accounts and pause landlord subscriptions.",
  },
  {
    key: "notificationDefaults",
    title: "Notification defaults",
    description: "Use platform notification defaults for new landlord and tenant accounts.",
  },
  {
    key: "paymentAuditThreshold",
    title: "Payment audit threshold",
    description: "Flag high-value rent and deposit records for admin review.",
  },
  {
    key: "supportEscalationWindow",
    title: "Support escalation window",
    description: "Prioritize aged maintenance and account support items.",
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const platformSettings = await getPlatformSettings();
      setSettings(platformSettings);
      setLoading(false);
    };

    void loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      await updatePlatformSettings(settings);
      setMessage("Platform settings saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <PageHeader title="Settings" subtitle="Manage global system settings and administrative controls." />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Settings2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Platform controls</h2>
              <p className="mt-1 text-sm text-slate-500">
                These toggles are stored globally and can be used by admin workflows across the app.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <div className="mt-6 divide-y divide-slate-100">
          {settingItems.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="block font-semibold text-slate-900">{item.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-blue-600"
                checked={settings[item.key]}
                disabled={loading}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    [item.key]: event.target.checked,
                  }))
                }
              />
            </label>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
