export type AgreementStatus =
  | "draft"
  | "active"
  | "expired"
  | "terminated";

export interface TenancyAgreement {
  id: string;

  ownerId: string;
  tenantId: string;

  propertyId: string;
  buildingId: string;
  roomId: string;

  agreementStartDate: string;
  agreementEndDate?: string;

  monthlyRent: number;
  currency: "GHS";

  rentAdvanceMonths: number;
  securityDeposit?: number;

  agreementFileUrl?: string;

  status: AgreementStatus;

  createdAt: string;
  updatedAt: string;
}