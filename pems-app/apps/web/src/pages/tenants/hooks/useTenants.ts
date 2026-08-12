import { useEffect, useState } from "react";
import {
  createTenant,
  deleteTenant,
  getBuildingsByOwner,
  getPropertiesByOwner,
  getRoomsByOwner,
  getTenantsByOwner,
  updateTenant,
  updateTenantProfilePermission,
  getFriendlyDataError,
} from "../../../../../../packages/firebase";
import type {
  Building,
  Property,
  Room,
  Tenant,
} from "../../../../../../packages/models";

export interface TenantFormData {
  userId: string;
  propertyId: string;
  buildingId: string;
  roomId: string;
  fullName: string;
  email: string;
  phone: string;
  ghanaCardNumber: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: string;
  rentAdvanceMonths: string;
  securityDeposit: string;
  nextRentDueDate: string;
}

const initialFormData: TenantFormData = {
  userId: "",
  propertyId: "",
  buildingId: "",
  roomId: "",
  fullName: "",
  email: "",
  phone: "",
  ghanaCardNumber: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  leaseStartDate: "",
  leaseEndDate: "",
  monthlyRent: "",
  rentAdvanceMonths: "0",
  securityDeposit: "0",
  nextRentDueDate: "",
};

export function useTenants(ownerId?: string) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState<TenantFormData>(initialFormData);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    if (!ownerId) return;

    const [tenantData, propertyData, buildingData, roomData] =
      await Promise.all([
        getTenantsByOwner(ownerId),
        getPropertiesByOwner(ownerId),
        getBuildingsByOwner(ownerId),
        getRoomsByOwner(ownerId),
      ]);

    setTenants(tenantData);
    setProperties(propertyData);
    setBuildings(buildingData);
    setRooms(roomData);
  }

  useEffect(() => {
    loadData();
  }, [ownerId]);

  function updateField<K extends keyof TenantFormData>(
    key: K,
    value: TenantFormData[K]
  ) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "propertyId") {
        next.buildingId = "";
        next.roomId = "";
      }

      if (key === "buildingId") {
        next.roomId = "";
      }

      if (key === "roomId") {
        const selectedRoom = rooms.find((room) => room.id === value);

        if (selectedRoom) {
          next.monthlyRent = String(selectedRoom.monthlyRent);
        }
      }

      return next;
    });
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingTenant(null);
    setShowForm(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startCreateForRoom(room: Room) {
    setEditingTenant(null);
    setFormData({
      ...initialFormData,
      propertyId: room.propertyId,
      buildingId: room.buildingId,
      roomId: room.id,
      monthlyRent: String(room.monthlyRent),
    });
    setShowForm(true);
  }

  function startEdit(tenant: Tenant) {
    setEditingTenant(tenant);
    setShowForm(true);

    setFormData({
      userId: tenant.userId || "",
      propertyId: tenant.propertyId,
      buildingId: tenant.buildingId,
      roomId: tenant.roomId,
      fullName: tenant.fullName,
      email: tenant.email || "",
      phone: tenant.phone,
      ghanaCardNumber: tenant.ghanaCardNumber || "",
      occupation: tenant.occupation || "",
      emergencyContactName: tenant.emergencyContactName || "",
      emergencyContactPhone: tenant.emergencyContactPhone || "",
      leaseStartDate: tenant.leaseStartDate,
      leaseEndDate: tenant.leaseEndDate || "",
      monthlyRent: String(tenant.monthlyRent),
      rentAdvanceMonths: String(tenant.rentAdvanceMonths || 0),
      securityDeposit: String(tenant.securityDeposit || 0),
      nextRentDueDate: tenant.nextRentDueDate,
    });
  }

  async function saveTenant() {
    if (!ownerId) return;

    setLoading(true);
    setError("");

    try {
      const tenantData = {
        userId: formData.userId || "",
        ownerId,
        propertyId: formData.propertyId,
        buildingId: formData.buildingId,
        roomId: formData.roomId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        ghanaCardNumber: formData.ghanaCardNumber,
        occupation: formData.occupation,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        leaseStartDate: formData.leaseStartDate,
        leaseEndDate: formData.leaseEndDate,
        monthlyRent: Number(formData.monthlyRent),
        rentAdvanceMonths: Number(formData.rentAdvanceMonths || 0),
        securityDeposit: Number(formData.securityDeposit || 0),
        nextRentDueDate: formData.nextRentDueDate,
      };

      if (editingTenant) {
        await updateTenant(editingTenant.id, tenantData, editingTenant.roomId);
      } else {
        await createTenant(tenantData);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(getFriendlyDataError(err, "Could not save this tenant."));
    } finally {
      setLoading(false);
    }
  }


  async function setTenantProfileUpdatePermission(
    tenant: Tenant,
    profileUpdateAllowed: boolean
  ) {
    try {
      setError("");
      await updateTenantProfilePermission(tenant.id, profileUpdateAllowed);
      await loadData();
    } catch (err) {
      setError(getFriendlyDataError(err, "Could not update tenant permissions."));
    }
  }
  async function removeTenant(tenant: Tenant) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tenant?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteTenant(tenant.id, tenant.roomId);
      await loadData();
    } catch (err) {
      setError(getFriendlyDataError(err, "Could not delete this tenant."));
    }
  }

  function getPropertyName(propertyId: string) {
    return properties.find((p) => p.id === propertyId)?.name || "Unknown Property";
  }

  function getBuildingName(buildingId: string) {
    return buildings.find((b) => b.id === buildingId)?.name || "Unknown Building";
  }

  function getRoomNumber(roomId: string) {
    return rooms.find((r) => r.id === roomId)?.roomNumber || "Unknown Room";
  }

  function getBuildingsForProperty(propertyId: string) {
    return buildings.filter((building) => building.propertyId === propertyId);
  }

  function getAvailableRooms(buildingId: string) {
    return rooms.filter(
      (room) =>
        room.buildingId === buildingId &&
        (room.status === "vacant" || room.id === editingTenant?.roomId)
    );
  }

  return {
    tenants,
    properties,
    buildings,
    rooms,
    formData,
    editingTenant,
    showForm,
    loading,
    error,
    updateField,
    startCreate,
    startCreateForRoom,
    startEdit,
    resetForm,
    saveTenant,
    removeTenant,
    setTenantProfileUpdatePermission,
    getPropertyName,
    getBuildingName,
    getRoomNumber,
    getBuildingsForProperty,
    getAvailableRooms,
  };
}
