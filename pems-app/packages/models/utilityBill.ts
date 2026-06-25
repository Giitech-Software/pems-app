export type UtilityType =
  | "electricity"
  | "water"
  | "waste"
  | "security"
  | "cleaning"
  | "internet"
  | "other";

export type UtilityBillStatus =
  | "unpaid"
  | "partly_paid"
  | "paid"
  | "overdue";

export interface UtilityBill {
  id: string;

  ownerId: string;
  tenantId?: string;

  propertyId: string;
  buildingId?: string;
  roomId?: string;

  utilityType: UtilityType;

  amount: number;
  currency: "GHS";

  billingMonth: string;
  dueDate: string;

  status: UtilityBillStatus;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}