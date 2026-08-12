export type NotificationType =
  | "rent_due"
  | "payment_received"
  | "maintenance"
  | "message"
  | "system";

export type RentDueReminderStage =
  | "three_months"
  | "one_month"
  | "one_week"
  | "three_days"
  | "due_day";

export const RENT_DUE_REMINDER_SCHEDULE: Array<{
  stage: RentDueReminderStage;
  label: string;
  daysBeforeDue: number;
}> = [
  { stage: "three_months", label: "3 months before due date", daysBeforeDue: 90 },
  { stage: "one_month", label: "1 month before due date", daysBeforeDue: 30 },
  { stage: "one_week", label: "1 week before due date", daysBeforeDue: 7 },
  { stage: "three_days", label: "3 days before due date", daysBeforeDue: 3 },
  { stage: "due_day", label: "Due day", daysBeforeDue: 0 },
];

export interface Notification {
  id: string;

  userId: string;
  ownerId?: string;
  tenantId?: string;

  title: string;
  message: string;

  type: NotificationType;
  rentReminderStage?: RentDueReminderStage;
  scheduledFor?: string;
  deliveredAt?: string;

  isRead: boolean;

  createdAt: string;
}
