import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth, createBuilding, createProperty, createRoom, createTenant, deleteBuilding, deleteProperty, deleteRoom, deleteTenant, getFriendlyAuthError, getFriendlyDataError, getUserAccessState, getUserProfile, loginUser, logoutUser, updateBuilding, updateProperty, updateRoom, updateTenant, updateTenantProfilePermission } from "../../../packages/firebase";
import { getTenantDisplayId, type Building, type Property, type PropertyType, type Room, type RoomStatus, type Tenant, type User } from "../../../packages/models";
import { canAccessFeature, type PemsFeature } from "../../../packages/constants";
import {
  loadMobileWorkspaceData,
  previewWorkspaceData,
  type MobileMaintenanceRow,
  type MobilePaymentRow,
  type MobileRole,
  type MobileWorkspaceData,
} from "../lib/mobileData";

type Role = MobileRole;
type Tab = "home" | "portfolio" | "payments" | "maintenance" | "more";
type SessionMode = "preview" | "live";

interface MobileSession {
  mode: SessionMode;
  role: Role;
  firebaseUser?: FirebaseUser;
  profile?: User;
}
interface LoginRequest {
  role: Role;
  email: string;
  password: string;
}

const Icon = Ionicons as any;

const roleLabels: Record<Role, string> = {
  landlord: "Landlord",
  property_manager: "Property Manager",
  tenant: "Tenant",
  super_admin: "Enterprise Admin",
};

const roleSubtitles: Record<Role, string> = {
  landlord: "Portfolio operations",
  property_manager: "Property operations",
  tenant: "Resident portal",
  super_admin: "Platform governance",
};

const tabMeta: Record<Tab, { title: string; action: string; icon: string }> = {
  home: { title: "Dashboard", action: "Refresh", icon: "grid-outline" },
  portfolio: { title: "Portfolio", action: "Map", icon: "business-outline" },
  payments: { title: "Payments", action: "Export", icon: "card-outline" },
  maintenance: { title: "Maintenance", action: "New", icon: "construct-outline" },
  more: { title: "More", action: "Open", icon: "menu-outline" },
};

const normalizeRole = (role?: string): Role => {
  if (role === "tenant" || role === "super_admin" || role === "property_manager") return role;
  return "landlord";
};

function PageHeader({
  eyebrow = "PEMS",
  title,
  subtitle,
  actionLabel,
  icon,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  icon?: string;
}) {
  return (
    <View className="rounded-lg border border-slate-200 bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-amber-500">{eyebrow}</Text>
          <Text className="mt-2 text-2xl font-black text-slate-950">{title}</Text>
          <Text className="mt-2 text-sm leading-5 text-slate-500">{subtitle}</Text>
        </View>
        {icon ? (
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
            <Icon name={icon} size={22} color="#334155" />
          </View>
        ) : null}
      </View>

      {actionLabel ? (
        <Pressable className="mt-4 flex-row items-center justify-center rounded-lg bg-blue-600 px-4 py-3">
          <Icon name="add-circle-outline" size={18} color="#ffffff" />
          <Text className="ml-2 text-sm font-bold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <View className="rounded-lg border border-slate-200 bg-white p-4">{children}</View>;
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between">
      <Text className="text-lg font-black text-slate-950">{title}</Text>
      {action ? <Text className="text-sm font-bold text-blue-600">{action}</Text> : null}
    </View>
  );
}

function StatusPill({ text, tone = "slate" }: { text: string; tone?: "slate" | "blue" | "amber" | "emerald" | "rose" }) {
  const styles = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <View className={`rounded-md px-2 py-1 ${styles}`}>
      <Text className="text-xs font-bold capitalize">{text}</Text>
    </View>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <View className="w-[48%] rounded-lg border border-slate-200 bg-white p-4">
      <Text className="text-xs font-bold uppercase text-slate-500">{label}</Text>
      <Text className="mt-3 text-2xl font-black text-slate-950">{value}</Text>
      <Text className="mt-2 text-xs font-semibold text-slate-400">{change}</Text>
    </View>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <View className="rounded-lg border border-dashed border-slate-300 bg-white p-5">
      <View className="items-center">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Icon name="file-tray-outline" size={20} color="#64748b" />
        </View>
        <Text className="mt-3 text-center font-semibold text-slate-500">{text}</Text>
      </View>
    </View>
  );
}

function DataStatus({ dataError, isPreview }: { dataError: string; isPreview: boolean }) {
  if (!dataError && !isPreview) return null;

  return (
    <View className={`rounded-lg border p-3 ${dataError ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
      <Text className={`text-sm font-semibold ${dataError ? "text-amber-800" : "text-blue-700"}`}>
        {dataError || "Preview data is active. Sign in to load live Firebase records."}
      </Text>
    </View>
  );
}

function LoginScreen({ onLogin, loading, error }: { onLogin: (request: LoginRequest) => void; loading: boolean; error: string }) {
  const [role, setRole] = useState<Role>("landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6 pt-4">
        <PageHeader
          eyebrow="ASTEM SOFTWARE LABS"
          title="P.E.M.S."
          subtitle="Enterprise property operations for landlords, tenants, caretakers, and platform administrators."
          icon="business-outline"
        />

        <View className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <Text className="text-lg font-black text-slate-950">Mobile access</Text>
          <Text className="mt-1 text-sm text-slate-500">Enter Firebase credentials to access live data.</Text>

          <View className="mt-4 gap-2">
            {(["landlord", "property_manager", "tenant", "super_admin"] as Role[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => setRole(item)}
                className={`flex-row items-center justify-between rounded-lg border p-3 ${
                  role === item ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"
                }`}
              >
                <View>
                  <Text className="font-bold text-slate-950">{roleLabels[item]}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{roleSubtitles[item]}</Text>
                </View>
                <Icon
                  name={role === item ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={role === item ? "#2563eb" : "#94a3b8"}
                />
              </Pressable>
            ))}
          </View>

          <View className="mt-4 gap-2">
            <TextInput
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950"
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-950"
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error ? (
            <View className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <Text className="text-sm font-semibold text-rose-700">{error}</Text>
            </View>
          ) : null}

          <Pressable
            disabled={loading}
            onPress={() => onLogin({ role, email: email.trim(), password })}
            className={`mt-4 flex-row items-center justify-center rounded-lg py-3 ${loading ? "bg-slate-400" : "bg-blue-600"}`}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Icon name="log-in-outline" size={20} color="#ffffff" />}
            <Text className="ml-2 font-bold text-white">{email || password ? "Sign in" : "Preview workspace"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppTopbar({ session, onLogout }: { session: MobileSession; onLogout: () => void }) {
  return (
    <View className="border-b border-slate-200 bg-white px-5 pb-4 pt-3">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-amber-500">PEMS</Text>
          <Text className="mt-1 text-2xl font-black text-slate-950">{roleLabels[session.role]}</Text>
          <Text className="mt-1 text-xs font-semibold text-slate-500" numberOfLines={1}>
            {session.mode === "live" ? session.profile?.email || "Live Firebase session" : "Preview mode"}
          </Text>
        </View>
        <View className="ml-3 flex-row items-center gap-2">
          <StatusPill text={session.mode} tone={session.mode === "live" ? "emerald" : "blue"} />
          <Pressable onPress={onLogout} className="h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
            <Icon name={session.mode === "live" ? "log-out-outline" : "person-circle-outline"} size={25} color="#334155" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DashboardPage({ role, data }: { role: Role; data: MobileWorkspaceData }) {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={
          role === "tenant"
            ? "A focused view of your room, rent, requests, and messages."
            : role === "super_admin"
              ? "Platform-wide governance, onboarding, risk, and operational health."
              : "Portfolio health, rent collection, maintenance, and tenant communication."
        }
        icon="grid-outline"
      />

      <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} />
        ))}
      </View>

      <SectionTitle title={role === "super_admin" ? "Governance queue" : "Today"} action="View all" />
      <View className="gap-3">
        {data.governance.map((item, index) => (
          <Panel key={item}>
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Text className="font-black text-slate-700">{index + 1}</Text>
              </View>
              <Text className="ml-3 flex-1 font-bold text-slate-900">{item}</Text>
              <Icon name="chevron-forward" size={20} color="#64748b" />
            </View>
          </Panel>
        ))}
      </View>
    </>
  );
}

function PortfolioPage({ role, data }: { role: Role; data: MobileWorkspaceData }) {
  if (role === "tenant") {
    return (
      <>
        <PageHeader title="My Room" subtitle="Room, lease, caretaker, and rent details in one place." icon="home-outline" />
        <View className="mt-5">
          <Panel>
            <Text className="text-2xl font-black text-slate-950">{data.tenantRoom.title}</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-500">{data.tenantRoom.summary}</Text>
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-lg bg-blue-50 p-3">
                <Text className="text-xs font-bold uppercase text-blue-700">Lease ends</Text>
                <Text className="mt-1 font-black text-slate-950">{data.tenantRoom.leaseEnds}</Text>
              </View>
              <View className="flex-1 rounded-lg bg-slate-100 p-3">
                <Text className="text-xs font-bold uppercase text-slate-600">Caretaker</Text>
                <Text className="mt-1 font-black text-slate-950">{data.tenantRoom.caretaker}</Text>
              </View>
            </View>
          </Panel>
        </View>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={role === "super_admin" ? "Enterprise Portfolio" : "Portfolio"}
        subtitle="Properties, rooms, occupancy health, and operational status."
        actionLabel="Add property"
        icon="business-outline"
      />
      <SectionTitle title="Properties" action="Map" />
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {data.properties.length === 0 ? <EmptyList text="No properties found for this workspace yet." /> : null}
        {data.properties.map((property) => (
          <View key={property.name} className="w-[48%]"><Panel>
            <View className="flex-row items-center">
              <View className={`h-12 w-2 rounded-full ${property.accent}`} />
              <View className="ml-3 min-w-0 flex-1">
                <Text className="text-lg font-black text-slate-950" numberOfLines={1}>{property.name}</Text>
                <Text className="mt-1 text-sm font-semibold text-slate-500">{property.units}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-black text-slate-950">{property.health}</Text>
                <Text className="text-xs font-bold capitalize text-slate-500">{property.status}</Text>
              </View>
            </View>
          </Panel></View>
        ))}
      </View>
    </>
  );
}

function PaymentsPage({ role, data }: { role: Role; data: MobileWorkspaceData }) {
  return (
    <>
      <PageHeader
        title={role === "tenant" ? "Payments" : "Rent Collection"}
        subtitle="Confirmed receipts, pending collections, and rent movement."
        actionLabel={role === "tenant" ? "Request receipt" : "Record payment"}
        icon="card-outline"
      />
      <View className="mt-5 rounded-lg bg-emerald-600 p-5">
        <Text className="text-sm font-bold uppercase tracking-widest text-emerald-100">Collection progress</Text>
        <Text className="mt-3 text-4xl font-black text-white">{data.collectionValue}</Text>
        <Text className="mt-2 text-base leading-6 text-emerald-50">{data.collectionSummary}</Text>
      </View>
      <SectionTitle title="Recent payments" action="Export" />
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {data.payments.length === 0 ? <EmptyList text="No payment records found yet." /> : null}
        {data.payments.map((payment: MobilePaymentRow) => (
          <View key={`${payment.tenant}-${payment.amount}-${payment.status}`} className="w-[48%]"><Panel>
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                <Icon name="receipt-outline" size={22} color="#334155" />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text className="font-black text-slate-950" numberOfLines={1}>{role === "tenant" ? payment.amount : payment.tenant}</Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>{role === "tenant" ? payment.status : `${payment.room} - ${payment.amount}`}</Text>
              </View>
              <StatusPill text={payment.status} tone={payment.status.toLowerCase().includes("verified") ? "emerald" : "amber"} />
            </View>
          </Panel></View>
        ))}
      </View>
    </>
  );
}

function MaintenancePage({ data }: { data: MobileWorkspaceData }) {
  return (
    <>
      <PageHeader title="Maintenance" subtitle="Service requests, assigned work, and repair status." actionLabel="New request" icon="construct-outline" />
      <SectionTitle title="Requests" action="Filter" />
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {data.maintenance.length === 0 ? <EmptyList text="No maintenance requests found yet." /> : null}
        {data.maintenance.map((item: MobileMaintenanceRow) => (
          <View key={`${item.title}-${item.place}`} className="w-[48%]"><Panel>
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
                <Icon name={item.icon} size={22} color="#b45309" />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text className="font-black text-slate-950" numberOfLines={1}>{item.title}</Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>{item.place}</Text>
              </View>
              <StatusPill text={item.priority} tone={item.priority.toLowerCase().includes("urgent") ? "rose" : "amber"} />
            </View>
          </Panel></View>
        ))}
      </View>
    </>
  );
}

interface ModuleRow {
  title: string;
  subtitle: string;
  metric: string;
  icon: string;
  tone: "slate" | "blue" | "amber" | "emerald" | "rose";
}

interface ModuleRecord {
  id?: string;
  kind?: "property" | "building" | "room" | "tenant";
  title: string;
  subtitle: string;
  meta: string;
  icon: string;
  tone: "slate" | "blue" | "amber" | "emerald" | "rose";
}

const statValue = (data: MobileWorkspaceData, label: string) => data.stats.find((stat) => stat.label.toLowerCase() === label.toLowerCase())?.value || "0";

function getModuleRows(role: Role, data: MobileWorkspaceData): ModuleRow[] {
  if (role === "tenant") {
    return [
      { title: "My Room", subtitle: data.tenantRoom.summary, metric: data.tenantRoom.leaseEnds, icon: "home-outline", tone: "blue" },
      { title: "Rent Status", subtitle: data.collectionSummary, metric: data.collectionValue, icon: "wallet-outline", tone: "emerald" },
      { title: "Payment History", subtitle: "Receipts and confirmed payments", metric: String(data.payments.length), icon: "receipt-outline", tone: "slate" },
      { title: "Maintenance", subtitle: "Service requests and repair updates", metric: String(data.maintenance.length), icon: "construct-outline", tone: "amber" },
      { title: "Messages", subtitle: "Property office and caretaker messages", metric: String(data.inbox.length), icon: "chatbubble-ellipses-outline", tone: "blue" },
      { title: "Profile", subtitle: "Personal details and account access", metric: roleLabels[role], icon: "person-circle-outline", tone: "slate" },
    ];
  }

  if (role === "super_admin") {
    return [
      { title: "Admin Dashboard", subtitle: "Platform health and governance", metric: statValue(data, "Landlords"), icon: "shield-checkmark-outline", tone: "blue" },
      { title: "Users", subtitle: "Landlords, tenants, and account controls", metric: statValue(data, "Tenants"), icon: "people-outline", tone: "slate" },
      { title: "Landlords", subtitle: "Onboarding, approvals, and subscription status", metric: statValue(data, "Landlords"), icon: "briefcase-outline", tone: "emerald" },
      { title: "Properties", subtitle: "Enterprise property oversight", metric: String(data.properties.length), icon: "business-outline", tone: "blue" },
      { title: "Reports", subtitle: "Exports, compliance, and platform revenue", metric: data.collectionValue, icon: "bar-chart-outline", tone: "amber" },
      { title: "Settings", subtitle: "Platform rules and administration", metric: "Admin", icon: "settings-outline", tone: "slate" },
    ];
  }

  return [
    { title: "Properties", subtitle: "Estate records and portfolio health", metric: statValue(data, "Properties"), icon: "business-outline", tone: "blue" },
    { title: "Buildings", subtitle: "Building groups and physical structures", metric: "Manage", icon: "storefront-outline", tone: "slate" },
    { title: "Rooms", subtitle: "Room inventory, occupancy, and rent setup", metric: statValue(data, "Rooms"), icon: "key-outline", tone: "emerald" },
    { title: "Tenants", subtitle: "Tenant records, access, and leases", metric: String(data.landlordAssets.tenants.length), icon: "people-outline", tone: "blue" },
    { title: "Overdue Rent", subtitle: "Balances requiring follow-up", metric: data.collectionValue, icon: "alert-circle-outline", tone: "rose" },
    { title: "Messages", subtitle: "Tenant and caretaker communication", metric: String(data.inbox.length), icon: "chatbubble-ellipses-outline", tone: "slate" },
    { title: "Reports", subtitle: "Owner summaries and export-ready reports", metric: "Reports", icon: "bar-chart-outline", tone: "amber" },
    { title: "Notifications", subtitle: "Rent alerts and operational updates", metric: String(data.inbox.length), icon: "notifications-outline", tone: "blue" },
    { title: "Profile", subtitle: "Account details and security", metric: roleLabels[role], icon: "person-circle-outline", tone: "slate" },
    { title: "Settings", subtitle: "Preferences, billing, and platform controls", metric: "Setup", icon: "settings-outline", tone: "slate" },
  ];
}

function ModuleCard({ item, onPress }: { item: ModuleRow; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Panel>
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
            <Icon name={item.icon} size={22} color="#334155" />
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-black text-slate-950" numberOfLines={1}>{item.title}</Text>
            <Text className="mt-1 text-sm text-slate-500" numberOfLines={2}>{item.subtitle}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <StatusPill text={item.metric} tone={item.tone} />
            {onPress ? <Icon name="chevron-forward" size={18} color="#64748b" /> : null}
          </View>
        </View>
      </Panel>
    </Pressable>
  );
}

function moduleRecords(moduleTitle: string, data: MobileWorkspaceData): ModuleRecord[] {
  const title = moduleTitle.toLowerCase();

  if (title.includes("payment") || title.includes("rent") || title.includes("overdue")) {
    return data.payments.slice(0, 4).map((payment) => ({
      title: payment.tenant,
      subtitle: `${payment.room} - ${payment.amount}`,
      meta: payment.status,
      icon: "receipt-outline",
      tone: payment.status.toLowerCase().includes("verified") ? "emerald" : "amber",
    }));
  }

  if (title.includes("maintenance")) {
    return data.maintenance.slice(0, 4).map((item) => ({
      title: item.title,
      subtitle: item.place,
      meta: item.priority,
      icon: item.icon,
      tone: item.priority.toLowerCase().includes("urgent") ? "rose" : "amber",
    }));
  }

  if (title.includes("message") || title.includes("notification") || title.includes("inbox")) {
    return data.inbox.slice(0, 4).map((message) => ({
      title: message.from,
      subtitle: message.subject,
      meta: message.time,
      icon: "mail-outline",
      tone: "blue",
    }));
  }
  if (title.includes("tenant")) {
    return data.landlordAssets.tenants.slice(0, 6).map((tenant) => {
      const room = data.landlordAssets.rooms.find((item) => item.id === tenant.roomId);
      const building = data.landlordAssets.buildings.find((item) => item.id === tenant.buildingId);

      return {
        id: tenant.id,
        kind: "tenant",
        title: tenant.fullName,
        subtitle: `${getTenantDisplayId(tenant)} - ${building?.name || "Building"} ${room?.roomNumber || tenant.roomId}`,
        meta: tenant.isActive ? "Active" : "Inactive",
        icon: "people-outline",
        tone: tenant.isActive ? "emerald" : "slate",
      };
    });
  }

  if (title.includes("building")) {
    return data.landlordAssets.buildings.slice(0, 6).map((building) => {
      const property = data.landlordAssets.properties.find((item) => item.id === building.propertyId);

      return {
        id: building.id,
        kind: "building",
        title: building.name,
        subtitle: property?.name || "Unassigned property",
        meta: `${building.totalRooms || 0} rooms`,
        icon: "storefront-outline",
        tone: "blue",
      };
    });
  }

  if (title.includes("room")) {
    return data.landlordAssets.rooms.slice(0, 6).map((room) => {
      const building = data.landlordAssets.buildings.find((item) => item.id === room.buildingId);

      return {
        id: room.id,
        kind: "room",
        title: room.roomNumber,
        subtitle: `${building?.name || "Building"} - GHS ${Number(room.monthlyRent || 0).toLocaleString()}`,
        meta: room.status,
        icon: "key-outline",
        tone: room.status === "occupied" ? "emerald" : room.status === "maintenance" ? "amber" : "slate",
      };
    });
  }

  if (title.includes("property") || title.includes("portfolio")) {
    return data.landlordAssets.properties.slice(0, 6).map((property) => ({
      id: property.id,
      kind: "property",
      title: property.name,
      subtitle: `${property.city} - ${property.totalRooms || 0} rooms`,
      meta: property.status === "active" ? "Healthy" : property.status.replace(/_/g, " "),
      icon: "business-outline",
      tone: property.status === "active" ? "emerald" : "amber",
    }));
  }

  return data.stats.slice(0, 4).map((stat) => ({
    title: stat.label,
    subtitle: stat.change,
    meta: stat.value,
    icon: "analytics-outline",
    tone: "slate",
  }));
}

function Field({ label, value, onChangeText, placeholder, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: "default" | "numeric" }) {
  return (
    <View>
      <Text className="mb-2 text-xs font-bold uppercase text-slate-500">{label}</Text>
      <TextInput
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
      />
    </View>
  );
}

function findAssetRecord(data: MobileWorkspaceData, record: ModuleRecord | null): Property | Building | Room | Tenant | null {
  if (!record?.id || !record.kind) return null;
  if (record.kind === "property") return data.landlordAssets.properties.find((item) => item.id === record.id) || null;
  if (record.kind === "building") return data.landlordAssets.buildings.find((item) => item.id === record.id) || null;
  if (record.kind === "room") return data.landlordAssets.rooms.find((item) => item.id === record.id) || null;
  return data.landlordAssets.tenants.find((item) => item.id === record.id) || null;
}

function LandlordAssetForm({ moduleTitle, ownerId, data, editingRecord, onClearEditing, onSaved }: { moduleTitle: string; ownerId?: string; data: MobileWorkspaceData; editingRecord: ModuleRecord | null; onClearEditing: () => void; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyCode, setPropertyCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Accra");
  const [buildingName, setBuildingName] = useState("");
  const [floors, setFloors] = useState("1");
  const [roomNumber, setRoomNumber] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [roomType, setRoomType] = useState("single");

  const key = moduleTitle.toLowerCase();
  const isProperty = key.includes("propert");
  const isBuilding = key.includes("building");
  const isRoom = key.includes("room");
  const firstProperty = data.landlordAssets.properties[0];
  const firstBuilding = data.landlordAssets.buildings.find((building) => building.propertyId === firstProperty?.id) || data.landlordAssets.buildings[0];
  const assetRecord = findAssetRecord(data, editingRecord);
  const isEditing = Boolean(assetRecord);

  useEffect(() => {
    setDeleteArmed(false);
    setNotice("");

    if (!assetRecord) {
      setPropertyName("");
      setPropertyCode("");
      setAddress("");
      setCity("Accra");
      setBuildingName("");
      setFloors("1");
      setRoomNumber("");
      setMonthlyRent("");
      setRoomType("single");
      return;
    }

    if (editingRecord?.kind === "property") {
      const property = assetRecord as Property;
      setPropertyName(property.name || "");
      setPropertyCode(property.propertyCode || "");
      setAddress(property.address || "");
      setCity(property.city || "Accra");
    }

    if (editingRecord?.kind === "building") {
      const building = assetRecord as Building;
      setBuildingName(building.name || "");
      setFloors(String(building.numberOfFloors || 1));
    }

    if (editingRecord?.kind === "room") {
      const room = assetRecord as Room;
      setRoomNumber(room.roomNumber || "");
      setMonthlyRent(String(room.monthlyRent || ""));
      setRoomType(room.roomType || "single");
    }
  }, [assetRecord, editingRecord?.kind]);

  if (!isProperty && !isBuilding && !isRoom) return null;

  async function handleSave() {
    if (!ownerId) {
      setNotice("Sign in as a landlord before saving records.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      if (isProperty) {
        if (!propertyName.trim() || !propertyCode.trim() || !address.trim()) throw new Error("Property code, name, and address are required.");
        const payload = {
          ownerId,
          propertyCode: propertyCode.trim(),
          name: propertyName.trim(),
          propertyType: "apartment" as PropertyType,
          status: "active" as const,
          address: address.trim(),
          area: "",
          city: city.trim() || "Accra",
          region: "Greater Accra",
          country: "Ghana",
          description: "",
          latitude: null,
          longitude: null,
        };

        if (editingRecord?.kind === "property" && editingRecord.id) await updateProperty(editingRecord.id, payload);
        else await createProperty(payload);
      }

      if (isBuilding) {
        if (!firstProperty?.id) throw new Error("Create a property before adding buildings.");
        if (!buildingName.trim()) throw new Error("Building name is required.");
        const payload = { ownerId, propertyId: firstProperty.id, name: buildingName.trim(), numberOfFloors: Number(floors || 1) };

        if (editingRecord?.kind === "building" && editingRecord.id) await updateBuilding(editingRecord.id, payload);
        else await createBuilding(payload);
      }

      if (isRoom) {
        if (!firstProperty?.id || !firstBuilding?.id) throw new Error("Create a property and building before adding rooms.");
        if (!roomNumber.trim() || !monthlyRent.trim()) throw new Error("Room number and monthly rent are required.");
        const existingRoom = assetRecord as Room | null;
        const payload = {
          ownerId,
          propertyId: existingRoom?.propertyId || firstProperty.id,
          buildingId: existingRoom?.buildingId || firstBuilding.id,
          roomNumber: roomNumber.trim(),
          roomType: roomType as "single" | "double" | "shop" | "office" | "apartment" | "other",
          monthlyRent: Number(monthlyRent),
          status: (existingRoom?.status || "vacant") as RoomStatus,
        };

        if (editingRecord?.kind === "room" && editingRecord.id) await updateRoom(editingRecord.id, payload);
        else await createRoom(payload);
      }

      setNotice(`${moduleTitle} record ${isEditing ? "updated" : "created"}.`);
      onClearEditing();
      await onSaved();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not save this record."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingRecord?.id || !editingRecord.kind || !assetRecord) return;

    if (!deleteArmed) {
      setDeleteArmed(true);
      setNotice("Tap Delete again to confirm. This mirrors the web app confirmation step.");
      return;
    }

    setSaving(true);
    try {
      if (editingRecord.kind === "property") await deleteProperty(editingRecord.id);
      if (editingRecord.kind === "building") await deleteBuilding(editingRecord.id, (assetRecord as Building).propertyId);
      if (editingRecord.kind === "room") {
        const room = assetRecord as Room;
        await deleteRoom(editingRecord.id, room.propertyId, room.buildingId);
      }

      setNotice(`${moduleTitle} record deleted.`);
      onClearEditing();
      await onSaved();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not delete this record."));
    } finally {
      setSaving(false);
      setDeleteArmed(false);
    }
  }

  return (
    <>
      <SectionTitle title={`${isEditing ? "Edit" : "Create"} ${moduleTitle}`} action={isEditing ? "Editing" : "Live"} />
      <Panel>
        <View className="gap-4">
          {isProperty ? (
            <>
              <Field label="Property code" value={propertyCode} onChangeText={setPropertyCode} placeholder="PEMS-ACC-001" />
              <Field label="Property name" value={propertyName} onChangeText={setPropertyName} placeholder="East Legon Heights" />
              <Field label="Address" value={address} onChangeText={setAddress} />
              <Field label="City" value={city} onChangeText={setCity} />
            </>
          ) : null}

          {isBuilding ? (
            <>
              <StatusPill text={firstProperty?.name || "No property"} tone={firstProperty ? "blue" : "amber"} />
              <Field label="Building name" value={buildingName} onChangeText={setBuildingName} placeholder="Block A" />
              <Field label="Floors" value={floors} onChangeText={setFloors} keyboardType="numeric" />
            </>
          ) : null}

          {isRoom ? (
            <>
              <StatusPill text={firstBuilding?.name || "No building"} tone={firstBuilding ? "blue" : "amber"} />
              <Field label="Room number" value={roomNumber} onChangeText={setRoomNumber} placeholder="A-101" />
              <Field label="Room type" value={roomType} onChangeText={setRoomType} placeholder="single" />
              <Field label="Monthly rent" value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="numeric" />
            </>
          ) : null}

          {notice ? <Text className="text-sm font-semibold text-blue-700">{notice}</Text> : null}
          <Pressable disabled={saving} onPress={handleSave} className={`flex-row items-center justify-center rounded-lg py-3 ${saving ? "bg-slate-400" : "bg-blue-600"}`}>
            {saving ? <ActivityIndicator color="#ffffff" /> : <Icon name="save-outline" size={18} color="#ffffff" />}
            <Text className="ml-2 font-bold text-white">{saving ? "Saving..." : `${isEditing ? "Update" : "Save"} ${moduleTitle}`}</Text>
          </Pressable>

          {isEditing ? (
            <View className="flex-row gap-3">
              <Pressable disabled={saving} onPress={onClearEditing} className="flex-1 items-center rounded-lg border border-slate-200 bg-white py-3">
                <Text className="font-bold text-slate-700">Cancel edit</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={handleDelete} className={`flex-1 items-center rounded-lg py-3 ${deleteArmed ? "bg-rose-600" : "bg-rose-50"}`}>
                <Text className={`font-bold ${deleteArmed ? "text-white" : "text-rose-700"}`}>{deleteArmed ? "Confirm delete" : "Delete"}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Panel>
    </>
  );
}

function OptionButton({ active, title, subtitle, onPress }: { active: boolean; title: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`rounded-lg border p-3 ${active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="font-bold text-slate-950" numberOfLines={1}>{title}</Text>
          {subtitle ? <Text className="mt-1 text-xs font-semibold text-slate-500" numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <Icon name={active ? "checkmark-circle" : "ellipse-outline"} size={21} color={active ? "#2563eb" : "#94a3b8"} />
      </View>
    </Pressable>
  );
}

function LandlordTenantForm({ moduleTitle, ownerId, data, editingRecord, onClearEditing, onSaved }: { moduleTitle: string; ownerId?: string; data: MobileWorkspaceData; editingRecord: ModuleRecord | null; onClearEditing: () => void; onSaved: () => Promise<void> }) {
  const isTenantModule = moduleTitle.toLowerCase().includes("tenant");
  const tenantRecord = editingRecord?.kind === "tenant" ? (findAssetRecord(data, editingRecord) as Tenant | null) : null;
  const assignableRooms = data.landlordAssets.rooms.filter((room) => room.status === "vacant" || room.id === tenantRecord?.roomId);
  const fallbackRoom = assignableRooms[0] || data.landlordAssets.rooms[0];

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [tenantCode, setTenantCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState("");
  const [leaseEndDate, setLeaseEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [rentAdvanceMonths, setRentAdvanceMonths] = useState("1");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [nextRentDueDate, setNextRentDueDate] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [profileUpdateAllowed, setProfileUpdateAllowed] = useState(false);

  const selectedRoom = data.landlordAssets.rooms.find((room) => room.id === selectedRoomId) || fallbackRoom;
  const selectedBuilding = data.landlordAssets.buildings.find((building) => building.id === selectedRoom?.buildingId);
  const selectedProperty = data.landlordAssets.properties.find((property) => property.id === selectedRoom?.propertyId);
  const isEditing = Boolean(tenantRecord);

  useEffect(() => {
    setDeleteArmed(false);
    setNotice("");

    if (!tenantRecord) {
      setTenantCode("");
      setFullName("");
      setEmail("");
      setPhone("");
      setGhanaCardNumber("");
      setOccupation("");
      setEmergencyContactName("");
      setEmergencyContactPhone("");
      setLeaseStartDate("");
      setLeaseEndDate("");
      setMonthlyRent(fallbackRoom?.monthlyRent ? String(fallbackRoom.monthlyRent) : "");
      setRentAdvanceMonths("1");
      setSecurityDeposit("");
      setNextRentDueDate("");
      setSelectedRoomId(fallbackRoom?.id || "");
      setProfileUpdateAllowed(false);
      return;
    }

    setTenantCode(tenantRecord.tenantCode || "");
    setFullName(tenantRecord.fullName || "");
    setEmail(tenantRecord.email || "");
    setPhone(tenantRecord.phone || "");
    setGhanaCardNumber(tenantRecord.ghanaCardNumber || "");
    setOccupation(tenantRecord.occupation || "");
    setEmergencyContactName(tenantRecord.emergencyContactName || "");
    setEmergencyContactPhone(tenantRecord.emergencyContactPhone || "");
    setLeaseStartDate(tenantRecord.leaseStartDate || "");
    setLeaseEndDate(tenantRecord.leaseEndDate || "");
    setMonthlyRent(String(tenantRecord.monthlyRent || ""));
    setRentAdvanceMonths(String(tenantRecord.rentAdvanceMonths || 1));
    setSecurityDeposit(String(tenantRecord.securityDeposit || ""));
    setNextRentDueDate(tenantRecord.nextRentDueDate || "");
    setSelectedRoomId(tenantRecord.roomId || fallbackRoom?.id || "");
    setProfileUpdateAllowed(Boolean(tenantRecord.profileUpdateAllowed));
  }, [tenantRecord, fallbackRoom?.id]);

  if (!isTenantModule) return null;

  function chooseRoom(room: Room) {
    setSelectedRoomId(room.id);
    if (!isEditing) setMonthlyRent(String(room.monthlyRent || ""));
  }

  async function handleSave() {
    if (!ownerId) {
      setNotice("Sign in as a landlord before saving tenant records.");
      return;
    }

    if (!selectedRoom || !selectedProperty || !selectedBuilding) {
      setNotice("Create a property, building, and available room before adding tenants.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      if (!fullName.trim() || !phone.trim() || !ghanaCardNumber.trim() || !occupation.trim()) throw new Error("Name, phone, Ghana Card, and occupation are required.");
      if (!leaseStartDate.trim() || !nextRentDueDate.trim() || !monthlyRent.trim()) throw new Error("Lease start, next due date, and monthly rent are required.");

      const payload = {
        tenantCode: tenantCode.trim() || undefined,
        ownerId,
        propertyId: selectedProperty.id,
        buildingId: selectedBuilding.id,
        roomId: selectedRoom.id,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        ghanaCardNumber: ghanaCardNumber.trim(),
        occupation: occupation.trim(),
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        leaseStartDate: leaseStartDate.trim(),
        leaseEndDate: leaseEndDate.trim() || undefined,
        monthlyRent: Number(monthlyRent),
        rentAdvanceMonths: Number(rentAdvanceMonths || 0),
        securityDeposit: Number(securityDeposit || 0),
        nextRentDueDate: nextRentDueDate.trim(),
      };

      if (isEditing && editingRecord?.id && tenantRecord) {
        await updateTenant(editingRecord.id, payload, tenantRecord.roomId);
        if (profileUpdateAllowed !== Boolean(tenantRecord.profileUpdateAllowed)) await updateTenantProfilePermission(editingRecord.id, profileUpdateAllowed);
      } else {
        await createTenant(payload);
      }

      setNotice(`Tenant record ${isEditing ? "updated" : "created"}.`);
      onClearEditing();
      await onSaved();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not save this tenant."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingRecord?.id || !tenantRecord) return;

    if (!deleteArmed) {
      setDeleteArmed(true);
      setNotice("Tap Delete again to confirm. The assigned room will be marked vacant.");
      return;
    }

    setSaving(true);
    try {
      await deleteTenant(editingRecord.id, tenantRecord.roomId);
      setNotice("Tenant record deleted.");
      onClearEditing();
      await onSaved();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not delete this tenant."));
    } finally {
      setSaving(false);
      setDeleteArmed(false);
    }
  }

  async function handlePermissionToggle() {
    if (!editingRecord?.id || !tenantRecord) return;
    const nextValue = !profileUpdateAllowed;
    setSaving(true);
    try {
      await updateTenantProfilePermission(editingRecord.id, nextValue);
      setProfileUpdateAllowed(nextValue);
      setNotice(nextValue ? "Tenant profile updates allowed." : "Tenant profile updates locked.");
      await onSaved();
    } catch (error) {
      setNotice(getFriendlyDataError(error, "Could not update profile permission."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionTitle title={`${isEditing ? "Edit" : "Create"} Tenant`} action={isEditing ? "Lease" : "Assign"} />
      <Panel>
        <View className="gap-4">
          <View className="rounded-lg bg-slate-50 p-3">
            <Text className="text-xs font-bold uppercase text-slate-500">Assigned room</Text>
            <Text className="mt-1 font-black text-slate-950" numberOfLines={1}>{selectedProperty?.name || "No property"}</Text>
            <Text className="mt-1 text-sm font-semibold text-slate-500" numberOfLines={1}>{selectedBuilding?.name || "No building"} - {selectedRoom?.roomNumber || "No room selected"}</Text>
          </View>

          <View className="gap-2">
            {(assignableRooms.length > 0 ? assignableRooms : data.landlordAssets.rooms).slice(0, 5).map((room) => {
              const building = data.landlordAssets.buildings.find((item) => item.id === room.buildingId);
              return (
                <OptionButton
                  key={room.id}
                  active={room.id === selectedRoom?.id}
                  title={`Room ${room.roomNumber}`}
                  subtitle={`${building?.name || "Building"} - GHS ${Number(room.monthlyRent || 0).toLocaleString()} - ${room.status}`}
                  onPress={() => chooseRoom(room)}
                />
              );
            })}
          </View>

          <Field label="Tenant code" value={tenantCode} onChangeText={setTenantCode} placeholder="Auto-generated if empty" />
          <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Ama Mensah" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="tenant@example.com" />
          <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+233..." />
          <Field label="Ghana Card" value={ghanaCardNumber} onChangeText={setGhanaCardNumber} placeholder="GHA-..." />
          <Field label="Occupation" value={occupation} onChangeText={setOccupation} />
          <Field label="Lease start" value={leaseStartDate} onChangeText={setLeaseStartDate} placeholder="2026-08-01" />
          <Field label="Lease end" value={leaseEndDate} onChangeText={setLeaseEndDate} placeholder="2027-07-31" />
          <Field label="Monthly rent" value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="numeric" />
          <Field label="Rent advance months" value={rentAdvanceMonths} onChangeText={setRentAdvanceMonths} keyboardType="numeric" />
          <Field label="Security deposit" value={securityDeposit} onChangeText={setSecurityDeposit} keyboardType="numeric" />
          <Field label="Next rent due" value={nextRentDueDate} onChangeText={setNextRentDueDate} placeholder="2026-09-01" />
          <Field label="Emergency contact" value={emergencyContactName} onChangeText={setEmergencyContactName} />
          <Field label="Emergency phone" value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} />

          {isEditing ? (
            <Pressable disabled={saving} onPress={handlePermissionToggle} className={`flex-row items-center justify-between rounded-lg border p-3 ${profileUpdateAllowed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <View className="min-w-0 flex-1">
                <Text className="font-bold text-slate-950">Tenant profile updates</Text>
                <Text className="mt-1 text-sm text-slate-500">{profileUpdateAllowed ? "Allowed" : "Locked"}</Text>
              </View>
              <Icon name={profileUpdateAllowed ? "lock-open-outline" : "lock-closed-outline"} size={22} color={profileUpdateAllowed ? "#047857" : "#64748b"} />
            </Pressable>
          ) : null}

          {notice ? <Text className="text-sm font-semibold text-blue-700">{notice}</Text> : null}
          <Pressable disabled={saving} onPress={handleSave} className={`flex-row items-center justify-center rounded-lg py-3 ${saving ? "bg-slate-400" : "bg-blue-600"}`}>
            {saving ? <ActivityIndicator color="#ffffff" /> : <Icon name="save-outline" size={18} color="#ffffff" />}
            <Text className="ml-2 font-bold text-white">{saving ? "Saving..." : `${isEditing ? "Update" : "Save"} Tenant`}</Text>
          </Pressable>

          {isEditing ? (
            <View className="flex-row gap-3">
              <Pressable disabled={saving} onPress={onClearEditing} className="flex-1 items-center rounded-lg border border-slate-200 bg-white py-3">
                <Text className="font-bold text-slate-700">Cancel edit</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={handleDelete} className={`flex-1 items-center rounded-lg py-3 ${deleteArmed ? "bg-rose-600" : "bg-rose-50"}`}>
                <Text className={`font-bold ${deleteArmed ? "text-white" : "text-rose-700"}`}>{deleteArmed ? "Confirm delete" : "Delete"}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Panel>
    </>
  );
}
function ModuleDetailPage({ role, data, module, ownerId, onSaved, onBack }: { role: Role; data: MobileWorkspaceData; module: ModuleRow; ownerId?: string; onSaved: () => Promise<void>; onBack: () => void }) {
  const [editingRecord, setEditingRecord] = useState<ModuleRecord | null>(null);
  const records = moduleRecords(module.title, data);

  return (
    <>
      <Pressable onPress={onBack} className="mb-4 flex-row items-center self-start rounded-lg bg-white px-3 py-2">
        <Icon name="chevron-back" size={18} color="#334155" />
        <Text className="ml-1 text-sm font-bold text-slate-700">Back to modules</Text>
      </Pressable>

      <PageHeader title={module.title} subtitle={module.subtitle} actionLabel="New action" icon={module.icon} />

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1">
          <StatCard label="Status" value={module.metric} change={roleLabels[role]} />
        </View>
        <View className="flex-1">
          <StatCard label="Mode" value={data.isPreview ? "Preview" : "Live"} change="Workspace data" />
        </View>
      </View>

      <SectionTitle title="Overview" action="Manage" />
      <Panel>
        <View className="flex-row items-start">
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <Icon name={module.icon} size={22} color="#2563eb" />
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="font-black text-slate-950">{module.title}</Text>
            <Text className="mt-1 text-sm leading-5 text-slate-500">This mobile page mirrors the enterprise web module with quick status, recent records, and field-ready actions.</Text>
          </View>
        </View>
      </Panel>

      {role === "landlord" ? <LandlordAssetForm moduleTitle={module.title} ownerId={ownerId} data={data} editingRecord={editingRecord} onClearEditing={() => setEditingRecord(null)} onSaved={onSaved} /> : null}
      {role === "landlord" ? <LandlordTenantForm moduleTitle={module.title} ownerId={ownerId} data={data} editingRecord={editingRecord} onClearEditing={() => setEditingRecord(null)} onSaved={onSaved} /> : null}

      <SectionTitle title="Recent records" action="View all" />
      <View className="gap-3">
        {records.length === 0 ? <EmptyList text={`No ${module.title.toLowerCase()} records found yet.`} /> : null}
        {records.map((record) => (
          <Panel key={`${module.title}-${record.title}-${record.meta}`}>
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                <Icon name={record.icon} size={22} color="#334155" />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text className="font-black capitalize text-slate-950" numberOfLines={1}>{record.title}</Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={2}>{record.subtitle}</Text>
              </View>
              <View className="items-end gap-2">
                <StatusPill text={record.meta} tone={record.tone} />
                {record.kind && role === "landlord" ? (
                    <Pressable onPress={() => setEditingRecord(record)} className="rounded-md bg-blue-50 px-3 py-1">
                      <Text className="text-xs font-bold text-blue-700">Edit</Text>
                    </Pressable>
                ) : null}
              </View>
            </View>
          </Panel>
        ))}
      </View>
    </>
  );
}

function MorePage({ role, data, onOpenModule }: { role: Role; data: MobileWorkspaceData; onOpenModule: (module: ModuleRow) => void }) {
  const modules = getModuleRows(role, data);

  return (
    <>
      <PageHeader title="More" subtitle="All remaining enterprise modules from the web app, shaped for mobile workflows." icon="menu-outline" />
      <SectionTitle title="Modules" action="All" />
      <View className="gap-3">
        {modules.map((item) => <ModuleCard key={item.title} item={item} onPress={() => onOpenModule(item)} />)}
      </View>
      <SectionTitle title="Inbox preview" action="Open" />
      <InboxPage data={data} compact />
    </>
  );
}

function InboxPage({ data, compact = false }: { data: MobileWorkspaceData; compact?: boolean }) {
  return (
    <>
      {!compact ? <PageHeader title="Inbox" subtitle="Notifications, tenant messages, caretaker updates, and finance alerts." actionLabel="Compose" icon="mail-outline" /> : null}
      {!compact ? <SectionTitle title="Messages" action="Unread" /> : null}
      <View className="gap-3">
        {data.inbox.length === 0 ? <EmptyList text="No messages or notifications found yet." /> : null}
        {data.inbox.map((message) => (
          <Panel key={`${message.from}-${message.subject}`}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="font-black capitalize text-slate-950" numberOfLines={1}>{message.from}</Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={2}>{message.subject}</Text>
              </View>
              <Text className="text-xs font-bold text-slate-400">{message.time}</Text>
            </View>
          </Panel>
        ))}
      </View>
    </>
  );
}

function TabButton({ tab, activeTab, label, icon, onPress }: { tab: Tab; activeTab: Tab; label: string; icon: string; onPress: (tab: Tab) => void }) {
  const active = tab === activeTab;

  return (
    <Pressable onPress={() => onPress(tab)} className="flex-1 items-center justify-center py-2">
      <Icon name={active ? icon.replace("-outline", "") : icon} size={23} color={active ? "#2563eb" : "#64748b"} />
      <Text className={`mt-1 text-[11px] font-bold ${active ? "text-blue-600" : "text-slate-500"}`}>{label}</Text>
    </Pressable>
  );
}

function Workspace({ session, onLogout }: { session: MobileSession; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("home");
  const [selectedModule, setSelectedModule] = useState<ModuleRow | null>(null);
  const [data, setData] = useState<MobileWorkspaceData>(previewWorkspaceData[session.role]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const currentTab = selectedModule ? { ...tabMeta.more, title: selectedModule.title } : tabMeta[tab];

  const handleTabChange = (nextTab: Tab) => {
    setSelectedModule(null);
    setTab(nextTab);
  };

  async function refreshWorkspaceData() {
    if (session.mode !== "live" || !session.profile) return;
    const liveData = await loadMobileWorkspaceData(session.role, session.profile);
    setData(liveData);
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setDataError("");
      setData(previewWorkspaceData[session.role]);

      if (session.mode !== "live" || !session.profile) return;

      setLoadingData(true);
      try {
        const liveData = await loadMobileWorkspaceData(session.role, session.profile);
        if (mounted) setData(liveData);
      } catch (error) {
        console.error("Could not load mobile workspace data", error);
        if (mounted) {
          setDataError("Live sign-in worked, but workspace data could not load. Please retry shortly.");
          if (!__DEV__) {
            setData({
              ...previewWorkspaceData[session.role],
              isPreview: false,
              stats: [],
              properties: [],
              payments: [],
              maintenance: [],
              inbox: [],
              landlordAssets: { properties: [], buildings: [], rooms: [], tenants: [] },
            });
          }
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [session]);

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <AppTopbar session={session} onLogout={onLogout} />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-28 pt-5">
        <Text className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">{currentTab.title}</Text>
        <View className="mb-4 gap-3">
          <DataStatus dataError={dataError} isPreview={data.isPreview} />
          {loadingData ? (
            <Panel>
              <View className="flex-row items-center">
                <ActivityIndicator color="#2563eb" />
                <Text className="ml-3 font-semibold text-slate-600">Loading live workspace data...</Text>
              </View>
            </Panel>
          ) : null}
        </View>
        {tab === "home" ? <DashboardPage role={session.role} data={data} /> : null}
        {tab === "portfolio" ? <PortfolioPage role={session.role} data={data} /> : null}
        {tab === "payments" ? <PaymentsPage role={session.role} data={data} /> : null}
        {tab === "maintenance" ? <MaintenancePage data={data} /> : null}
        {tab === "more" && selectedModule ? <ModuleDetailPage role={session.role} data={data} module={selectedModule} ownerId={session.profile?.id} onSaved={refreshWorkspaceData} onBack={() => setSelectedModule(null)} /> : null}
        {tab === "more" && !selectedModule ? <MorePage role={session.role} data={data} onOpenModule={setSelectedModule} /> : null}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-2 pb-3 pt-2">
        <View className="flex-row">
          <TabButton tab="home" activeTab={tab} label="Home" icon="grid-outline" onPress={handleTabChange} />
          {(session.role === "tenant" || canAccessFeature(session.role, "properties")) && <TabButton tab="portfolio" activeTab={tab} label={session.role === "tenant" ? "Room" : "Assets"} icon="business-outline" onPress={handleTabChange} />}
          {canAccessFeature(session.role, "payments") && <TabButton tab="payments" activeTab={tab} label="Pay" icon="card-outline" onPress={handleTabChange} />}
          {canAccessFeature(session.role, "maintenance") && <TabButton tab="maintenance" activeTab={tab} label="Fix" icon="construct-outline" onPress={handleTabChange} />}
          <TabButton tab="more" activeTab={tab} label="More" icon="menu-outline" onPress={handleTabChange} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setAuthLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile && getUserAccessState(profile) === "active") {
          setSession({ mode: "live", role: normalizeRole(profile.role), firebaseUser: currentUser, profile });
        } else if (profile && getUserAccessState(profile) === "pending") {
          setAuthError("Your tenant account is waiting for landlord approval.");
        } else if (profile) {
          setAuthError("This account is inactive or unavailable. Please contact the administrator.");
        }
      } catch (error) {
        console.error("Could not restore mobile session", error);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async ({ role, email, password }: LoginRequest) => {
    setAuthError("");

    if (!email && !password && __DEV__) {
      setSession({ mode: "preview", role });
      return;
    }

    if (!email || !password) {
      setAuthError("Enter both your email and password to sign in.");
      return;
    }

    setLoginLoading(true);
    try {
      const credential = await loginUser({ email, password });
      const profile = await getUserProfile(credential.user.uid);

      const accessState = getUserAccessState(profile);
      if (!profile || accessState === "missing" || accessState === "invalid") {
        throw new Error("Your account does not have a valid PEMS profile. Please contact the administrator.");
      }
      if (accessState === "pending") {
        throw new Error("Your tenant account is waiting for landlord approval.");
      }
      if (accessState !== "active") {
        throw new Error("This account is inactive. Please contact the administrator.");
      }

      setSession({ mode: "live", role: normalizeRole(profile.role), firebaseUser: credential.user, profile });
    } catch (error) {
      console.error("Could not sign in", error);
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (session?.mode === "live") await logoutUser().catch(() => undefined);
    setSession(null);
    setAuthError("");
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-100 px-6">
        <ActivityIndicator color="#2563eb" size="large" />
        <Text className="mt-4 text-center font-semibold text-slate-600">Preparing P.E.M.S. Mobile...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} loading={loginLoading} error={authError} />;
  }

  return <Workspace session={session} onLogout={handleLogout} />;
}

