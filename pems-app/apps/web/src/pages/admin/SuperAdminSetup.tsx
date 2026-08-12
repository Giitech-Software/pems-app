import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  createInitialSuperAdmin,
  getSuperAdminSetupState,
} from "../../../../../packages/firebase";

type SetupStatus = "checking" | "available" | "locked";

const requiredSetupCode = (
  import.meta as ImportMeta & { env?: Record<string, string | undefined> }
).env?.VITE_SUPER_ADMIN_SETUP_CODE?.trim();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordIssues(password: string) {
  const issues: string[] = [];

  if (password.length < 12) {
    issues.push("12+ characters");
  }

  if (!/[a-z]/.test(password)) {
    issues.push("lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    issues.push("uppercase letter");
  }

  if (!/\d/.test(password)) {
    issues.push("number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push("symbol");
  }

  return issues;
}

export default function SuperAdminSetup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [jobTitle, setJobTitle] = useState("Platform Administrator");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<SetupStatus>("checking");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordIssues = useMemo(() => getPasswordIssues(password), [password]);
  const isSetupCodeRequired = Boolean(requiredSetupCode);

  useEffect(() => {
    let isMounted = true;

    const checkSetupStatus = async () => {
      try {
        const setupState = await getSuperAdminSetupState();

        if (!isMounted) {
          return;
        }

        setStatus(setupState.isAvailable ? "available" : "locked");
        setAdminEmail(setupState.adminEmail || "");
      } catch (setupError) {
        console.error(setupError);

        if (isMounted) {
          setStatus("available");
          setError("Could not verify setup status. Check Firebase connectivity before continuing.");
        }
      }
    };

    void checkSetupStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !organizationName.trim() || !jobTitle.trim() || !normalizedEmail) {
      setError("Full name, organization, title, and work email are required.");
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid work email address.");
      return;
    }

    if (passwordIssues.length > 0) {
      setError(`Password needs: ${passwordIssues.join(", ")}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    if (requiredSetupCode && setupCode.trim() !== requiredSetupCode) {
      setError("Provisioning key is invalid.");
      return;
    }

    setLoading(true);

    try {
      const setupState = await getSuperAdminSetupState();

      if (!setupState.isAvailable) {
        setStatus("locked");
        setAdminEmail(setupState.adminEmail || "");
        setMessage("Super admin setup has already been completed.");
        return;
      }

      await createInitialSuperAdmin({
        fullName,
        organizationName,
        jobTitle,
        phone,
        email: normalizedEmail,
        password,
      });

      setMessage("Super admin provisioned. Redirecting to the admin console...");
      setTimeout(() => navigate("/admin"), 800);
    } catch (submitError) {
      console.error(submitError);
      setError("Could not provision the super admin account. Refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
            <ShieldCheck size={26} />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.35em] text-amber-400">PEMS</p>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-white md:text-5xl">
            Enterprise platform owner provisioning
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
            Create the single account that owns platform governance, landlord approvals, and administrative controls.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-300" size={18} />
              One-time bootstrap lock
            </div>
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-emerald-300" size={18} />
              Strong credential policy
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="text-emerald-300" size={18} />
              Organization-level audit metadata
            </div>
          </div>
        </div>

        <section className="w-full rounded-2xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-black/30 md:p-8">
          {status === "checking" ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
              <p className="mt-4 text-sm font-semibold text-slate-500">Checking setup status...</p>
            </div>
          ) : status === "locked" ? (
            <div className="py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <LockKeyhole size={24} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">Setup complete</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                The super admin bootstrap is locked{adminEmail ? ` for ${adminEmail}` : ""}. Use the login page to
                continue.
              </p>
              <Link
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                to="/login"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Create super admin</h2>
                  <p className="mt-2 text-sm text-slate-500">Use a named executive or operations owner account.</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <KeyRound size={22} />
                </div>
              </div>

              {message && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="Job title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    autoComplete="organization-title"
                  />
                </div>

                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="Organization name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  autoComplete="organization"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    type="email"
                    placeholder="Work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>

                {isSetupCodeRequired && (
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    type="password"
                    placeholder="Provisioning key"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    autoComplete="off"
                  />
                )}

                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-emerald-500"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <div className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                  Password requirements: 12+ characters, uppercase, lowercase, number, and symbol.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Provisioning..." : "Provision super admin"}
                </button>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
