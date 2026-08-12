import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  getBuildingsByOwner,
  getPaymentsByOwner,
  getPropertiesByOwner,
  getRoomsByOwner,
  getTenantsByOwner,
} from "../../../../../packages/firebase";
import type {
  Building,
  Payment,
  Property,
  Room,
  Tenant,
} from "../../../../../packages/models";

type ReportKey =
  | "monthlyRent"
  | "occupancy"
  | "outstandingRent"
  | "tenantReport"
  | "propertyReport";

const reportCards: Array<{
  key: ReportKey;
  title: string;
  description: string;
}> = [
  {
    key: "monthlyRent",
    title: "Monthly Rent",
    description: "Collection trend, expected rent, and payment gaps.",
  },
  {
    key: "occupancy",
    title: "Occupancy",
    description: "Occupied, vacant, and maintenance rooms by property.",
  },
  {
    key: "outstandingRent",
    title: "Outstanding Rent",
    description: "Balances by tenant, building, and overdue age.",
  },
  {
    key: "tenantReport",
    title: "Tenant Report",
    description: "Active tenants, move-in dates, and assignment status.",
  },
  {
    key: "propertyReport",
    title: "Property Report",
    description: "Portfolio performance across properties and buildings.",
  },
];

export default function Reports() {
  const { firebaseUser } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportKey>("monthlyRent");
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadReports() {
      if (!firebaseUser) return;

      const [
        propertyRecords,
        buildingRecords,
        roomRecords,
        tenantRecords,
        paymentRecords,
      ] = await Promise.all([
        getPropertiesByOwner(firebaseUser.uid),
        getBuildingsByOwner(firebaseUser.uid),
        getRoomsByOwner(firebaseUser.uid),
        getTenantsByOwner(firebaseUser.uid),
        getPaymentsByOwner(firebaseUser.uid),
      ]);

      setProperties(propertyRecords);
      setBuildings(buildingRecords);
      setRooms(roomRecords);
      setTenants(tenantRecords);
      setPayments(paymentRecords);
    }

    loadReports();
  }, [firebaseUser]);

  const metrics = useMemo(() => {
    const activeTenants = tenants.filter((tenant) => tenant.isActive);
    const expectedRent = activeTenants.reduce(
      (sum, tenant) => sum + Number(tenant.monthlyRent || 0),
      0
    );
    const rentCollected = payments
      .filter((payment) => payment.paymentPurpose === "rent")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const occupiedRooms = rooms.filter((room) => room.status === "occupied").length;
    const vacantRooms = rooms.filter((room) => room.status === "vacant").length;
    const maintenanceRooms = rooms.filter(
      (room) => room.status === "maintenance"
    ).length;

    return {
      activeTenants,
      expectedRent,
      rentCollected,
      outstandingRent: Math.max(expectedRent - rentCollected, 0),
      occupiedRooms,
      vacantRooms,
      maintenanceRooms,
    };
  }, [payments, rooms, tenants]);

  const selectedSummary = {
    monthlyRent: [
      ["Expected monthly rent", `GHS ${metrics.expectedRent.toLocaleString()}`],
      ["Rent collected", `GHS ${metrics.rentCollected.toLocaleString()}`],
      ["Collection gap", `GHS ${metrics.outstandingRent.toLocaleString()}`],
    ],
    occupancy: [
      ["Total rooms", String(rooms.length)],
      ["Occupied rooms", String(metrics.occupiedRooms)],
      ["Vacant rooms", String(metrics.vacantRooms)],
      ["Maintenance rooms", String(metrics.maintenanceRooms)],
    ],
    outstandingRent: [
      ["Outstanding rent", `GHS ${metrics.outstandingRent.toLocaleString()}`],
      ["Active tenants", String(metrics.activeTenants.length)],
      ["Average balance", `GHS ${Math.round(metrics.outstandingRent / Math.max(metrics.activeTenants.length, 1)).toLocaleString()}`],
    ],
    tenantReport: [
      ["Total tenants", String(tenants.length)],
      ["Active tenants", String(metrics.activeTenants.length)],
      ["Inactive tenants", String(tenants.length - metrics.activeTenants.length)],
    ],
    propertyReport: [
      ["Properties", String(properties.length)],
      ["Buildings", String(buildings.length)],
      ["Rooms", String(rooms.length)],
    ],
  }[selectedReport];

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        subtitle="View occupancy, rent collection, overdue payments, and portfolio reports."
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <article
            key={report.key}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-amber-600">
              Report
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              {report.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{report.description}</p>
            <button
              onClick={() => setSelectedReport(report.key)}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              View Report
            </button>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          {reportCards.find((report) => report.key === selectedReport)?.title} Summary
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {selectedSummary.map(([label, value]) => (
            <article key={label} className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
