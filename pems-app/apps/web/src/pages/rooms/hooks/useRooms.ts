import { useEffect, useState } from "react";
import {
  createRoom,
  deleteRoom,
  getBuildingsByOwner,
  getPropertiesByOwner,
  getRoomsByOwner,
  updateRoom,
} from "../../../../../../packages/firebase";
import type {
  Building,
  Property,
  Room,
  RoomStatus,
} from "../../../../../../packages/models";

export interface RoomFormData {
  propertyId: string;
  buildingId: string;
  roomNumber: string;
  roomType: "single" | "double" | "shop" | "office" | "apartment" | "other";
  monthlyRent: string;
  status: RoomStatus;
}

const initialFormData: RoomFormData = {
  propertyId: "",
  buildingId: "",
  roomNumber: "",
  roomType: "single",
  monthlyRent: "",
  status: "vacant",
};

export function useRooms(ownerId?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    if (!ownerId) return;

    const [roomData, propertyData, buildingData] = await Promise.all([
      getRoomsByOwner(ownerId),
      getPropertiesByOwner(ownerId),
      getBuildingsByOwner(ownerId),
    ]);

    setRooms(roomData);
    setProperties(propertyData);
    setBuildings(buildingData);
  }

  useEffect(() => {
    loadData();
  }, [ownerId]);

  function updateField<K extends keyof RoomFormData>(
    key: K,
    value: RoomFormData[K]
  ) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "propertyId") {
        next.buildingId = "";
      }

      return next;
    });
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingRoom(null);
    setShowForm(false);
  }

  function startCreate() {
    const firstPropertyId = properties[0]?.id || "";
    const firstBuildingId =
      buildings.find((building) => building.propertyId === firstPropertyId)
        ?.id || "";

    setEditingRoom(null);
    setFormData({
      ...initialFormData,
      propertyId: firstPropertyId,
      buildingId: firstBuildingId,
    });
    setShowForm(true);
  }

  function startEdit(room: Room) {
    setEditingRoom(room);
    setShowForm(true);

    setFormData({
      propertyId: room.propertyId,
      buildingId: room.buildingId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      monthlyRent: String(room.monthlyRent),
      status: room.status,
    });
  }

  async function saveRoom() {
    if (!ownerId) return;

    setLoading(true);

    try {
      const roomData = {
        ownerId,
        propertyId: formData.propertyId,
        buildingId: formData.buildingId,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        monthlyRent: Number(formData.monthlyRent),
        status: formData.status,
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
      } else {
        await createRoom(roomData);
      }

      resetForm();
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  async function removeRoom(room: Room) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) return;

    await deleteRoom(room.id, room.propertyId, room.buildingId);
    await loadData();
  }

  function getPropertyName(propertyId: string) {
    return (
      properties.find((property) => property.id === propertyId)?.name ||
      "Unknown Property"
    );
  }

  function getBuildingName(buildingId: string) {
    return (
      buildings.find((building) => building.id === buildingId)?.name ||
      "Unknown Building"
    );
  }

  function getBuildingsForProperty(propertyId: string) {
    return buildings.filter((building) => building.propertyId === propertyId);
  }

  return {
    rooms,
    properties,
    buildings,
    formData,
    editingRoom,
    showForm,
    loading,
    updateField,
    startCreate,
    startEdit,
    resetForm,
    saveRoom,
    removeRoom,
    getPropertyName,
    getBuildingName,
    getBuildingsForProperty,
  };
}