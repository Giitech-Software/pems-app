import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { COLLECTIONS } from "../constants";
import type {
  Payment,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
} from "../models";
import { createNotification } from "./notificationService";

export interface CreatePaymentData {
  ownerId: string;
  tenantId: string;
  tenantUserId?: string;
  propertyId: string;
  buildingId: string;
  roomId: string;

  amount: number;
  currency: "GHS";

  paymentPurpose: PaymentPurpose;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;

  paymentDate: string;

  periodCoveredFrom?: string;
  periodCoveredTo?: string;

  referenceNumber?: string;
  receiptNumber?: string;
  receiptIssuedAt?: string;
  notes?: string;
}

export const createPayment = async (data: CreatePaymentData) => {
  const { tenantUserId, ...paymentData } = data;
  const paymentStatus = paymentData.paymentStatus || "confirmed";
  const receiptIssuedAt =
    paymentStatus === "confirmed" ? paymentData.receiptIssuedAt || new Date().toISOString() : "";

  const paymentRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
    ...paymentData,
    paymentStatus,
    receiptIssuedAt,
    createdAt: serverTimestamp(),
  });

  if (tenantUserId && paymentStatus === "confirmed") {
    await createNotification({
      userId: tenantUserId,
      ownerId: data.ownerId,
      tenantId: data.tenantId,
      title: "Payment confirmed",
      message: `Your ${data.currency} ${Number(data.amount || 0).toLocaleString()} payment has been confirmed. Receipt ${data.receiptNumber || paymentRef.id} is ready for download.`,
      type: "payment_received",
    });
  }

  return paymentRef.id;
};

export const getPaymentsByOwner = async (
  ownerId: string
): Promise<Payment[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAYMENTS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];
};

export const getPaymentsByPropertyIds = async (propertyIds: string[]): Promise<Payment[]> => {
  if (propertyIds.length === 0) return [];
  const chunks = Array.from({ length: Math.ceil(propertyIds.length / 10) }, (_, index) => propertyIds.slice(index * 10, index * 10 + 10));
  const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(collection(db, COLLECTIONS.PAYMENTS), where("propertyId", "in", ids)))));
  return snapshots.flatMap((snapshot) => snapshot.docs.map((paymentDoc) => ({ id: paymentDoc.id, ...paymentDoc.data() }))) as Payment[];
};

export const getAllPayments = async (): Promise<Payment[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.PAYMENTS));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];
};

export const getPaymentsByTenant = async (
  tenantId: string
): Promise<Payment[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAYMENTS),
    where("tenantId", "==", tenantId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];
};
