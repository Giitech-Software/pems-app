interface PaymentEmptyStateProps {
  hasTenants: boolean;
  onAdd: () => void;
}

export default function PaymentEmptyState({
  hasTenants,
  onAdd,
}: PaymentEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-xl font-bold text-slate-950">No payments yet</h3>

      <p className="mx-auto mt-2 max-w-xl text-slate-500">
        {hasTenants
          ? "Record your first rent payment, deposit, utility bill, or maintenance fee."
          : "Add an active tenant first before recording payments."}
      </p>

      {hasTenants && (
        <button
          onClick={onAdd}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Record First Payment
        </button>
      )}
    </div>
  );
}