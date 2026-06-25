import { useEffect, useState } from "react";
import {
  createProperty,
  deleteProperty,
  getPropertiesByOwner,
  updateProperty,
} from "../../../../../../packages/firebase";
import type {
  Property,
  PropertyType,
  PropertyStatus,
} from "../../../../../../packages/models";

export interface PropertyFormData {
  propertyCode: string;
  name: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: string;
  area: string;
  city: string;
  region: string;
  country: string;
  latitude: string;
  longitude: string;
  description: string;
}

const initialFormData: PropertyFormData = {
  propertyCode: "",
  name: "",
  propertyType: "apartment",
  status: "active",
  address: "",
  area: "",
  city: "Accra",
  region: "Greater Accra",
  country: "Ghana",
  latitude: "",
  longitude: "",
  description: "",
};

export function useProperties(ownerId?: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadProperties() {
    if (!ownerId) return;
    const data = await getPropertiesByOwner(ownerId);
    setProperties(data);
  }

  useEffect(() => {
    loadProperties();
  }, [ownerId]);

  function updateField<K extends keyof PropertyFormData>(
    key: K,
    value: PropertyFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingProperty(null);
    setShowForm(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(property: Property) {
    setEditingProperty(property);
    setShowForm(true);

    setFormData({
      propertyCode: property.propertyCode || "",
      name: property.name,
      propertyType: property.propertyType,
      status: property.status || "active",
      address: property.address,
      area: property.area || "",
      city: property.city,
      region: property.region || "",
      country: property.country,
      latitude: property.latitude ? String(property.latitude) : "",
      longitude: property.longitude ? String(property.longitude) : "",
      description: property.description || "",
    });
  }

  async function saveProperty() {
  if (!ownerId) return;

  setLoading(true);

  try {
    const propertyData = {
      ownerId,
      propertyCode: formData.propertyCode,
      name: formData.name,
      propertyType: formData.propertyType,
      status: formData.status,
      address: formData.address,
      area: formData.area,
      city: formData.city,
      region: formData.region,
      country: formData.country,
      description: formData.description,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
    };

    if (editingProperty) {
      await updateProperty(editingProperty.id, propertyData);
    } else {
      await createProperty(propertyData);
    }

    resetForm();
    await loadProperties();
  } finally {
    setLoading(false);
  }
}

  async function removeProperty(propertyId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    );

    if (!confirmed) return;

    await deleteProperty(propertyId);
    await loadProperties();
  }

  return {
    properties,
    formData,
    editingProperty,
    showForm,
    loading,
    updateField,
    startCreate,
    startEdit,
    resetForm,
    saveProperty,
    removeProperty,
  };
}