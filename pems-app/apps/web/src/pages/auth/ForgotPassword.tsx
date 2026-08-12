import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../../../packages/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset instructions have been sent to your email.");
    } catch {
      setError("Could not send reset instructions. Check the email address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-6">
      <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl sm:p-6">
        <p className="text-sm font-bold tracking-widest text-amber-500">
          PEMS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Reset password
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter your account email and we will send secure reset instructions.
        </p>

        {message && (
          <div className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link className="font-bold text-blue-600" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
