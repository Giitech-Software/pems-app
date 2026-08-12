export type OnlinePaymentProvider = "paystack" | "hubtel" | "flutterwave";

export type OnlinePaymentMethod =
  | "mobile_money"
  | "card"
  | "bank_transfer";

export type PaymentRequestStatus =
  | "pending_provider_setup"
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export interface PaymentRequest {
  id: string;

  ownerId: string;
  tenantId: string;
  tenantUserId?: string;

  propertyId: string;
  buildingId: string;
  roomId: string;

  amount: number;
  currency: "GHS";
  paymentPurpose: "rent";

  provider: OnlinePaymentProvider;
  supportedMethods: OnlinePaymentMethod[];
  status: PaymentRequestStatus;

  providerReference: string;
  checkoutUrl?: string;
  providerAccessCode?: string;
  providerTransactionId?: string;
  providerResponse?: string;
  relatedPaymentId?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}