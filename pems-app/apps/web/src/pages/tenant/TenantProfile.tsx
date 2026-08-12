import { useEffect, useState, type FormEvent } from "react";
import TenantLayout from "../../layouts/tenant/TenantLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../../../../packages/firebase";
import { getTenantDisplayId } from "../../../../../packages/models";
import { useTenantPortal } from "../tenants/hooks/useTenantPortal";

export default function TenantProfile() {
  const { firebaseUser, userProfile } = useAuth();
  const { tenant } = useTenantPortal(firebaseUser?.uid);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const canUpdateProfile = Boolean(tenant?.profileUpdateAllowed);

  useEffect(() => {
    setFullName(userProfile?.fullName || "");
    setPhone(userProfile?.phone || "");
  }, [userProfile]);

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser || !canUpdateProfile) {
      setMessage("Your landlord must allow profile updates before you can save changes.");
      return;
    }

    await updateUserProfile(firebaseUser.uid, {
      fullName,
      phone,
    });
    setMessage("Profile saved. Refresh to see updates across the portal.");
  }

  return (
    <TenantLayout>
      <PageHeader
        title="Profile"
        subtitle="View your tenant information and update it when your landlord grants access."
      />

      {!canUpdateProfile && (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Profile updates are locked. Ask your landlord to allow updates before editing your name or phone number.
        </section>
      )}

      <form
        onSubmit={handleSaveProfile}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-500">
            Full Name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={!canUpdateProfile}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-950 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </label>

          <label className="text-sm font-semibold text-slate-500">
            Phone
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={!canUpdateProfile}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-950 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-slate-500">Tenant ID</p>
            <p className="mt-1 break-words font-bold text-slate-950">
              {tenant ? getTenantDisplayId(tenant) : "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">Email</p>
            <p className="mt-1 break-words font-bold text-slate-950">
              {userProfile?.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">Portal Access</p>
            <p className="mt-1 font-bold text-emerald-700">
              {userProfile?.isActive ? "Active" : "Inactive"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">Update Permission</p>
            <p className={`mt-1 font-bold ${canUpdateProfile ? "text-emerald-700" : "text-amber-700"}`}>
              {canUpdateProfile ? "Allowed by landlord" : "Locked by landlord"}
            </p>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">
            {message}
          </p>
        )}

        <button
          disabled={!canUpdateProfile}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          Save Profile
        </button>
      </form>
    </TenantLayout>
  );
}