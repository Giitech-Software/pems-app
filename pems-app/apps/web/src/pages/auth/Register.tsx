import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { getFriendlyDataError, getSuperAdminSetupState, registerUser } from "../../../../../packages/firebase";
import { createTenantLinkRequest } from "../../../../../packages/firebase/tenantLinkRequestService";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountRole, setAccountRole] = useState<"landlord" | "tenant">("landlord");
  const [landlordEmail, setLandlordEmail] = useState("");
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [occupation, setOccupation] = useState("");

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

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!fullName || !email || !password) {
      setError("Full name, email and password are required.");
      return;
    }

    if (accountRole === "tenant" && !landlordEmail.trim()) {
      setError("Please enter the landlord email so they can approve your access.");
      return;
    }

    if (accountRole === "tenant" && (!ghanaCardNumber.trim() || !occupation.trim())) {
      setError("Ghana Card number and occupation are required for tenant accounts.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userCredential = await registerUser({
        fullName,
        phone,
        email,
        password,
        role: accountRole,
        landlordEmail: accountRole === "tenant" ? landlordEmail : undefined,
      });

      if (accountRole === "tenant") {
        await createTenantLinkRequest({
          userId: userCredential.user.uid,
          ownerEmail: landlordEmail.trim(),
          fullName,
          email,
          phone,
          ghanaCardNumber: ghanaCardNumber.trim(),
          occupation: occupation.trim(),
        });
      }

      navigate(accountRole === "tenant" ? "/pending-approval" : "/dashboard");
    } catch (err) {
      console.error(err);
      setError(getFriendlyDataError(err, "Could not create account. Please check your details."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-3 py-4 sm:px-6 sm:py-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <p className="text-sm font-bold tracking-widest text-amber-500">
          PEMS
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {accountRole === "tenant"
            ? "Create tenant account"
            : "Create landlord account"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {accountRole === "tenant"
            ? "Create your account and request access from your landlord."
            : "Start managing properties, rooms, tenants, and rent payments."}
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-5 space-y-3">
          <select
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
            value={accountRole}
            onChange={(e) => setAccountRole(e.target.value as "landlord" | "tenant")}
          >
            <option value="landlord">I am a landlord</option>
            <option value="tenant">I am a tenant</option>
          </select>

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

          <div className="relative">
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-blue-600"
              type={showPassword ? "text" : "password"}
              placeholder="Password, minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {accountRole === "tenant" && (
            <>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                placeholder="Ghana Card number"
                value={ghanaCardNumber}
                onChange={(e) => setGhanaCardNumber(e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                placeholder="Occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
              />

              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600"
                type="email"
                placeholder="Landlord email"
                value={landlordEmail}
                onChange={(e) => setLandlordEmail(e.target.value)}
                required
              />
            </>
          )}

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
