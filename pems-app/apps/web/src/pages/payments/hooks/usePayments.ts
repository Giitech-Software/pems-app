import { useEffect, useState } from "react";
import {
  createPayment,
  getPaymentsByOwner,
  getTenantsByOwner,
  getFriendlyDataError,
} from "../../../../../../packages/firebase";
import type {
  Payment,
  PaymentMethod,
  PaymentPurpose,
  Tenant,
} from "../../../../../../packages/models";
import { getTenantDisplayId } from "../../../../../../packages/models";
import { generateReceiptNumber } from "../../../utils/receipt";

export interface PaymentFormData {
  tenantId: string;
  amount: string;
  paymentPurpose: PaymentPurpose;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  periodCoveredFrom: string;
  periodCoveredTo: string;
  referenceNumber: string;
  receiptNumber: string;
  notes: string;
}

const today = new Date().toISOString().split("T")[0];

const initialFormData: PaymentFormData = {
  tenantId: "",
  amount: "",
  paymentPurpose: "rent",
  paymentMethod: "cash",
  paymentDate: today,
  periodCoveredFrom: "",
  periodCoveredTo: "",
  referenceNumber: "",
  receiptNumber: "",
  notes: "",
};

export function usePayments(ownerId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    if (!ownerId) return;

    const [paymentData, tenantData] = await Promise.all([
      getPaymentsByOwner(ownerId),
      getTenantsByOwner(ownerId),
    ]);

    setPayments(paymentData);
    setTenants(tenantData.filter((tenant) => tenant.isActive));
  }

  useEffect(() => {
    loadData();
  }, [ownerId]);

  function updateField<K extends keyof PaymentFormData>(
    key: K,
    value: PaymentFormData[K]
  ) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "tenantId") {
        const selectedTenant = tenants.find((tenant) => tenant.id === value);
        if (selectedTenant) {
          next.amount = String(selectedTenant.monthlyRent);
        }
      }

      return next;
    });
  }

  function resetForm() {
    setFormData(initialFormData);
    setShowForm(false);
  }

  function startCreate() {
    setFormData({
      ...initialFormData,
      tenantId: tenants[0]?.id || "",
      amount: tenants[0]?.monthlyRent ? String(tenants[0].monthlyRent) : "",
      receiptNumber: generateReceiptNumber(),
    });
    setShowForm(true);
  }

  async function savePayment() {
    if (!ownerId) return;

    const selectedTenant = tenants.find(
      (tenant) => tenant.id === formData.tenantId
    );

    if (!selectedTenant) {
      alert("Please select a tenant.");
      return;
    }

    const receiptNumber = formData.receiptNumber.trim() || generateReceiptNumber();

    setLoading(true);
    setError("");

    try {
      await createPayment({
        ownerId,
        tenantId: selectedTenant.id,
        tenantUserId: selectedTenant.userId,
        propertyId: selectedTenant.propertyId,
        buildingId: selectedTenant.buildingId,
        roomId: selectedTenant.roomId,
        amount: Number(formData.amount),
        currency: "GHS",
        paymentPurpose: formData.paymentPurpose,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "confirmed",
        paymentDate: formData.paymentDate,
        periodCoveredFrom: formData.periodCoveredFrom,
        periodCoveredTo: formData.periodCoveredTo,
        referenceNumber: formData.referenceNumber,
        receiptNumber,
        receiptIssuedAt: new Date().toISOString(),
        notes: formData.notes,
      });

      resetForm();
      await loadData();
    } catch (err) {
      setError(getFriendlyDataError(err, "Could not save this payment."));
    } finally {
      setLoading(false);
    }
  }

  function getTenantName(tenantId: string) {
    const tenant = tenants.find((tenant) => tenant.id === tenantId);

    return tenant
      ? `${getTenantDisplayId(tenant)} - ${tenant.fullName}`
      : "Unknown Tenant";
  }

  function getTenantById(tenantId: string) {
    return tenants.find((tenant) => tenant.id === tenantId) || null;
  }

  return {
    payments,
    tenants,
    formData,
    showForm,
    loading,
    error,
    updateField,
    startCreate,
    resetForm,
    savePayment,
    getTenantName,
    getTenantById,
  };
}
