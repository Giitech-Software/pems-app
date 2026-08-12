import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import BuildingCard from "./BuildingCard";
import BuildingEmptyState from "./BuildingEmptyState";
import BuildingForm from "./BuildingForm";
import { useBuildings } from "./hooks/useBuildings";
import type { Building } from "../../../../../packages/models";

export default function Buildings() {
  const { firebaseUser, userProfile } = useAuth();
  const canManage = userProfile?.role === "landlord";
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement | null>(null);

  const {
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
  } = useBuildings(firebaseUser?.uid);

  useEffect(() => {
    if (!showForm) return;

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [showForm, editingBuilding]);

  function handleViewRooms(building: Building) {
    navigate("/rooms", {
      state: { buildingId: building.id },
    });
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Buildings"
        subtitle="Manage property blocks, floors, and building structures."
      />
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      {canManage && <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              startCreate();
            }
          }}
          disabled={properties.length === 0}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {showForm ? "Close Form" : "Add Building"}
        </button>
      </div>}

      {canManage && showForm && (
        <div ref={formRef}>
          <BuildingForm
            formData={formData}
            properties={properties}
            loading={loading}
            isEditing={!!editingBuilding}
            onChange={updateField}
            onSubmit={saveBuilding}
            onCancel={resetForm}
          />
        </div>
      )}

      <section className="mt-8">
        {buildings.length === 0 ? (
          <BuildingEmptyState
            hasProperties={properties.length > 0}
            onAdd={startCreate}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                propertyName={getPropertyName(building.propertyId)}
                onViewRooms={handleViewRooms}
                onEdit={canManage ? startEdit : undefined}
                onDelete={canManage ? removeBuilding : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
