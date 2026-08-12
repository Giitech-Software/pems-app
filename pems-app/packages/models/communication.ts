import type { UserRole } from "./user";

export type ConversationStatus = "open" | "archived";
export type MessageDeliveryStatus = "sent" | "delivered" | "read";

export interface ConversationParticipant {
  userId: string;
  role: UserRole;
  displayName: string;
}

export interface Conversation {
  id: string;

  ownerId: string;
  tenantId: string;

  participants: ConversationParticipant[];

  subject: string;
  status: ConversationStatus;

  lastMessagePreview?: string;
  lastMessageAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;

  conversationId: string;
  senderId: string;
  recipientId: string;

  body: string;
  deliveryStatus: MessageDeliveryStatus;

  readAt?: string;

  createdAt: string;
}
