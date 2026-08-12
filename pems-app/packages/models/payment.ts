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

export type PaymentStatus = "pending" | "confirmed";

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
  paymentStatus?: PaymentStatus;

  paymentDate: string;

  periodCoveredFrom?: string;
  periodCoveredTo?: string;

  referenceNumber?: string;
  receiptNumber?: string;
  receiptIssuedAt?: string;

  provider?: string;
  providerTransactionId?: string;
  providerReference?: string;
  providerResponse?: string;

  notes?: string;

  createdAt: string;
}