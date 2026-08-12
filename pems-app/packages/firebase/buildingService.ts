import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { COLLECTIONS } from "../constants";
import type { Building } from "../models";

export interface CreateBuildingData {
  ownerId: string;
  propertyId: string;
  name: string;
  numberOfFloors: number;
  totalRooms?: number;
}

export const createBuilding = async (data: CreateBuildingData) => {
  const buildingRef = await addDoc(collection(db, COLLECTIONS.BUILDINGS), {
    ...data,
    totalRooms: data.totalRooms || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, data.propertyId), {
    totalBuildings: increment(1),
    updatedAt: serverTimestamp(),
  });

  return buildingRef.id;
};

export const getBuildingsByOwner = async (
  ownerId: string
): Promise<Building[]> => {
  const q = query(
    collection(db, COLLECTIONS.BUILDINGS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Building[];
};

export const updateBuilding = async (
  buildingId: string,
  data: Partial<CreateBuildingData>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.BUILDINGS, buildingId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBuilding = async (
  buildingId: string,
  propertyId: string
): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.BUILDINGS, buildingId));

  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, propertyId), {
    totalBuildings: increment(-1),
    updatedAt: serverTimestamp(),
  });
};

export const getBuildingsByPropertyIds = async (propertyIds: string[]): Promise<Building[]> => {
  if (propertyIds.length === 0) return [];
  const chunks = Array.from({ length: Math.ceil(propertyIds.length / 10) }, (_, index) => propertyIds.slice(index * 10, index * 10 + 10));
  const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, COLLECTIONS.BUILDINGS), where("propertyId", "in", ids)))));
  return snapshots.flatMap((snapshot) => snapshot.docs.map((buildingDoc) => ({ id: buildingDoc.id, ...buildingDoc.data() }))) as Building[];
};
