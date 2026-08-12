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
  OnlinePaymentMethod,
  OnlinePaymentProvider,
  PaymentRequest,
  PaymentRequestStatus,
} from "../models";
import { db } from "./firebase";

export interface CreatePaymentRequestData {
  ownerId: string;
  tenantId: string;
  tenantUserId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;
  amount: number;
  currency: "GHS";
  provider: OnlinePaymentProvider;
  supportedMethods: OnlinePaymentMethod[];
  providerReference: string;
  checkoutUrl?: string;
  notes?: string;
}

export const createPaymentRequest = async (
  data: CreatePaymentRequestData
): Promise<string> => {
  const requestRef = await addDoc(
    collection(db, COLLECTIONS.PAYMENT_REQUESTS),
    {
      ...data,
      paymentPurpose: "rent",
      status: data.checkoutUrl ? "pending" : "pending_provider_setup",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return requestRef.id;
};

export const getPaymentRequestsByTenant = async (
  tenantId: string
): Promise<PaymentRequest[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAYMENT_REQUESTS),
    where("tenantId", "==", tenantId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PaymentRequest[];
};

export const getPaymentRequestsByOwner = async (
  ownerId: string
): Promise<PaymentRequest[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAYMENT_REQUESTS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PaymentRequest[];
};

export const updatePaymentRequestStatus = async (
  paymentRequestId: string,
  status: PaymentRequestStatus,
  relatedPaymentId?: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.PAYMENT_REQUESTS, paymentRequestId), {
    status,
    relatedPaymentId: relatedPaymentId || null,
    updatedAt: serverTimestamp(),
  });
};
