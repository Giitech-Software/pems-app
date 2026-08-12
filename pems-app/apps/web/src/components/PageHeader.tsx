interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
}: PageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500 sm:text-sm sm:tracking-[0.25em]">
          PEMS
        </p>
        <h1 className="mt-2 break-words text-2xl font-black text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">
          {subtitle}
        </p>
      </div>

      {actionLabel && (
        <button className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
