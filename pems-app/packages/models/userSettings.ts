export interface UserSettings {
  id: string;
  userId: string;

  rentDueReminders: boolean;
  paymentConfirmationAlerts: boolean;
  maintenanceStatusNotifications: boolean;
  monthlyReportDigest: boolean;

  defaultRentGraceDays: number;
  defaultCurrency: "GHS";

  createdAt: string;
  updatedAt: string;
}
