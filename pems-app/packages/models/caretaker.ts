export interface Caretaker {
  id: string;

  ownerId: string;
  propertyIds: string[];

  fullName: string;
  phone: string;
  email?: string;

  roleDescription?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}