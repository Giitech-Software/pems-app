import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import type { UserCredential } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { COLLECTIONS } from "../constants";
import type { User, UserRole } from "../models";

export interface RegisterUserData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  landlordEmail?: string;
}

export interface InitialSuperAdminData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  jobTitle?: string;
  organizationName?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface SuperAdminSetupState {
  isAvailable: boolean;
  isLocked: boolean;
  adminEmail?: string;
}

export type UserAccessState =
  | "active"
  | "pending"
  | "suspended"
  | "inactive"
  | "invalid"
  | "missing";

export const isSupportedUserRole = (role: unknown): role is UserRole =>
  role === "super_admin" ||
  role === "landlord" ||
  role === "property_manager" ||
  role === "tenant";

export const getUserAccessState = (profile: User | null): UserAccessState => {
  if (!profile) return "missing";
  if (!isSupportedUserRole(profile.role)) return "invalid";
  if (profile.isActive === false) return "inactive";
  if (profile.subscriptionStatus === "suspended") return "suspended";
  if (profile.role === "tenant" && profile.tenantAccessApproved === false) {
    return "pending";
  }
  return "active";
};

export const getFriendlyAuthError = (error: unknown): string => {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait a few minutes and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact the administrator.";
    case "auth/network-request-failed":
      return "Network connection failed. Check your internet connection and try again.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "Your account signed in, but its PEMS profile could not be accessed. Contact the administrator.";
    default:
      return "Unable to sign in right now. Please verify your details and try again.";
  }
};

export const getFriendlyDataError = (error: unknown, fallback: string): string => {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";

  if (code === "permission-denied" || code === "firestore/permission-denied") {
    return "You have view-only access to this record, or it is outside your assigned workspace.";
  }
  if (code === "unavailable" || code === "failed-precondition") {
    return "The service is temporarily unavailable. Please try again shortly.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const SUPER_ADMIN_BOOTSTRAP_DOC_ID = "superAdminBootstrap";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const registerUser = async (
  data: RegisterUserData
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  const firebaseUser = userCredential.user;

  const userProfile: Omit<User, "createdAt" | "updatedAt"> = {
    id: firebaseUser.uid,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || "",
    role: data.role || "landlord",
    landlordEmail: data.landlordEmail || "",
    tenantAccessApproved: data.role === "tenant" ? false : true,
    subscriptionStatus: data.role === "landlord" ? "pending" : "active",
    isActive: true,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userCredential;
};

export const getSuperAdminSetupState = async (): Promise<SuperAdminSetupState> => {
  const bootstrapSnap = await getDoc(
    doc(db, COLLECTIONS.SYSTEM, SUPER_ADMIN_BOOTSTRAP_DOC_ID)
  );

  if (bootstrapSnap.exists()) {
    const bootstrapData = bootstrapSnap.data();

    return {
      isAvailable: false,
      isLocked: true,
      adminEmail: typeof bootstrapData.adminEmail === "string" ? bootstrapData.adminEmail : undefined,
    };
  }

  const admins = await getUsersByRole("super_admin");

  return {
    isAvailable: admins.length === 0,
    isLocked: admins.length > 0,
    adminEmail: admins[0]?.email,
  };
};

export const createInitialSuperAdmin = async (
  data: InitialSuperAdminData
): Promise<UserCredential> => {
  const existingAdmins = await getUsersByRole("super_admin");

  if (existingAdmins.length > 0) {
    throw new Error("SUPER_ADMIN_ALREADY_EXISTS");
  }

  const normalizedEmail = normalizeEmail(data.email);
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    data.password
  );

  try {
    const firebaseUser = userCredential.user;
    const bootstrapRef = doc(db, COLLECTIONS.SYSTEM, SUPER_ADMIN_BOOTSTRAP_DOC_ID);
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);

    await runTransaction(db, async (transaction) => {
      const bootstrapSnap = await transaction.get(bootstrapRef);

      if (bootstrapSnap.exists()) {
        throw new Error("SUPER_ADMIN_BOOTSTRAP_LOCKED");
      }

      const userProfile: Omit<User, "createdAt" | "updatedAt"> = {
        id: firebaseUser.uid,
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        phone: data.phone?.trim() || "",
        jobTitle: data.jobTitle?.trim() || "Platform Administrator",
        organizationName: data.organizationName?.trim() || "",
        role: "super_admin",
        landlordEmail: "",
        tenantAccessApproved: true,
        subscriptionStatus: "active",
        isActive: true,
        createdBy: "system_bootstrap",
        bootstrapProvisioned: true,
      };

      transaction.set(userRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      transaction.set(bootstrapRef, {
        status: "completed",
        adminUserId: firebaseUser.uid,
        adminEmail: normalizedEmail,
        organizationName: userProfile.organizationName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return userCredential;
  } catch (error) {
    await deleteUser(userCredential.user).catch(() => undefined);
    throw error;
  }
};

export const loginUser = async (
  data: LoginUserData
): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);

  await updateDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userCredential;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as User;
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", role));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((userDoc) => ({
    id: userDoc.id,
    ...userDoc.data(),
  }) as User);
};

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));

  return snapshot.docs.map((userDoc) => ({
    id: userDoc.id,
    ...userDoc.data(),
  }) as User);
};

export const updateUserAccount = async (
  userId: string,
  data: Partial<Pick<User, "fullName" | "phone" | "profileImage" | "isActive" | "subscriptionStatus" | "role" | "approvedAt" | "suspensionReason">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<User, "fullName" | "phone" | "profileImage" | "isActive">>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
