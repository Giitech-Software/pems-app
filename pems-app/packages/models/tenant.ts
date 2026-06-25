export interface Tenant {
  id: string;

  ownerId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;

  fullName: string;
  email?: string;
  phone: string;

  ghanaCardNumber?: string;
  occupation?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  leaseStartDate: string;
  leaseEndDate?: string;

  monthlyRent: number;
  rentAdvanceMonths?: number;
  securityDeposit?: number;

  nextRentDueDate: string;

  agreementId?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}