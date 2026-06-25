import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import type { UserCredential } from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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
}

export interface LoginUserData {
  email: string;
  password: string;
}

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
    isActive: true,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userCredential;
};

export const loginUser = async (
  data: LoginUserData
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, data.email, data.password);
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