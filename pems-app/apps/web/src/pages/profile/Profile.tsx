import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { updateUserProfile } from "../../../../../packages/firebase";

export default function Profile() {
  const { firebaseUser, userProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFullName(userProfile?.fullName || "");
    setPhone(userProfile?.phone || "");
  }, [userProfile]);

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser) return;

    setSaving(true);
    setMessage("");

    try {
      await updateUserProfile(firebaseUser.uid, {
        fullName,
        phone,
      });
      setMessage("Profile saved. Refresh to see updates in the top bar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile"
        subtitle="Review account information, contact details, and role access."
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 text-2xl font-black text-white">
            {(userProfile?.fullName || "L").slice(0, 1)}
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-950">
            {userProfile?.fullName || "Landlord"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {userProfile?.role || "landlord"}
          </p>
          <p className="mt-4 text-sm font-bold text-emerald-700">
            {userProfile?.isActive ? "Active account" : "Inactive account"}
          </p>
        </div>

        <form
          onSubmit={handleSaveProfile}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-950">Account Details</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-500">
              Full Name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-950 outline-none focus:border-blue-600"
              />
            </label>

            <label className="text-sm font-semibold text-slate-500">
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-950 outline-none focus:border-blue-600"
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-slate-500">Email</p>
              <p className="mt-2 font-bold text-slate-950">
                {userProfile?.email || "Not provided"}
              </p>
            </div>
          </div>

          {message && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
              {message}
            </p>
          )}

          <button
            disabled={saving}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>
    </DashboardLayout>
  );
}
