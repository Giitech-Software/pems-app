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
import type {
  Conversation,
  ConversationParticipant,
  ConversationStatus,
  Message,
} from "../models";
import { db } from "./firebase";
import { createNotification } from "./notificationService";

export interface CreateConversationData {
  ownerId: string;
  tenantId: string;
  participants: ConversationParticipant[];
  subject: string;
  firstMessage: string;
  senderId: string;
  recipientId: string;
}

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
}

export const createConversation = async (
  data: CreateConversationData
): Promise<string> => {
  const conversationRef = await addDoc(
    collection(db, COLLECTIONS.CONVERSATIONS),
    {
      ownerId: data.ownerId,
      tenantId: data.tenantId,
      participants: data.participants,
      subject: data.subject,
      status: "open" satisfies ConversationStatus,
      lastMessagePreview: data.firstMessage,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  await createMessage({
    conversationId: conversationRef.id,
    senderId: data.senderId,
    recipientId: data.recipientId,
    body: data.firstMessage,
  });

  return conversationRef.id;
};

export const createMessage = async (
  data: CreateMessageData
): Promise<string> => {
  const messageRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
    ...data,
    deliveryStatus: "sent",
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, data.conversationId), {
    lastMessagePreview: data.body,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (data.recipientId && data.recipientId !== data.senderId) {
    await createNotification({
      userId: data.recipientId,
      title: "New message",
      message: data.body,
      type: "message",
    });
  }

  return messageRef.id;
};

export const getConversationsByOwner = async (
  ownerId: string
): Promise<Conversation[]> => {
  const q = query(
    collection(db, COLLECTIONS.CONVERSATIONS),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Conversation[];
};

export const getConversationsByTenant = async (
  tenantId: string
): Promise<Conversation[]> => {
  const q = query(
    collection(db, COLLECTIONS.CONVERSATIONS),
    where("tenantId", "==", tenantId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Conversation[];
};

export const getMessagesByConversation = async (
  conversationId: string
): Promise<Message[]> => {
  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where("conversationId", "==", conversationId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];
};
