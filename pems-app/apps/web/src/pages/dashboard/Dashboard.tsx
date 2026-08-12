import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  getPropertiesByOwner,
  getBuildingsByOwner,
  getRoomsByOwner,
  getTenantsByOwner,
  getPaymentsByOwner,
} from "../../../../../packages/firebase";

export default function Dashboard() {
  const { firebaseUser } = useAuth();
  const [totalProperties, setTotalProperties] = useState(0);
const [totalBuildings, setTotalBuildings] = useState(0);
const [totalRooms, setTotalRooms] = useState(0);
const [occupiedRooms, setOccupiedRooms] = useState(0);
const [vacantRooms, setVacantRooms] = useState(0);
const [activeTenants, setActiveTenants] = useState(0);
const [monthlyRevenue, setMonthlyRevenue] = useState(0);
const [rentCollected, setRentCollected] = useState(0);
const [outstandingRent, setOutstandingRent] = useState(0);
  useEffect(() => {
    async function loadDashboardData() {
      if (!firebaseUser) return;
const [properties, buildings, rooms, tenants, payments] = await Promise.all([
  getPropertiesByOwner(firebaseUser.uid),
  getBuildingsByOwner(firebaseUser.uid),
  getRoomsByOwner(firebaseUser.uid),
  getTenantsByOwner(firebaseUser.uid),
  getPaymentsByOwner(firebaseUser.uid),
]);
setTotalProperties(properties.length);
setTotalBuildings(buildings.length);
setTotalRooms(rooms.length);
setOccupiedRooms(rooms.filter((room) => room.status === "occupied").length);
setVacantRooms(rooms.filter((room) => room.status === "vacant").length);
setActiveTenants(tenants.filter((tenant) => tenant.isActive).length);

const expectedRevenue = tenants
  .filter((tenant) => tenant.isActive)
  .reduce((sum, tenant) => sum + Number(tenant.monthlyRent || 0), 0);

setMonthlyRevenue(expectedRevenue);
const totalRentCollected = payments
  .filter((payment) => payment.paymentPurpose === "rent")
  .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

setRentCollected(totalRentCollected);

const estimatedOutstanding = Math.max(expectedRevenue - totalRentCollected, 0);
setOutstandingRent(estimatedOutstanding);
setTotalProperties(properties.length);
setTotalBuildings(buildings.length);
setTotalRooms(rooms.length);
setOccupiedRooms(rooms.filter((room) => room.status === "occupied").length);
setVacantRooms(rooms.filter((room) => room.status === "vacant").length);
    }

    loadDashboardData();
  }, [firebaseUser]);

  const stats = [
    {
      title: "Total Properties",
      value: String(totalProperties),
      subtitle: "All registered properties",
    },
    {
  title: "Total Buildings",
  value: String(totalBuildings),
  subtitle: "Blocks and structures",
},{
  title: "Total Rooms",
  value: String(totalRooms),
  subtitle: "All rentable spaces",
},
{
  title: "Occupied Rooms",
  value: String(occupiedRooms),
  subtitle: "Currently rented",
},
{
  title: "Vacant Rooms",
  value: String(vacantRooms),
  subtitle: "Available for rent",
},  {
  title: "Active Tenants",
  value: String(activeTenants),
  subtitle: "Current tenants",
},
{
  title: "Monthly Revenue",
  value: `GHS ${monthlyRevenue.toLocaleString()}`,
  subtitle: "Expected monthly rent",
},  {
  title: "Rent Collected",
  value: `GHS ${rentCollected.toLocaleString()}`,
  subtitle: "Recorded rent payments",
},
{
  title: "Outstanding Rent",
  value: `GHS ${outstandingRent.toLocaleString()}`,
  subtitle: "Estimated unpaid balance",
},
  ];

  return (
    <DashboardLayout>
      <section>
        <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-8">
          <p className="text-sm font-bold tracking-[0.3em] text-amber-400">
            LANDLORD COMMAND CENTER
          </p>

          <h1 className="mt-4 break-words text-2xl font-black sm:text-3xl lg:text-5xl">
            Manage properties, tenants, rent and reports from one place.
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            PEMS gives property owners a powerful overview of occupancy,
            payments, overdue rent, maintenance and portfolio performance.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
            />
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
