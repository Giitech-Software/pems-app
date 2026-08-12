import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "../constants";
import type { MaintenanceRequest, MaintenanceStatus } from "../models";
import { db } from "./firebase";

export interface CreateMaintenanceRequestData {
  ownerId: string;
  tenantId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;
  title: string;
  description: string;
  status?: MaintenanceStatus;
}

export const createMaintenanceRequest = async (
  data: CreateMaintenanceRequestData
): Promise<string> => {
  const requestRef = await addDoc(
    collection(db, COLLECTIONS.MAINTENANCE_REQUESTS),
    {
      ...data,
      status: data.status || "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return requestRef.id;
};

export const getMaintenanceRequestsByOwner = async (
  ownerId: string
): Promise<MaintenanceRequest[]> => {
  const q = query(
    collection(db, COLLECTIONS.MAINTENANCE_REQUESTS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MaintenanceRequest[];
};

export const getMaintenanceRequestsByPropertyIds = async (propertyIds: string[]): Promise<MaintenanceRequest[]> => {
  if (propertyIds.length === 0) return [];
  const chunks = Array.from({ length: Math.ceil(propertyIds.length / 10) }, (_, index) => propertyIds.slice(index * 10, index * 10 + 10));
  const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, COLLECTIONS.MAINTENANCE_REQUESTS), where("propertyId", "in", ids)))));
  return snapshots.flatMap((snapshot) => snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))) as MaintenanceRequest[];
};

export const getAllMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MAINTENANCE_REQUESTS));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MaintenanceRequest[];
};

export const getMaintenanceRequestsByTenant = async (
  tenantId: string
): Promise<MaintenanceRequest[]> => {
  const q = query(
    collection(db, COLLECTIONS.MAINTENANCE_REQUESTS),
    where("tenantId", "==", tenantId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MaintenanceRequest[];
};

export const updateMaintenanceRequestStatus = async (
  requestId: string,
  status: MaintenanceStatus
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.MAINTENANCE_REQUESTS, requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
};
