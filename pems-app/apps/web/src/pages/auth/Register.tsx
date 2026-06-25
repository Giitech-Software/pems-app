import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../../../packages/firebase";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!fullName || !email || !password) {
      setError("Full name, email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser({
        fullName,
        phone,
        email,
        password,
        role: "landlord",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Could not create account. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-bold tracking-widest text-amber-500">
          P.E.M.S.
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Create landlord account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Start managing properties, rooms, tenants, and rent payments.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            type="password"
            placeholder="Password, minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-bold text-blue-600" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}