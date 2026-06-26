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
import type { Property, PropertyType } from "../models";

export interface CreatePropertyData {
  ownerId: string;
  propertyCode: string;
  name: string;
  description?: string;
  propertyType: PropertyType;
  status?: "active" | "under_construction" | "inactive" | "archived" | "sold";
  address: string;
  area?: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const createProperty = async (data: CreatePropertyData) => {
  const propertyRef = await addDoc(collection(db, COLLECTIONS.PROPERTIES), {
    ...data,
    status: data.status || "active",
    managerIds: [],
    caretakerIds: [],
    imageUrls: [],
    documents: [],
    totalBuildings: 0,
    totalRooms: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return propertyRef.id;
};


export const getPropertiesByOwner = async (
  ownerId: string
): Promise<Property[]> => {
  const q = query(
    collection(db, COLLECTIONS.PROPERTIES),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Property[];
};
export const deleteProperty = async (propertyId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.PROPERTIES, propertyId));
};

export const updateProperty = async (
  propertyId: string,
  data: Partial<CreatePropertyData>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, propertyId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};