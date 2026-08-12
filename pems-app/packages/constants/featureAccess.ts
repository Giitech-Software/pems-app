import type { UserRole } from "../models";

export type PemsFeature =
  | "dashboard"
  | "properties"
  | "buildings"
  | "rooms"
  | "tenants"
  | "payments"
  | "maintenance"
  | "messages"
  | "reports"
  | "notifications"
  | "profile"
  | "settings"
  | "administration";

/** The single source of truth for feature visibility in web and mobile clients. */
export const FEATURE_ACCESS: Record<PemsFeature, readonly UserRole[]> = {
  dashboard: ["landlord", "property_manager", "tenant", "super_admin"],
  properties: ["landlord", "property_manager", "super_admin"],
  buildings: ["landlord", "property_manager", "super_admin"],
  rooms: ["landlord", "property_manager", "super_admin"],
  tenants: ["landlord", "property_manager", "super_admin"],
  payments: ["landlord", "property_manager", "tenant", "super_admin"],
  maintenance: ["landlord", "property_manager", "tenant", "super_admin"],
  messages: ["landlord", "property_manager", "tenant", "super_admin"],
  reports: ["landlord", "property_manager", "super_admin"],
  notifications: ["landlord", "property_manager", "tenant", "super_admin"],
  profile: ["landlord", "property_manager", "tenant", "super_admin"],
  settings: ["landlord", "property_manager", "super_admin"],
  administration: ["super_admin"],
};

export const canAccessFeature = (role: UserRole, feature: PemsFeature): boolean =>
  FEATURE_ACCESS[feature].includes(role);
