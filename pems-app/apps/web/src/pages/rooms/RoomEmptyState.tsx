interface RoomEmptyStateProps {
  hasBuildings: boolean;
  onAdd: () => void;
}

export default function RoomEmptyState({ hasBuildings, onAdd }: RoomEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-xl font-bold text-slate-950">No rooms yet</h3>

      <p className="mx-auto mt-2 max-w-xl text-slate-500">
        {hasBuildings
          ? "Add rooms under your buildings to start tracking vacancy, tenants, and rent."
          : "Create a property and building first before adding rooms."}
      </p>

      {hasBuildings && (
        <button
          onClick={onAdd}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Add First Room
        </button>
      )}
    </div>
  );
}