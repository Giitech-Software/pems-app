import { createHmac } from "node:crypto";
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";

admin.initializeApp();

const db = admin.firestore();
const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");
const paystackWebhookSecret = defineSecret("PAYSTACK_WEBHOOK_SECRET");
const appWebOrigin = defineString("APP_WEB_ORIGIN", {
  default: "http://localhost:5173",
});

const COLLECTIONS = {
  PAYMENT_REQUESTS: "paymentRequests",
  PAYMENTS: "payments",
  TENANTS: "tenants",
  NOTIFICATIONS: "notifications",
} as const;

interface PaymentRequestRecord {
  ownerId: string;
  tenantId: string;
  tenantUserId?: string;
  propertyId: string;
  buildingId: string;
  roomId: string;
  amount: number;
  currency: "GHS";
  paymentPurpose: "rent";
  provider: "paystack" | "hubtel" | "flutterwave";
  providerReference: string;
  status: string;
  checkoutUrl?: string;
  relatedPaymentId?: string;
}

interface TenantRecord {
  userId?: string;
  ownerId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackWebhookPayload {
  event?: string;
  data?: {
    id?: number;
    reference?: string;
    status?: string;
    amount?: number;
    paid_at?: string;
    channel?: string;
    gateway_response?: string;
    authorization?: {
      channel?: string;
      card_type?: string;
      bank?: string;
    };
  };
}

function applyCors(response: { set: (field: string, value: string) => void }) {
  response.set("Access-Control-Allow-Origin", appWebOrigin.value());
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function generateReceiptNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PEMS-${datePart}-${randomPart}`;
}

function toPaymentMethod(channel?: string): "cash" | "momo" | "bank_transfer" | "card" | "cheque" {
  const normalized = channel?.toLowerCase() || "card";

  if (normalized.includes("mobile") || normalized.includes("momo")) {
    return "momo";
  }

  if (normalized.includes("bank") || normalized.includes("transfer")) {
    return "bank_transfer";
  }

  return "card";
}

async function verifyBearerToken(authorizationHeader?: string) {
  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : "";

  if (!token) {
    throw new Error("Missing authorization token.");
  }

  return admin.auth().verifyIdToken(token);
}

async function assertPaymentRequestMatchesTenant(
  paymentRequest: PaymentRequestRecord,
  uid: string
) {
  if (!paymentRequest.tenantUserId || paymentRequest.tenantUserId !== uid) {
    throw new Error("You cannot initialize this payment request.");
  }

  if (!paymentRequest.tenantId) {
    throw new Error("Payment request is missing tenant information.");
  }

  if (!Number.isFinite(Number(paymentRequest.amount)) || Number(paymentRequest.amount) <= 0) {
    throw new Error("Payment request amount is invalid.");
  }

  const tenantDoc = await db.collection(COLLECTIONS.TENANTS).doc(paymentRequest.tenantId).get();

  if (!tenantDoc.exists) {
    throw new Error("Tenant record not found for this payment request.");
  }

  const tenant = tenantDoc.data() as TenantRecord;

  if (tenant.userId !== uid) {
    throw new Error("This tenant record is not linked to your account.");
  }

  const fieldsMatch =
    paymentRequest.ownerId === tenant.ownerId &&
    paymentRequest.propertyId === tenant.propertyId &&
    paymentRequest.buildingId === tenant.buildingId &&
    paymentRequest.roomId === tenant.roomId;

  if (!fieldsMatch) {
    throw new Error("Payment request does not match the tenant record.");
  }
}

async function findPaymentRequestByReference(reference: string) {
  const snapshot = await db
    .collection(COLLECTIONS.PAYMENT_REQUESTS)
    .where("providerReference", "==", reference)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];

  return {
    id: doc.id,
    ref: doc.ref,
    data: doc.data() as PaymentRequestRecord,
  };
}

export const initializePaystackCheckout = onRequest(
  {
    secrets: [paystackSecretKey],
    region: "us-central1",
  },
  async (request, response) => {
    applyCors(response);

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const decodedToken = await verifyBearerToken(request.headers.authorization);
      const paymentRequestId = String(request.body?.paymentRequestId || "");

      if (!paymentRequestId) {
        response.status(400).json({ error: "paymentRequestId is required." });
        return;
      }

      const requestRef = db.collection(COLLECTIONS.PAYMENT_REQUESTS).doc(paymentRequestId);
      const requestDoc = await requestRef.get();

      if (!requestDoc.exists) {
        response.status(404).json({ error: "Payment request not found." });
        return;
      }

      const paymentRequest = requestDoc.data() as PaymentRequestRecord;

      if (paymentRequest.provider !== "paystack") {
        response.status(400).json({ error: "This request is not configured for Paystack." });
        return;
      }

      try {
        await assertPaymentRequestMatchesTenant(paymentRequest, decodedToken.uid);
      } catch (validationError) {
        const message = validationError instanceof Error ? validationError.message : "Payment request validation failed.";
        response.status(403).json({ error: message });
        return;
      }

      if (paymentRequest.status === "paid") {
        response.status(409).json({ error: "Payment request is already paid." });
        return;
      }

      if (paymentRequest.checkoutUrl) {
        response.status(200).json({ checkoutUrl: paymentRequest.checkoutUrl });
        return;
      }

      const email = decodedToken.email;

      if (!email) {
        response.status(400).json({ error: "Your account needs an email before online checkout can start." });
        return;
      }

      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey.value()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(Number(paymentRequest.amount || 0) * 100),
          currency: paymentRequest.currency,
          reference: paymentRequest.providerReference,
          callback_url: `${appWebOrigin.value()}/tenant/rent-status`,
          metadata: {
            paymentRequestId,
            tenantId: paymentRequest.tenantId,
            ownerId: paymentRequest.ownerId,
          },
        }),
      });

      const payload = (await paystackResponse.json()) as PaystackInitializeResponse;

      if (!paystackResponse.ok || !payload.status || !payload.data?.authorization_url) {
        response.status(502).json({
          error: payload.message || "Could not initialize Paystack checkout.",
        });
        return;
      }

      await requestRef.update({
        checkoutUrl: payload.data.authorization_url,
        providerAccessCode: payload.data.access_code,
        status: "pending",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      response.status(200).json({ checkoutUrl: payload.data.authorization_url });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Could not initialize checkout." });
    }
  }
);

export const paystackWebhook = onRequest(
  {
    secrets: [paystackWebhookSecret],
    region: "us-central1",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method not allowed");
      return;
    }

    const signature = String(request.headers["x-paystack-signature"] || "");
    const expectedSignature = createHmac("sha512", paystackWebhookSecret.value())
      .update(request.rawBody)
      .digest("hex");

    if (!signature || signature !== expectedSignature) {
      response.status(401).send("Invalid signature");
      return;
    }

    const payload = request.body as PaystackWebhookPayload;

    if (payload.event !== "charge.success" || payload.data?.status !== "success") {
      response.status(200).send("ignored");
      return;
    }

    const reference = payload.data.reference;

    if (!reference) {
      response.status(400).send("missing reference");
      return;
    }

    const paymentRequestRecord = await findPaymentRequestByReference(reference);

    if (!paymentRequestRecord) {
      response.status(404).send("payment request not found");
      return;
    }

    const paidAmount = Number(payload.data.amount || 0) / 100;
    const now = admin.firestore.FieldValue.serverTimestamp();

    try {
      await db.runTransaction(async (transaction) => {
        const requestSnapshot = await transaction.get(paymentRequestRecord.ref);

        if (!requestSnapshot.exists) {
          throw new Error("payment request disappeared during transaction");
        }

        const paymentRequest = requestSnapshot.data() as PaymentRequestRecord;

        if (paymentRequest.status === "paid") {
          return;
        }

        if (Math.round(paidAmount * 100) !== Math.round(Number(paymentRequest.amount || 0) * 100)) {
          transaction.update(paymentRequestRecord.ref, {
            status: "failed",
            notes: "Paystack webhook amount did not match the payment request amount.",
            updatedAt: now,
          });
          throw new Error("amount mismatch");
        }

        const paymentRef = db.collection(COLLECTIONS.PAYMENTS).doc();
        const receiptNumber = generateReceiptNumber();

        transaction.set(paymentRef, {
          ownerId: paymentRequest.ownerId,
          tenantId: paymentRequest.tenantId,
          propertyId: paymentRequest.propertyId,
          buildingId: paymentRequest.buildingId,
          roomId: paymentRequest.roomId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          paymentPurpose: paymentRequest.paymentPurpose,
          paymentMethod: toPaymentMethod(payload.data?.channel || payload.data?.authorization?.channel),
          paymentStatus: "confirmed",
          paymentDate: (payload.data?.paid_at || new Date().toISOString()).slice(0, 10),
          referenceNumber: reference,
          receiptNumber,
          receiptIssuedAt: payload.data?.paid_at || new Date().toISOString(),
          provider: "paystack",
          providerTransactionId: payload.data?.id ? String(payload.data.id) : "",
          providerReference: reference,
          providerResponse: payload.data?.gateway_response || "success",
          notes: "Confirmed by Paystack webhook.",
          createdAt: now,
        });

        transaction.update(paymentRequestRecord.ref, {
          status: "paid",
          relatedPaymentId: paymentRef.id,
          providerTransactionId: payload.data?.id ? String(payload.data.id) : "",
          providerResponse: payload.data?.gateway_response || "success",
          updatedAt: now,
        });

        if (paymentRequest.tenantUserId) {
          const notificationRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
          transaction.set(notificationRef, {
            userId: paymentRequest.tenantUserId,
            ownerId: paymentRequest.ownerId,
            tenantId: paymentRequest.tenantId,
            title: "Payment confirmed",
            message: `Your ${paymentRequest.currency} ${Number(paymentRequest.amount || 0).toLocaleString()} online payment has been confirmed. Your receipt ${receiptNumber} is ready.`,
            type: "payment_received",
            isRead: false,
            createdAt: now,
          });
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === "amount mismatch") {
        response.status(400).send("amount mismatch");
        return;
      }

      console.error(error);
      response.status(500).send("webhook processing failed");
      return;
    }

    response.status(200).send("ok");
  }
);

