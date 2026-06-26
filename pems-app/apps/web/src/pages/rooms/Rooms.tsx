import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import RoomCard from "./RoomCard";
import RoomEmptyState from "./RoomEmptyState";
import RoomForm from "./RoomForm";
import { useRooms } from "./hooks/useRooms";

export default function Rooms() {
  const { firebaseUser } = useAuth();

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

  return (
    <DashboardLayout>
      <PageHeader
        title="Rooms"
        subtitle="Track vacant, occupied, reserved, and maintenance rooms."
      />

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
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showForm ? "Close Form" : "Add Room"}
        </button>
      </div>

      {showForm && (
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
      )}

      <section className="mt-8">
        {rooms.length === 0 ? (
          <RoomEmptyState
            hasBuildings={buildings.length > 0}
            onAdd={startCreate}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                propertyName={getPropertyName(room.propertyId)}
                buildingName={getBuildingName(room.buildingId)}
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