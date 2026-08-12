export type UserRole =
  | "super_admin"
  | "landlord"
  | "property_manager"
  | "tenant";

export interface User {
  id: string;

  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  organizationName?: string;

  role: UserRole;

  profileImage?: string;
  landlordEmail?: string;
  tenantAccessApproved?: boolean;
  subscriptionStatus?: "pending" | "active" | "suspended";
  approvedAt?: string;
  suspensionReason?: string;
  lastLoginAt?: string;
  createdBy?: string;
  bootstrapProvisioned?: boolean;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}
