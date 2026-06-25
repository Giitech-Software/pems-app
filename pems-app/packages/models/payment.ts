export type PaymentMethod =
  | "cash"
  | "momo"
  | "bank_transfer"
  | "card"
  | "cheque";

export type PaymentPurpose =
  | "rent"
  | "security_deposit"
  | "utility_bill"
  | "maintenance_fee"
  | "other";

export interface Payment {
  id: string;

  ownerId: string;
  tenantId: string;

  propertyId: string;
  buildingId: string;
  roomId: string;

  amount: number;
  currency: "GHS";

  paymentPurpose: PaymentPurpose;
  paymentMethod: PaymentMethod;

  paymentDate: string;

  periodCoveredFrom?: string;
  periodCoveredTo?: string;

  referenceNumber?: string;
  receiptNumber?: string;

  notes?: string;

  createdAt: string;
}