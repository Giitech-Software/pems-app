import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { COLLECTIONS } from "../constants";
import type { UserSettings } from "../models";
import { db } from "./firebase";

export type UpdateUserSettingsData = Omit<
  UserSettings,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export const defaultUserSettings: UpdateUserSettingsData = {
  rentDueReminders: true,
  paymentConfirmationAlerts: true,
  maintenanceStatusNotifications: true,
  monthlyReportDigest: true,
  defaultRentGraceDays: 0,
  defaultCurrency: "GHS",
};

export interface PlatformSettings {
  accountSuspensionPolicy: boolean;
  notificationDefaults: boolean;
  paymentAuditThreshold: boolean;
  supportEscalationWindow: boolean;
}

export const defaultPlatformSettings: PlatformSettings = {
  accountSuspensionPolicy: true,
  notificationDefaults: true,
  paymentAuditThreshold: true,
  supportEscalationWindow: true,
};

const PLATFORM_SETTINGS_DOC_ID = "platformSettings";

export const getUserSettings = async (
  userId: string
): Promise<UserSettings> => {
  const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
  const settingsSnap = await getDoc(settingsRef);

  if (!settingsSnap.exists()) {
    return {
      id: userId,
      userId,
      ...defaultUserSettings,
      createdAt: "",
      updatedAt: "",
    };
  }

  return {
    id: settingsSnap.id,
    userId,
    ...settingsSnap.data(),
  } as UserSettings;
};

export const updateUserSettings = async (
  userId: string,
  data: UpdateUserSettingsData
): Promise<void> => {
  await setDoc(
    doc(db, COLLECTIONS.USER_SETTINGS, userId),
    {
      userId,
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  const settingsRef = doc(db, COLLECTIONS.SYSTEM, PLATFORM_SETTINGS_DOC_ID);
  const settingsSnap = await getDoc(settingsRef);

  if (!settingsSnap.exists()) {
    return defaultPlatformSettings;
  }

  return {
    ...defaultPlatformSettings,
    ...settingsSnap.data(),
  } as PlatformSettings;
};

export const updatePlatformSettings = async (
  data: PlatformSettings
): Promise<void> => {
  await setDoc(
    doc(db, COLLECTIONS.SYSTEM, PLATFORM_SETTINGS_DOC_ID),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
