import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { COLLECTIONS } from "../constants";
import { getTenantDisplayId, type Tenant } from "../models";

export interface CreateTenantData {
  userId?: string;
  tenantCode?: string;
  ownerId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;

  fullName: string;
  email?: string;
  phone: string;

  ghanaCardNumber: string;
  occupation: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  leaseStartDate: string;
  leaseEndDate?: string;

  monthlyRent: number;
  rentAdvanceMonths?: number;
  securityDeposit?: number;

  nextRentDueDate: string;
}

export const createTenant = async (data: CreateTenantData) => {
  const tenantRef = await addDoc(collection(db, COLLECTIONS.TENANTS), {
    ...data,
    tenantCode: data.tenantCode || "",
    agreementId: null,
    profileUpdateAllowed: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.TENANTS, tenantRef.id), {
    tenantCode: data.tenantCode || getTenantDisplayId({ id: tenantRef.id }),
    updatedAt: serverTimestamp(),
  });

  if (data.roomId) {
    await updateDoc(doc(db, COLLECTIONS.ROOMS, data.roomId), {
      tenantId: tenantRef.id,
      status: "occupied",
      updatedAt: serverTimestamp(),
    });
  }

  return tenantRef.id;
};

export const getTenantsByOwner = async (
  ownerId: string
): Promise<Tenant[]> => {
  const q = query(
    collection(db, COLLECTIONS.TENANTS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Tenant[];
};

export const getTenantsByPropertyIds = async (propertyIds: string[]): Promise<Tenant[]> => {
  if (propertyIds.length === 0) return [];
  const chunks = Array.from({ length: Math.ceil(propertyIds.length / 10) }, (_, index) => propertyIds.slice(index * 10, index * 10 + 10));
  const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, COLLECTIONS.TENANTS), where("propertyId", "in", ids)))));
  return snapshots.flatMap((snapshot) => snapshot.docs.map((tenantDoc) => ({ id: tenantDoc.id, ...tenantDoc.data() }))) as Tenant[];
};

export const getAllTenants = async (): Promise<Tenant[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.TENANTS));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Tenant[];
};

export const updateTenant = async (
  tenantId: string,
  data: Partial<CreateTenantData>,
  previousRoomId?: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TENANTS, tenantId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

  if (data.roomId && previousRoomId && data.roomId !== previousRoomId) {
    await updateDoc(doc(db, COLLECTIONS.ROOMS, previousRoomId), {
      tenantId: null,
      status: "vacant",
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, COLLECTIONS.ROOMS, data.roomId), {
      tenantId,
      status: "occupied",
      updatedAt: serverTimestamp(),
    });
  }
};


export const updateTenantProfilePermission = async (
  tenantId: string,
  profileUpdateAllowed: boolean
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TENANTS, tenantId), {
    profileUpdateAllowed,
    updatedAt: serverTimestamp(),
  });
};
export const deleteTenant = async (
  tenantId: string,
  roomId: string
): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.TENANTS, tenantId));

  await updateDoc(doc(db, COLLECTIONS.ROOMS, roomId), {
    tenantId: null,
    status: "vacant",
    updatedAt: serverTimestamp(),
  });
};
export const getTenantByUserId = async (
  userId: string
): Promise<Tenant | null> => {
  const q = query(
    collection(db, COLLECTIONS.TENANTS),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const tenantDoc = snapshot.docs[0];

  return {
    id: tenantDoc.id,
    ...tenantDoc.data(),
  } as Tenant;
};
