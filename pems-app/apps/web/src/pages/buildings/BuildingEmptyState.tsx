interface BuildingEmptyStateProps {
  hasProperties: boolean;
  onAdd: () => void;
}

export default function BuildingEmptyState({
  hasProperties,
  onAdd,
}: BuildingEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-xl font-bold text-slate-950">No buildings yet</h3>

      <p className="mx-auto mt-2 max-w-xl text-slate-500">
        {hasProperties
          ? "Add your first building or block under one of your properties."
          : "Create a property first before adding buildings."}
      </p>

      {hasProperties && (
        <button
          onClick={onAdd}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Add First Building
        </button>
      )}
    </div>
  );
}