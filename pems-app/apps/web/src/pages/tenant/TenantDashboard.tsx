import TenantLayout from "../../layouts/tenant/TenantLayout";
import { useAuth } from "../../context/AuthContext";

export default function TenantDashboard() {
  const { userProfile } = useAuth();

  return (
  <TenantLayout>
      <section className="rounded-2xl bg-slate-950 p-5 text-white sm:p-8">
        <p className="text-sm font-bold tracking-[0.3em] text-amber-400">
          TENANT PORTAL
        </p>

        <h1 className="mt-4 break-words text-2xl font-black sm:text-3xl lg:text-5xl">
          Welcome, {userProfile?.fullName || "Tenant"}
        </h1>

        <p className="mt-4 max-w-3xl text-slate-300">
          View your rent status, payment history, maintenance requests, and
          profile information from one secure portal.
        </p>
      </section>
    </TenantLayout>
  );
}