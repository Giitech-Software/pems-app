export type NotificationType =
  | "rent_due"
  | "payment_received"
  | "maintenance"
  | "system";

export interface Notification {
  id: string;

  userId: string;

  title: string;
  message: string;

  type: NotificationType;

  isRead: boolean;

  createdAt: string;
}