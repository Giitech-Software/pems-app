import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";

import { COLLECTIONS } from "../constants";
import type {
  Notification,
  NotificationType,
  RentDueReminderStage,
} from "../models";
import { db } from "./firebase";

export interface CreateNotificationData {
  userId: string;
  ownerId?: string;
  tenantId?: string;
  title: string;
  message: string;
  type: NotificationType;
  rentReminderStage?: RentDueReminderStage;
  scheduledFor?: string;
}

export const createNotification = async (
  data: CreateNotificationData
): Promise<string> => {
  const notificationRef = await addDoc(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
    }
  );

  return notificationRef.id;
};

export const getNotificationsByOwner = async (
  ownerId: string
): Promise<Notification[]> => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notification[];
};

export const getNotificationsByUser = async (
  userId: string
): Promise<Notification[]> => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notification[];
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
    isRead: true,
  });
};
