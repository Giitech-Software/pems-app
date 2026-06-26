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
import type { Room, RoomStatus } from "../models";

export interface CreateRoomData {
  ownerId: string;
  propertyId: string;
  buildingId: string;
  roomNumber: string;
  roomType: "single" | "double" | "shop" | "office" | "apartment" | "other";
  monthlyRent: number;
  status: RoomStatus;
}

export const createRoom = async (data: CreateRoomData) => {
  const roomRef = await addDoc(collection(db, COLLECTIONS.ROOMS), {
    ...data,
    tenantId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.BUILDINGS, data.buildingId), {
    totalRooms: increment(1),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, data.propertyId), {
    totalRooms: increment(1),
    updatedAt: serverTimestamp(),
  });

  return roomRef.id;
};

export const getRoomsByOwner = async (ownerId: string): Promise<Room[]> => {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
};

export const updateRoom = async (
  roomId: string,
  data: Partial<CreateRoomData>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.ROOMS, roomId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteRoom = async (
  roomId: string,
  propertyId: string,
  buildingId: string
): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId));

  await updateDoc(doc(db, COLLECTIONS.BUILDINGS, buildingId), {
    totalRooms: increment(-1),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, propertyId), {
    totalRooms: increment(-1),
    updatedAt: serverTimestamp(),
  });
};