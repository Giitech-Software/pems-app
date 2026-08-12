export type TenantLinkRequestStatus = "pending" | "approved" | "rejected";

export interface TenantLinkRequest {
  id: string;
  userId?: string;
  ownerId?: string;
  ownerEmail?: string;
  fullName: string;
  email?: string;
  phone: string;
  ghanaCardNumber: string;
  occupation: string;
  status: TenantLinkRequestStatus;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}
