import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import PropertyEmptyState from "./PropertyEmptyState";
import PropertyForm from "./PropertyForm";
import { useProperties } from "./hooks/useProperties";

export default function Properties() {
  const { firebaseUser } = useAuth();

  const {
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
  } = useProperties(firebaseUser?.uid);

  return (
    <DashboardLayout>
      <PageHeader
        title="Properties"
        subtitle="Add, view, and manage all your registered properties."
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
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          {showForm ? "Close Form" : "Add Property"}
        </button>
      </div>

      {showForm && (
        <PropertyForm
          formData={formData}
          loading={loading}
          isEditing={!!editingProperty}
          onChange={updateField}
          onSubmit={saveProperty}
          onCancel={resetForm}
        />
      )}

      <section className="mt-8">
        {properties.length === 0 ? (
          <PropertyEmptyState onAdd={startCreate} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={startEdit}
                onDelete={removeProperty}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}