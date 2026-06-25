export type PropertyType =
  | "apartment"
  | "hostel"
  | "chamber_and_hall"
  | "single_room"
  | "self_contained"
  | "commercial"
  | "mixed_use"
  | "compound_house"
  | "other";

export type PropertyStatus =
  | "active"
  | "under_construction"
  | "inactive"
  | "archived"
  | "sold";

export interface PropertyDocument {
  name: string;
  fileUrl: string;
  fileType?: string;
  uploadedAt: string;
}

export interface Property {
  id: string;

  ownerId: string;
  managerIds?: string[];
  caretakerIds?: string[];

  propertyCode: string;

  name: string;
  description?: string;

  propertyType: PropertyType;
  status: PropertyStatus;

  address: string;
  area?: string;
  city: string;
  region?: string;
  country: string;
latitude?: number | null;
longitude?: number | null;

  imageUrls?: string[];
  documents?: PropertyDocument[];

  totalBuildings: number;
  totalRooms: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}