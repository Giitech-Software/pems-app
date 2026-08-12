export interface Tenant {
  id: string;
  tenantCode?: string;
  userId?: string;
  ownerId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;

  fullName: string;
  email?: string;
  phone: string;

  ghanaCardNumber: string;
  occupation: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  leaseStartDate: string;
  leaseEndDate?: string;

  monthlyRent: number;
  rentAdvanceMonths?: number;
  securityDeposit?: number;

  nextRentDueDate: string;

  agreementId?: string;
  profileUpdateAllowed?: boolean;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export function getTenantDisplayId(tenant: Pick<Tenant, "id" | "tenantCode">) {
  return tenant.tenantCode || `TEN-${tenant.id.slice(0, 6).toUpperCase()}`;
}
