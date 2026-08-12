import { Link } from "react-router-dom";

export default function PendingApproval() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <p className="text-sm font-bold tracking-widest text-amber-500">PEMS</p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Waiting for landlord approval
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Your tenant account has been created, but your landlord must approve it before you can access the tenant dashboard.
        </p>

        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
          Once approved, you will be able to sign in and access your portal normally.
        </div>

        <div className="mt-6">
          <Link className="font-bold text-blue-600" to="/login">
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
