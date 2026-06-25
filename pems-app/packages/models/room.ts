export type RoomStatus =
  | "occupied"
  | "vacant"
  | "reserved"
  | "maintenance";

export interface Room {
  id: string;

  propertyId: string;
  buildingId: string;

  roomNumber: string;

  roomType:
    | "single"
    | "double"
    | "shop"
    | "office"
    | "apartment"
    | "other";

  monthlyRent: number;

  status: RoomStatus;

  tenantId?: string;

  createdAt: string;
  updatedAt: string;
}