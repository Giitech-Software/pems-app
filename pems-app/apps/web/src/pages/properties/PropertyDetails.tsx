import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";

const metrics = [
  ["Buildings", "4"],
  ["Rooms", "48"],
  ["Occupied", "41"],
  ["Monthly Rent", "GHS 96,000"],
];

export default function PropertyDetails() {
  const { propertyId } = useParams();

  return (
    <DashboardLayout>
      <PageHeader
        title="Property Details"
        subtitle={`Operational summary, occupancy, and rent performance for property ${propertyId || "record"}.`}
        actionLabel="Edit Property"
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Building Breakdown</h2>
          <div className="mt-5 space-y-4">
            {["Block A", "Block B", "Annex", "Commercial Wing"].map((building) => (
              <div key={building} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-slate-900">{building}</p>
                  <p className="text-sm text-slate-500">Rooms, tenants, maintenance, and rent status.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">View</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-lg font-bold">Portfolio Notes</h2>
          <p className="mt-3 text-sm text-slate-300">
            Connect this page to live property records when the detailed service endpoint is available.
          </p>
          <div className="mt-5 rounded-lg bg-white/10 p-4">
            <p className="text-sm text-slate-300">Current health</p>
            <p className="mt-1 text-2xl font-black">Stable</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
