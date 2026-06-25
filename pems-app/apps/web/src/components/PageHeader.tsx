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
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-bold tracking-[0.25em] text-amber-500">
          P.E.M.S.
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-500">{subtitle}</p>
      </div>

      {actionLabel && (
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}