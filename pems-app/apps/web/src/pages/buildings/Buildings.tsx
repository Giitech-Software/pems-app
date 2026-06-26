import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import BuildingCard from "./BuildingCard";
import BuildingEmptyState from "./BuildingEmptyState";
import BuildingForm from "./BuildingForm";
import { useBuildings } from "./hooks/useBuildings";

export default function Buildings() {
  const { firebaseUser } = useAuth();

  const {
    buildings,
    properties,
    formData,
    editingBuilding,
    showForm,
    loading,
    updateField,
    startCreate,
    startEdit,
    resetForm,
    saveBuilding,
    removeBuilding,
    getPropertyName,
  } = useBuildings(firebaseUser?.uid);

  return (
    <DashboardLayout>
      <PageHeader
        title="Buildings"
        subtitle="Manage property blocks, floors, and building structures."
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
          disabled={properties.length === 0}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showForm ? "Close Form" : "Add Building"}
        </button>
      </div>

      {showForm && (
        <BuildingForm
          formData={formData}
          properties={properties}
          loading={loading}
          isEditing={!!editingBuilding}
          onChange={updateField}
          onSubmit={saveBuilding}
          onCancel={resetForm}
        />
      )}

      <section className="mt-8">
        {buildings.length === 0 ? (
          <BuildingEmptyState
            hasProperties={properties.length > 0}
            onAdd={startCreate}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                propertyName={getPropertyName(building.propertyId)}
                onEdit={startEdit}
                onDelete={removeBuilding}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}