import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { getFriendlyAuthError, getSuperAdminSetupState, getUserAccessState, getUserProfile, loginUser } from "../../../../../packages/firebase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuperAdminSetup, setShowSuperAdminSetup] = useState(false);

  useEffect(() => {
    const checkAdminSetup = async () => {
      const setupState = await getSuperAdminSetupState();
      setShowSuperAdminSetup(setupState.isAvailable);
    };

    void checkAdminSetup();
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await loginUser({ email, password });
      const profile = await getUserProfile(userCredential.user.uid);
      const accessState = getUserAccessState(profile);

      if (!profile || accessState === "missing" || accessState === "invalid") {
        setError("Your account does not have a valid PEMS profile. Please contact the administrator.");
        return;
      }

      if (accessState === "suspended" || accessState === "inactive") {
        setError("This account is currently inactive. Please contact the administrator.");
        return;
      }

      if (accessState === "pending") {
        navigate("/pending-approval");
        return;
      }

      navigate(profile?.role === "tenant" ? "/tenant" : profile?.role === "super_admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-3 py-4 sm:px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <p className="text-sm font-bold tracking-widest text-amber-500">
          PEMS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage your properties, rooms, tenants, and payments.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-600"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 outline-none focus:border-blue-600"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link className="text-sm font-bold text-blue-600" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to PEMS?{" "}
          <Link className="font-bold text-blue-600" to="/register">
            Create account
          </Link>
        </p>

        {showSuperAdminSetup && (
          <p className="mt-3 text-center text-sm text-slate-500">
            First-time setup?{" "}
            <Link className="font-bold text-emerald-600" to="/setup-super-admin">
              Create super admin
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
