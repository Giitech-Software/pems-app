import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  getPropertiesByOwner,
  getBuildingsByOwner,
  getRoomsByOwner,
} from "../../../../../packages/firebase";


export default function Dashboard() {
  const { firebaseUser } = useAuth();
  const [totalProperties, setTotalProperties] = useState(0);
const [totalBuildings, setTotalBuildings] = useState(0);
const [totalRooms, setTotalRooms] = useState(0);
const [occupiedRooms, setOccupiedRooms] = useState(0);
const [vacantRooms, setVacantRooms] = useState(0);
  useEffect(() => {
    async function loadDashboardData() {
      if (!firebaseUser) return;

     const [properties, buildings, rooms] = await Promise.all([
  getPropertiesByOwner(firebaseUser.uid),
  getBuildingsByOwner(firebaseUser.uid),
  getRoomsByOwner(firebaseUser.uid),
]);

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
},  { title: "Active Tenants", value: "0", subtitle: "Current tenants" },
    { title: "Monthly Revenue", value: "GHS 0", subtitle: "Expected monthly rent" },
    { title: "Outstanding Rent", value: "GHS 0", subtitle: "Unpaid balances" },
  ];

  return (
    <DashboardLayout>
      <section>
        <div className="rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold tracking-[0.3em] text-amber-400">
            LANDLORD COMMAND CENTER
          </p>

          <h1 className="mt-4 text-3xl font-black lg:text-5xl">
            Manage properties, tenants, rent and reports from one place.
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            P.E.M.S. gives property owners a powerful overview of occupancy,
            payments, overdue rent, maintenance and portfolio performance.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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