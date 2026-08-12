import {
  getAllMaintenanceRequests,
  getAllPayments,
  getAllProperties,
  getAllTenants,
  getAllUsers,
  getBuildingsByOwner,
  getBuildingsByPropertyIds,
  getMaintenanceRequestsByOwner,
  getMaintenanceRequestsByPropertyIds,
  getMaintenanceRequestsByTenant,
  getNotificationsByOwner,
  getNotificationsByUser,
  getPaymentsByOwner,
  getPaymentsByPropertyIds,
  getPaymentsByTenant,
  getPropertiesByOwner,
  getPropertiesByManager,
  getRoomsByOwner,
  getRoomsByPropertyIds,
  getTenantByUserId,
  getTenantsByOwner,
  getTenantsByPropertyIds,
} from "../../../packages/firebase";
import type {
  Building,
  MaintenanceRequest,
  Notification,
  Payment,
  Property,
  Room,
  Tenant,
  User,
  UserRole,
} from "../../../packages/models";

export type MobileRole = Extract<UserRole, "landlord" | "property_manager" | "tenant" | "super_admin">;

export interface MobileStat {
  label: string;
  value: string;
  change: string;
  tone: string;
}

export interface MobilePropertyRow {
  name: string;
  units: string;
  health: string;
  status: string;
  accent: string;
}

export interface MobilePaymentRow {
  tenant: string;
  room: string;
  amount: string;
  status: string;
  tone: string;
}

export interface MobileMaintenanceRow {
  title: string;
  place: string;
  priority: string;
  icon: string;
}

export interface MobileInboxRow {
  from: string;
  subject: string;
  time: string;
}

export interface MobileTenantRoom {
  title: string;
  summary: string;
  leaseEnds: string;
  caretaker: string;
}

export interface MobileLandlordAssets {
  properties: Property[];
  buildings: Building[];
  rooms: Room[];
  tenants: Tenant[];
}

export interface MobileWorkspaceData {
  stats: MobileStat[];
  properties: MobilePropertyRow[];
  payments: MobilePaymentRow[];
  maintenance: MobileMaintenanceRow[];
  inbox: MobileInboxRow[];
  governance: string[];
  tenantRoom: MobileTenantRoom;
  collectionValue: string;
  collectionSummary: string;
  landlordAssets: MobileLandlordAssets;
  isPreview: boolean;
}

const emptyLandlordAssets: MobileLandlordAssets = { properties: [], buildings: [], rooms: [], tenants: [] };

const statTone = {
  indigo: "bg-indigo-50 text-indigo-700",
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  emerald: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
};

export const previewWorkspaceData = {
  landlord: {
    isPreview: true,
    stats: [
      { label: "Properties", value: "18", change: "+2 this quarter", tone: statTone.indigo },
      { label: "Rooms", value: "412", change: "93% occupied", tone: statTone.teal },
      { label: "Monthly rent", value: "GHS 284k", change: "87% collected", tone: statTone.amber },
      { label: "Open issues", value: "23", change: "6 urgent", tone: statTone.rose },
    ],
    properties: [
      { name: "East Legon Heights", units: "86 rooms", health: "96%", status: "Healthy", accent: "bg-emerald-500" },
      { name: "North Ridge Annex", units: "42 rooms", health: "88%", status: "Watch", accent: "bg-amber-500" },
      { name: "Takoradi Central", units: "112 rooms", health: "91%", status: "Healthy", accent: "bg-teal-500" },
    ],
    payments: [
      { tenant: "Ama Mensah", room: "A-204", amount: "GHS 2,400", status: "Verified", tone: "text-emerald-700 bg-emerald-50" },
      { tenant: "Kojo Annan", room: "B-118", amount: "GHS 1,800", status: "Due today", tone: "text-amber-700 bg-amber-50" },
      { tenant: "Efua Boateng", room: "C-033", amount: "GHS 3,100", status: "Overdue", tone: "text-rose-700 bg-rose-50" },
    ],
    maintenance: [
      { title: "Water pressure issue", place: "North Ridge Annex", priority: "Urgent", icon: "water-outline" },
      { title: "AC service request", place: "East Legon Heights", priority: "Scheduled", icon: "construct-outline" },
      { title: "Gate access fault", place: "Takoradi Central", priority: "Assigned", icon: "lock-closed-outline" },
    ],
    inbox: [
      { from: "Caretaker Team", subject: "Inspection summary ready", time: "08:15" },
      { from: "Tenant Portal", subject: "New link request awaiting approval", time: "10:40" },
      { from: "Finance", subject: "Weekly rent reconciliation exported", time: "13:05" },
    ],
    governance: ["Collect overdue balances", "Approve tenant link requests", "Dispatch maintenance team", "Send weekly owner report"],
    tenantRoom: { title: "East Legon Heights, A-204", summary: "1 bedroom studio - Lease active - Caretaker assigned", leaseEnds: "Dec 31, 2026", caretaker: "Kwame O." },
    collectionValue: "87%",
    collectionSummary: "GHS 246,800 collected from GHS 284,000 due this month.",
    landlordAssets: emptyLandlordAssets,
  },
  tenant: {
    isPreview: true,
    stats: [
      { label: "Rent status", value: "Paid", change: "Next due Aug 1", tone: statTone.emerald },
      { label: "Balance", value: "GHS 0", change: "No arrears", tone: statTone.indigo },
      { label: "Requests", value: "2", change: "1 in progress", tone: statTone.amber },
      { label: "Messages", value: "4", change: "2 unread", tone: statTone.sky },
    ],
    properties: [],
    payments: [
      { tenant: "Rent payment", room: "A-204", amount: "GHS 2,400", status: "Verified", tone: "text-emerald-700 bg-emerald-50" },
      { tenant: "Security deposit", room: "A-204", amount: "GHS 4,800", status: "Verified", tone: "text-emerald-700 bg-emerald-50" },
    ],
    maintenance: [
      { title: "AC service request", place: "East Legon Heights", priority: "Scheduled", icon: "construct-outline" },
      { title: "Socket replacement", place: "East Legon Heights", priority: "In progress", icon: "flash-outline" },
    ],
    inbox: [
      { from: "Property Office", subject: "Receipt is ready", time: "09:25" },
      { from: "Caretaker", subject: "Technician visit confirmed", time: "12:10" },
    ],
    governance: ["Check rent receipt", "Track active maintenance", "Message the property office", "Review room details"],
    tenantRoom: { title: "East Legon Heights, A-204", summary: "1 bedroom studio - Lease active - Caretaker assigned", leaseEnds: "Dec 31, 2026", caretaker: "Kwame O." },
    collectionValue: "GHS 0",
    collectionSummary: "No outstanding balance on your account.",
    landlordAssets: emptyLandlordAssets,
  },
  super_admin: {
    isPreview: true,
    stats: [
      { label: "Landlords", value: "126", change: "18 pending review", tone: statTone.indigo },
      { label: "Tenants", value: "4.8k", change: "Across 9 regions", tone: statTone.teal },
      { label: "Revenue", value: "GHS 1.9m", change: "Platform GMV", tone: statTone.emerald },
      { label: "Risk queue", value: "11", change: "Needs action", tone: statTone.rose },
    ],
    properties: [
      { name: "East Legon Heights", units: "86 rooms", health: "96%", status: "Healthy", accent: "bg-emerald-500" },
      { name: "North Ridge Annex", units: "42 rooms", health: "88%", status: "Watch", accent: "bg-amber-500" },
      { name: "Takoradi Central", units: "112 rooms", health: "91%", status: "Healthy", accent: "bg-teal-500" },
    ],
    payments: [
      { tenant: "Platform GMV", room: "All regions", amount: "GHS 1.9m", status: "Confirmed", tone: "text-emerald-700 bg-emerald-50" },
      { tenant: "Risk review", room: "Finance", amount: "GHS 42k", status: "Pending", tone: "text-amber-700 bg-amber-50" },
    ],
    maintenance: [
      { title: "Regional SLA watch", place: "Greater Accra", priority: "Watch", icon: "analytics-outline" },
      { title: "Escalated complaint", place: "Kumasi", priority: "Urgent", icon: "alert-circle-outline" },
    ],
    inbox: [
      { from: "Onboarding", subject: "18 landlord accounts awaiting approval", time: "08:50" },
      { from: "Risk Desk", subject: "Subscription suspension queue updated", time: "11:30" },
    ],
    governance: ["Approve landlord onboarding", "Review subscription suspensions", "Audit tenant access approvals", "Export regulator-ready reports"],
    tenantRoom: { title: "Platform estate", summary: "All connected landlord portfolios", leaseEnds: "Live", caretaker: "Ops desk" },
    collectionValue: "GHS 1.9m",
    collectionSummary: "Platform gross rent value across active landlord portfolios.",
    landlordAssets: emptyLandlordAssets,
  },
} as unknown as Record<MobileRole, MobileWorkspaceData>;

const formatCurrency = (value: number) => `GHS ${Math.round(value || 0).toLocaleString()}`;

const formatDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const paymentTone = (status?: string) => status === "confirmed" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50";

const maintenanceIcon = (item: MaintenanceRequest) => {
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (text.includes("water")) return "water-outline";
  if (text.includes("electric") || text.includes("power")) return "flash-outline";
  if (text.includes("lock") || text.includes("gate")) return "lock-closed-outline";
  return "construct-outline";
};

const propertyRows = (items: Property[], rooms: Room[]): MobilePropertyRow[] =>
  items.slice(0, 5).map((property, index) => {
    const propertyRooms = rooms.filter((room) => room.propertyId === property.id);
    const occupiedRooms = propertyRooms.filter((room) => room.status === "occupied").length;
    const totalRooms = property.totalRooms || propertyRooms.length;
    const occupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      name: property.name,
      units: `${totalRooms} rooms`,
      health: totalRooms > 0 ? `${occupancy}%` : property.status,
      status: property.status === "active" ? "Healthy" : property.status.replace(/_/g, " "),
      accent: ["bg-emerald-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500"][index % 5],
    };
  });

const paymentRows = (items: Payment[], tenants: Tenant[] = []): MobilePaymentRow[] =>
  items.slice(0, 5).map((payment) => {
    const tenant = tenants.find((item) => item.id === payment.tenantId);
    const status = payment.paymentStatus === "confirmed" ? "Verified" : "Pending";

    return {
      tenant: tenant?.fullName || payment.paymentPurpose.replace(/_/g, " "),
      room: payment.receiptNumber || payment.roomId || "Room",
      amount: formatCurrency(payment.amount),
      status,
      tone: paymentTone(payment.paymentStatus),
    };
  });

const maintenanceRows = (items: MaintenanceRequest[]): MobileMaintenanceRow[] =>
  items.slice(0, 5).map((item) => ({
    title: item.title,
    place: item.roomId || item.propertyId || "Property",
    priority: item.status.replace(/_/g, " "),
    icon: maintenanceIcon(item),
  }));

const inboxRows = (items: Notification[]): MobileInboxRow[] =>
  items.slice(0, 5).map((item) => ({
    from: item.type.replace(/_/g, " "),
    subject: item.title || item.message,
    time: formatDate(item.createdAt),
  }));

previewWorkspaceData.property_manager = {
  ...previewWorkspaceData.landlord,
  isPreview: true,
};

const withPreviewFallback = (role: MobileRole, patch: Partial<MobileWorkspaceData>): MobileWorkspaceData => ({
  ...previewWorkspaceData[role],
  ...patch,
  isPreview: false,
});

export async function loadMobileWorkspaceData(role: MobileRole, profile: User): Promise<MobileWorkspaceData> {
  if (role === "tenant") {
    const tenant = await getTenantByUserId(profile.id);

    if (!tenant) {
      return withPreviewFallback("tenant", {
        stats: [
          { label: "Profile", value: "Linked", change: "No room yet", tone: statTone.amber },
          { label: "Balance", value: "GHS 0", change: "Awaiting tenancy", tone: statTone.indigo },
          { label: "Requests", value: "0", change: "No active cases", tone: statTone.teal },
          { label: "Messages", value: "0", change: "Inbox empty", tone: statTone.sky },
        ],
        payments: [],
        maintenance: [],
        inbox: [],
        tenantRoom: { title: profile.fullName, summary: "Tenant profile is active but not linked to a room yet.", leaseEnds: "Not set", caretaker: "Property office" },
      });
    }

    const [payments, maintenance, notifications] = await Promise.all([
      getPaymentsByTenant(tenant.id),
      getMaintenanceRequestsByTenant(tenant.id),
      getNotificationsByUser(profile.id),
    ]);

    const totalPaid = payments.filter((payment) => payment.paymentStatus === "confirmed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const activeMaintenance = maintenance.filter((item) => item.status !== "completed" && item.status !== "cancelled").length;
    const unread = notifications.filter((item) => !item.isRead).length;

    return withPreviewFallback("tenant", {
      stats: [
        { label: "Rent status", value: tenant.isActive ? "Active" : "Inactive", change: `Next due ${formatDate(tenant.nextRentDueDate)}`, tone: tenant.isActive ? statTone.emerald : statTone.rose },
        { label: "Paid", value: formatCurrency(totalPaid), change: `${payments.length} payments`, tone: statTone.indigo },
        { label: "Requests", value: String(activeMaintenance), change: `${maintenance.length} total`, tone: statTone.amber },
        { label: "Messages", value: String(unread), change: `${notifications.length} notifications`, tone: statTone.sky },
      ],
      payments: paymentRows(payments, [tenant]),
      maintenance: maintenanceRows(maintenance),
      inbox: inboxRows(notifications),
      tenantRoom: {
        title: `${tenant.fullName} - ${tenant.roomId}`,
        summary: `${formatCurrency(tenant.monthlyRent)} monthly rent - Lease active`,
        leaseEnds: formatDate(tenant.leaseEndDate),
        caretaker: "Property office",
      },
      collectionValue: formatCurrency(Math.max(0, Number(tenant.monthlyRent || 0) - totalPaid)),
      collectionSummary: "Outstanding estimate based on tenant rent and confirmed payments.",
    });
  }

  if (role === "super_admin") {
    const [properties, tenants, payments, maintenance, users] = await Promise.all([
      getAllProperties(),
      getAllTenants(),
      getAllPayments(),
      getAllMaintenanceRequests(),
      getAllUsers(),
    ]);

    const landlords = users.filter((user) => user.role === "landlord");
    const totalPaid = payments.filter((payment) => payment.paymentStatus === "confirmed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const openMaintenance = maintenance.filter((item) => item.status !== "completed" && item.status !== "cancelled").length;

    return withPreviewFallback("super_admin", {
      stats: [
        { label: "Landlords", value: String(landlords.length), change: `${users.length} platform users`, tone: statTone.indigo },
        { label: "Tenants", value: String(tenants.length), change: `${properties.length} properties`, tone: statTone.teal },
        { label: "Revenue", value: formatCurrency(totalPaid), change: "Confirmed payments", tone: statTone.emerald },
        { label: "Risk queue", value: String(openMaintenance), change: "Open maintenance", tone: openMaintenance > 0 ? statTone.rose : statTone.teal },
      ],
      properties: propertyRows(properties, []),
      payments: paymentRows(payments, tenants),
      maintenance: maintenanceRows(maintenance),
      collectionValue: formatCurrency(totalPaid),
      collectionSummary: "Confirmed platform payments from all landlord portfolios.",
    });
  }

  const properties = role === "property_manager" ? await getPropertiesByManager(profile.id) : await getPropertiesByOwner(profile.id);
  const propertyIds = properties.map((property) => property.id);
  const [buildings, rooms, tenants, payments, maintenance, notifications] = await Promise.all([
    role === "property_manager" ? getBuildingsByPropertyIds(propertyIds) : getBuildingsByOwner(profile.id),
    role === "property_manager" ? getRoomsByPropertyIds(propertyIds) : getRoomsByOwner(profile.id),
    role === "property_manager" ? getTenantsByPropertyIds(propertyIds) : getTenantsByOwner(profile.id),
    role === "property_manager" ? getPaymentsByPropertyIds(propertyIds) : getPaymentsByOwner(profile.id),
    role === "property_manager" ? getMaintenanceRequestsByPropertyIds(propertyIds) : getMaintenanceRequestsByOwner(profile.id),
    getNotificationsByOwner(profile.id),
  ]);

  const occupied = rooms.filter((room) => room.status === "occupied").length;
  const occupancy = rooms.length > 0 ? Math.round((occupied / rooms.length) * 100) : 0;
  const totalPaid = payments.filter((payment) => payment.paymentStatus === "confirmed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const openMaintenance = maintenance.filter((item) => item.status !== "completed" && item.status !== "cancelled").length;

  return withPreviewFallback("landlord", {
    stats: [
      { label: "Properties", value: String(properties.length), change: `${tenants.length} tenants`, tone: statTone.indigo },
      { label: "Rooms", value: String(rooms.length), change: `${occupancy}% occupied`, tone: statTone.teal },
      { label: "Collected", value: formatCurrency(totalPaid), change: `${payments.length} payments`, tone: statTone.amber },
      { label: "Open issues", value: String(openMaintenance), change: `${maintenance.length} total`, tone: openMaintenance > 0 ? statTone.rose : statTone.teal },
    ],
    properties: propertyRows(properties, rooms),
    payments: paymentRows(payments, tenants),
    maintenance: maintenanceRows(maintenance),
    inbox: inboxRows(notifications),
    collectionValue: formatCurrency(totalPaid),
    collectionSummary: "Confirmed payments collected across your portfolio.",
    landlordAssets: { properties, buildings, rooms, tenants },
  });
}



