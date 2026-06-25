export type RentScheduleStatus =
  | "upcoming"
  | "due"
  | "partly_paid"
  | "paid"
  | "overdue";

export interface RentSchedule {
  id: string;

  ownerId: string;
  tenantId: string;

  propertyId: string;
  buildingId: string;
  roomId: string;

  amountDue: number;
  amountPaid: number;
  balance: number;

  currency: "GHS";

  dueDate: string;

  periodFrom: string;
  periodTo: string;

  status: RentScheduleStatus;

  createdAt: string;
  updatedAt: string;
}