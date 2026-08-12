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
import type { TenantLinkRequest } from "../models";
import { createTenant } from "./tenantService";

export interface CreateTenantLinkRequestData {
  userId?: string;
  ownerId?: string;
  ownerEmail?: string;
  fullName: string;
  email?: string;
  phone: string;
  ghanaCardNumber: string;
  occupation: string;
  status?: "pending" | "approved" | "rejected";
  tenantId?: string;
}

export const createTenantLinkRequest = async (data: CreateTenantLinkRequestData) => {
  const requestRef = await addDoc(collection(db, COLLECTIONS.TENANT_LINK_REQUESTS), {
    ...data,
    status: data.status || "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return requestRef.id;
};

export const getTenantLinkRequestsByOwnerEmail = async (
  ownerEmail: string
): Promise<TenantLinkRequest[]> => {
  const q = query(
    collection(db, COLLECTIONS.TENANT_LINK_REQUESTS),
    where("ownerEmail", "==", ownerEmail),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  })) as TenantLinkRequest[];
};

export const approveTenantLinkRequest = async (
  requestId: string,
  ownerId: string,
  request: TenantLinkRequest
): Promise<void> => {
  const tenantId = await createTenant({
    userId: request.userId || "",
    ownerId,
    propertyId: "",
    buildingId: "",
    roomId: "",
    fullName: request.fullName,
    email: request.email,
    phone: request.phone,
    ghanaCardNumber: request.ghanaCardNumber,
    occupation: request.occupation,
    leaseStartDate: "",
    monthlyRent: 0,
    nextRentDueDate: "",
  });

  if (request.userId) {
    await updateDoc(doc(db, COLLECTIONS.USERS, request.userId), {
      tenantAccessApproved: true,
      updatedAt: serverTimestamp(),
    });
  }

  await updateDoc(doc(db, COLLECTIONS.TENANT_LINK_REQUESTS, requestId), {
    status: "approved",
    tenantId,
    updatedAt: serverTimestamp(),
  });
};

export const rejectTenantLinkRequest = async (
  requestId: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TENANT_LINK_REQUESTS, requestId), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
};

export const deleteTenantLinkRequest = async (
  requestId: string
): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.TENANT_LINK_REQUESTS, requestId));
};
