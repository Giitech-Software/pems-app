export type UserRole =
  | "super_admin"
  | "landlord"
  | "property_manager"
  | "tenant";

export interface User {
  id: string;

  fullName: string;
  email: string;
  phone?: string;

  role: UserRole;

  profileImage?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}