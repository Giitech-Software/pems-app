import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "./PropertyCard";
import PropertyEmptyState from "./PropertyEmptyState";
import PropertyForm from "./PropertyForm";
import { useProperties } from "./hooks/useProperties";
import type { Property } from "../../../../../packages/models";

export default function Properties() {
  const { firebaseUser, userProfile } = useAuth();
  const canManage = userProfile?.role === "landlord";
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement | null>(null);

  const {
    properties,
    formData,
    editingProperty,
    showForm,
    loading,
    error,
    updateField,
    startCreate,
    startEdit,
    resetForm,
    saveProperty,
    removeProperty,
  } = useProperties(firebaseUser?.uid);

  useEffect(() => {
    if (!showForm) return;

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [showForm, editingProperty]);

  function handleViewDetails(property: Property) {
    navigate(`/properties/${property.id}`);
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Properties"
        subtitle="Add, view, and manage all your registered properties."
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
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          {showForm ? "Close Form" : "Add Property"}
        </button>
      </div>}

      {canManage && showForm && (
        <div ref={formRef}>
          <PropertyForm
            formData={formData}
            loading={loading}
            isEditing={!!editingProperty}
            onChange={updateField}
            onSubmit={saveProperty}
            onCancel={resetForm}
          />
        </div>
      )}

      <section className="mt-8">
        {properties.length === 0 ? (
          <PropertyEmptyState onAdd={startCreate} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={handleViewDetails}
                onEdit={canManage ? startEdit : undefined}
                onDelete={canManage ? removeProperty : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
