import { useEffect, useState } from "react";
import {
  createBuilding,
  deleteBuilding,
  getBuildingsByOwner,
  getPropertiesByOwner,
  updateBuilding,
  getFriendlyDataError,
} from "../../../../../../packages/firebase";
import type { Building, Property } from "../../../../../../packages/models";

export interface BuildingFormData {
  propertyId: string;
  name: string;
  numberOfFloors: string;
}

const initialFormData: BuildingFormData = {
  propertyId: "",
  name: "",
  numberOfFloors: "1",
};

export function useBuildings(ownerId?: string) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<BuildingFormData>(initialFormData);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    if (!ownerId) return;

    const [buildingData, propertyData] = await Promise.all([
      getBuildingsByOwner(ownerId),
      getPropertiesByOwner(ownerId),
    ]);

    setBuildings(buildingData);
    setProperties(propertyData);
  }

  useEffect(() => {
    loadData();
  }, [ownerId]);

  function updateField<K extends keyof BuildingFormData>(
    key: K,
    value: BuildingFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingBuilding(null);
    setShowForm(false);
  }

  function startCreate() {
    setEditingBuilding(null);
    setFormData({
      ...initialFormData,
      propertyId: properties[0]?.id || "",
    });
    setShowForm(true);
  }

  function startEdit(building: Building) {
    setEditingBuilding(building);
    setShowForm(true);

    setFormData({
      propertyId: building.propertyId,
      name: building.name,
      numberOfFloors: String(building.numberOfFloors),
    });
  }

  async function saveBuilding() {
    if (!ownerId) return;

    setLoading(true);
    setError("");

    try {
      const buildingData = {
        ownerId,
        propertyId: formData.propertyId,
        name: formData.name,
        numberOfFloors: Number(formData.numberOfFloors),
      };

      if (editingBuilding) {
        await updateBuilding(editingBuilding.id, buildingData);
      } else {
        await createBuilding(buildingData);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(getFriendlyDataError(err, "Could not save this building."));
    } finally {
      setLoading(false);
    }
  }

  async function removeBuilding(building: Building) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this building?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteBuilding(building.id, building.propertyId);
      await loadData();
    } catch (err) {
      setError(getFriendlyDataError(err, "Could not delete this building."));
    }
  }

  function getPropertyName(propertyId: string) {
    return properties.find((property) => property.id === propertyId)?.name || "Unknown Property";
  }

  return {
    buildings,
    properties,
    formData,
    editingBuilding,
    showForm,
    loading,
    error,
    updateField,
    startCreate,
    startEdit,
    resetForm,
    saveBuilding,
    removeBuilding,
    getPropertyName,
  };
}
