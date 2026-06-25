export type MaintenanceStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface MaintenanceRequest {
  id: string;

  tenantId: string;

  propertyId: string;
  buildingId: string;
  roomId: string;

  title: string;
  description: string;

  status: MaintenanceStatus;

  createdAt: string;
  updatedAt: string;
}