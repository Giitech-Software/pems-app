import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import RoomCard from "./RoomCard";
import RoomEmptyState from "./RoomEmptyState";
import RoomForm from "./RoomForm";
import { useRooms } from "./hooks/useRooms";
import type { Room } from "../../../../../packages/models";

interface RoomsLocationState {
  buildingId?: string;
}

export default function Rooms() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<HTMLDivElement | null>(null);

  const {
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
  } = useRooms(firebaseUser?.uid);

  const locationState = location.state as RoomsLocationState | null;
  const selectedBuildingId = locationState?.buildingId || "";
  const selectedBuilding = buildings.find((building) => building.id === selectedBuildingId);
  const displayedRooms = useMemo(
    () =>
      selectedBuildingId
        ? rooms.filter((room) => room.buildingId === selectedBuildingId)
        : rooms,
    [rooms, selectedBuildingId]
  );

  useEffect(() => {
    if (!showForm) return;

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [showForm, editingRoom]);

  function handleAssignTenant(room: Room) {
    if (room.status !== "vacant") return;

    navigate("/tenants", {
      state: { assignRoomId: room.id },
    });
  }

  function clearBuildingFilter() {
    navigate("/rooms", { replace: true, state: null });
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Rooms"
        subtitle="Track vacant, occupied, reserved, and maintenance rooms."
      />

      {selectedBuildingId && (
        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Filtered rooms</p>
            <p className="mt-1 text-sm text-slate-600">
              Showing rooms for {selectedBuilding?.name || "the selected building"}.
            </p>
          </div>
          <button
            type="button"
            onClick={clearBuildingFilter}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-100"
          >
            Show All Rooms
          </button>
        </section>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              startCreate();
            }
          }}
          disabled={buildings.length === 0}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {showForm ? "Close Form" : "Add Room"}
        </button>
      </div>

      {showForm && (
        <div ref={formRef}>
          <RoomForm
            formData={formData}
            properties={properties}
            buildings={buildings}
            loading={loading}
            isEditing={!!editingRoom}
            onChange={updateField}
            onSubmit={saveRoom}
            onCancel={resetForm}
            getBuildingsForProperty={getBuildingsForProperty}
          />
        </div>
      )}

      <section className="mt-8">
        {displayedRooms.length === 0 ? (
          <RoomEmptyState
            hasBuildings={buildings.length > 0}
            onAdd={startCreate}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                propertyName={getPropertyName(room.propertyId)}
                buildingName={getBuildingName(room.buildingId)}
                onAssignTenant={handleAssignTenant}
                onEdit={startEdit}
                onDelete={removeRoom}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}