import loadingMark from "../assets/brand/pems-loading-mark.png";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({
  message = "Property Engagement & Management System",
  subMessage = "The rent control centre.",
}: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.24),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#111827_50%,_#172554_100%)] px-4 py-6 text-white">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.2),_transparent_40%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-emerald-400 motion-safe:animate-spin" />
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <img
              src={loadingMark}
              alt="PEMS"
              className="h-14 w-14 rounded-xl object-contain shadow-lg shadow-emerald-500/20"
            />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-amber-400">
            PEMS
          </p>
          <h1 className="mt-3 text-2xl font-black sm:text-3xl">{message}</h1>
          <p className="mt-3 max-w-md text-sm text-slate-300 sm:text-base">{subMessage}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
              Secure
            </span>
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-blue-300">
              Smart
            </span>
            <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-amber-300">
              Scalable
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
